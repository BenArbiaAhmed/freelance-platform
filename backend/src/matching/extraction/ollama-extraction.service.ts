import { Injectable, Logger } from '@nestjs/common';
import { ExtractedResume, ExtractionService } from './extraction.service';
import { heuristicExtract, normaliseExtracted } from './extraction.heuristic';

const EXTRACTION_PROMPT = (
  text: string,
) => `Tu es un extracteur de CV. À partir du texte de CV ci-dessous, renvoie UNIQUEMENT un objet JSON valide, sans texte autour, avec exactement ces clés. Utilise null pour les champs scalaires absents et [] pour les listes absentes ; n'invente rien.
{
  "name": string,                         // nom complet
  "title": string,                        // intitulé professionnel
  "email": string,
  "phone": string,
  "location": string,                     // ville / pays
  "links": string[],                      // portfolio, LinkedIn, GitHub, URLs
  "summary": string,                      // résumé en 1-2 phrases (langue du CV)
  "skills": string[],                     // compétences techniques et outils
  "experiences": [                        // expériences professionnelles
    { "title": string, "company": string, "location": string, "startDate": string, "endDate": string, "years": number, "description": string }
  ],
  "education": [                          // diplômes / formations
    { "degree": string, "institution": string, "field": string, "year": number }
  ],
  "certifications": string[],             // certifications professionnelles
  "languages": string[],                  // langues parlées/écrites
  "projects": [                           // projets notables
    { "name": string, "description": string, "technologies": string[] }
  ],
  "yearsOfExperience": number             // total d'années d'expérience (0 si inconnu)
}

Texte du CV :
"""
${text}
"""`;

/**
 * Local LLM extraction via Ollama. Kept as a self-hosted alternative behind the
 * ExtractionService token; falls back to heuristic parsing if Ollama is down.
 */
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
      return normaliseExtracted(parsed, rawText);
    } catch (err) {
      this.logger.warn(
        `LLM extraction unavailable (${
          err instanceof Error ? err.message : String(err)
        }) — falling back to heuristic parsing`,
      );
      return heuristicExtract(rawText);
    }
  }
}
