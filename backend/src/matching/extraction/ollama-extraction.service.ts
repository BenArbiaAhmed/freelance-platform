import { Injectable, Logger } from '@nestjs/common';
import {
  ExtractedResume,
  ExtractionService,
  ResumeExperience,
} from './extraction.service';

/** Skills the heuristic fallback can recognise when no LLM is available. */
const KNOWN_SKILLS = [
  'javascript',
  'typescript',
  'react',
  'react native',
  'vue',
  'vue.js',
  'angular',
  'svelte',
  'next.js',
  'nuxt',
  'node.js',
  'nodejs',
  'nestjs',
  'express',
  'graphql',
  'rest',
  'python',
  'django',
  'flask',
  'fastapi',
  'java',
  'spring',
  'kotlin',
  'go',
  'golang',
  'rust',
  'php',
  'laravel',
  'symfony',
  'ruby',
  'rails',
  'c#',
  '.net',
  'c++',
  'sql',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'elasticsearch',
  'qdrant',
  'docker',
  'kubernetes',
  'terraform',
  'ansible',
  'aws',
  'gcp',
  'azure',
  'devops',
  'ci/cd',
  'git',
  'linux',
  'figma',
  'sketch',
  'adobe xd',
  'photoshop',
  'illustrator',
  'ui',
  'ux',
  'ui/ux',
  'tailwind',
  'tailwind css',
  'css',
  'html',
  'sass',
  'data engineering',
  'data science',
  'machine learning',
  'deep learning',
  'tensorflow',
  'pytorch',
  'pandas',
  'spark',
  'airflow',
  'kafka',
  'etl',
  'power bi',
  'tableau',
  'excel',
  'seo',
  'wordpress',
];

const EXTRACTION_PROMPT = (
  text: string,
) => `Tu es un extracteur de CV. À partir du texte de CV ci-dessous, renvoie UNIQUEMENT un objet JSON valide, sans texte autour, avec exactement ces clés :
{
  "summary": string,                      // résumé en 1-2 phrases (langue du CV)
  "skills": string[],                     // compétences techniques et outils
  "experiences": [                        // expériences professionnelles
    { "title": string, "company": string, "years": number, "description": string }
  ],
  "education": string[],                  // diplômes / formations
  "yearsOfExperience": number             // total d'années d'expérience (0 si inconnu)
}

Texte du CV :
"""
${text}
"""`;

@Injectable()
export class OllamaExtractionService extends ExtractionService {
  private readonly logger = new Logger(OllamaExtractionService.name);
  private readonly url = process.env.OLLAMA_URL ?? 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_EXTRACTION_MODEL ?? 'qwen2.5:3b';

  async extract(rawText: string): Promise<ExtractedResume> {
    const text = rawText.slice(0, 12000);
    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: 'json',
          options: { temperature: 0 },
          prompt: EXTRACTION_PROMPT(text),
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) {
        throw new Error(`Ollama responded ${response.status}`);
      }
      const data = (await response.json()) as { response?: string };
      const parsed = JSON.parse(data.response ?? '{}') as Record<
        string,
        unknown
      >;
      return this.normalise(parsed, rawText);
    } catch (err) {
      this.logger.warn(
        `LLM extraction unavailable (${
          err instanceof Error ? err.message : String(err)
        }) — falling back to heuristic parsing`,
      );
      return this.heuristic(rawText);
    }
  }

  /** Coerce a (possibly messy) LLM JSON object into ExtractedResume. */
  private normalise(
    raw: Record<string, unknown>,
    rawText: string,
  ): ExtractedResume {
    const skills = this.toStringArray(raw.skills);
    const experiences = Array.isArray(raw.experiences)
      ? (raw.experiences as unknown[])
          .map((exp) => this.normaliseExperience(exp))
          .filter((exp): exp is ResumeExperience => exp !== null)
      : [];
    const education = this.toStringArray(raw.education);
    const summary =
      typeof raw.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : this.fallbackSummary(rawText);
    const years = Number(raw.yearsOfExperience);

    const result: ExtractedResume = {
      summary,
      skills: skills.length ? skills : this.detectSkills(rawText),
      experiences,
      education,
      yearsOfExperience: Number.isFinite(years) && years > 0 ? years : null,
    };
    return result;
  }

  private normaliseExperience(exp: unknown): ResumeExperience | null {
    if (!exp || typeof exp !== 'object') return null;
    const e = exp as Record<string, unknown>;
    const out: ResumeExperience = {
      title: typeof e.title === 'string' ? e.title : undefined,
      company: typeof e.company === 'string' ? e.company : undefined,
      years:
        typeof e.years === 'number' || typeof e.years === 'string'
          ? e.years
          : undefined,
      description:
        typeof e.description === 'string' ? e.description : undefined,
    };
    return out.title || out.company || out.description ? out : null;
  }

  /** No-LLM fallback: keyword skill detection + naive summary/years. */
  private heuristic(rawText: string): ExtractedResume {
    return {
      summary: this.fallbackSummary(rawText),
      skills: this.detectSkills(rawText),
      experiences: [],
      education: [],
      yearsOfExperience: this.detectYears(rawText),
    };
  }

  private detectSkills(text: string): string[] {
    const haystack = ` ${text.toLowerCase()} `;
    const found = KNOWN_SKILLS.filter(
      (skill) =>
        haystack.includes(` ${skill} `) ||
        haystack.includes(`${skill},`) ||
        haystack.includes(`${skill}.`),
    );
    return Array.from(new Set(found));
  }

  private detectYears(text: string): number | null {
    const match = text
      .toLowerCase()
      .match(/(\d{1,2})\s*(?:\+)?\s*(?:ans|years|année|annees)/);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0 && n < 60) return n;
    }
    return null;
  }

  private fallbackSummary(text: string): string {
    return text.replace(/\s+/g, ' ').trim().slice(0, 400);
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return Array.from(
      new Set(
        value
          .filter((v): v is string => typeof v === 'string')
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    );
  }
}
