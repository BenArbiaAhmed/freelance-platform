import {
  ExtractedResume,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from './extraction.service';

/** Skills the heuristic fallback can recognise when no LLM is available. */
export const KNOWN_SKILLS = [
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

/** Keyword-match skills present in the raw CV text. */
export function detectSkills(text: string): string[] {
  const haystack = ` ${text.toLowerCase()} `;
  const found = KNOWN_SKILLS.filter(
    (skill) =>
      haystack.includes(` ${skill} `) ||
      haystack.includes(`${skill},`) ||
      haystack.includes(`${skill}.`),
  );
  return Array.from(new Set(found));
}

/** Best-effort total years of experience parsed from "N ans / N years". */
export function detectYears(text: string): number | null {
  const match = text
    .toLowerCase()
    .match(/(\d{1,2})\s*(?:\+)?\s*(?:ans|years|année|annees)/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > 0 && n < 60) return n;
  }
  return null;
}

/** First ~400 chars of the CV, whitespace-collapsed, as a stand-in summary. */
export function fallbackSummary(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 400);
}

function toStringArray(value: unknown): string[] {
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

/** A trimmed non-empty string, else null. */
function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** An optional trimmed non-empty string, else undefined (for sub-objects). */
function optStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normaliseExperience(exp: unknown): ResumeExperience | null {
  if (!exp || typeof exp !== 'object') return null;
  const e = exp as Record<string, unknown>;
  const out: ResumeExperience = {
    title: optStr(e.title),
    company: optStr(e.company),
    location: optStr(e.location),
    startDate: optStr(e.startDate),
    endDate: optStr(e.endDate),
    years:
      typeof e.years === 'number' || typeof e.years === 'string'
        ? e.years
        : undefined,
    description: optStr(e.description),
  };
  return out.title || out.company || out.description ? out : null;
}

/**
 * Accept education entries as structured objects or as plain strings (the
 * latter is the legacy shape stored before the schema was expanded — still
 * parsed into a `degree` so old rows keep rendering).
 */
function normaliseEducation(edu: unknown): ResumeEducation | null {
  if (typeof edu === 'string') {
    return edu.trim() ? { degree: edu.trim() } : null;
  }
  if (!edu || typeof edu !== 'object') return null;
  const e = edu as Record<string, unknown>;
  const out: ResumeEducation = {
    degree: optStr(e.degree),
    institution: optStr(e.institution),
    field: optStr(e.field),
    year:
      typeof e.year === 'number' || typeof e.year === 'string'
        ? e.year
        : undefined,
  };
  return out.degree || out.institution || out.field ? out : null;
}

function normaliseProject(project: unknown): ResumeProject | null {
  if (!project || typeof project !== 'object') return null;
  const p = project as Record<string, unknown>;
  const out: ResumeProject = {
    name: optStr(p.name),
    description: optStr(p.description),
    technologies: toStringArray(p.technologies),
  };
  if (!out.technologies?.length) delete out.technologies;
  return out.name || out.description ? out : null;
}

function normaliseArray<T>(
  value: unknown,
  map: (item: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(map).filter((item): item is T => item !== null);
}

/**
 * Coerce a (possibly messy) LLM JSON object into a valid ExtractedResume,
 * filling any missing/empty field from the raw CV text so the result is always
 * usable regardless of which LLM produced it.
 */
export function normaliseExtracted(
  raw: Record<string, unknown>,
  rawText: string,
): ExtractedResume {
  const skills = toStringArray(raw.skills);
  const summary =
    typeof raw.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : fallbackSummary(rawText);
  const years = Number(raw.yearsOfExperience);

  return {
    name: str(raw.name),
    title: str(raw.title),
    email: str(raw.email),
    phone: str(raw.phone),
    location: str(raw.location),
    links: toStringArray(raw.links),
    summary,
    skills: skills.length ? skills : detectSkills(rawText),
    experiences: normaliseArray(raw.experiences, normaliseExperience),
    education: normaliseArray(raw.education, normaliseEducation),
    certifications: toStringArray(raw.certifications),
    languages: toStringArray(raw.languages),
    projects: normaliseArray(raw.projects, normaliseProject),
    yearsOfExperience: Number.isFinite(years) && years > 0 ? years : null,
  };
}

/** No-LLM fallback: keyword skill detection + naive summary/years. */
export function heuristicExtract(rawText: string): ExtractedResume {
  return {
    name: null,
    title: null,
    email: null,
    phone: null,
    location: null,
    links: [],
    summary: fallbackSummary(rawText),
    skills: detectSkills(rawText),
    experiences: [],
    education: [],
    certifications: [],
    languages: [],
    projects: [],
    yearsOfExperience: detectYears(rawText),
  };
}
