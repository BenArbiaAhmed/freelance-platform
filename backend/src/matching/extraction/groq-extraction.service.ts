import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { ExtractedResume, ExtractionService } from './extraction.service';
import { heuristicExtract, normaliseExtracted } from './extraction.heuristic';

/**
 * Validation schema for the structured CV the LLM must return. This is the
 * TypeScript equivalent of the `Resume` Pydantic model the Python template
 * hands to `instructor`: the parsed JSON is coerced (see normaliseExtracted)
 * and then validated against this shape, with retries on failure.
 */
const ResumeSchema = z.object({
  name: z.string().nullable(),
  title: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  links: z.array(z.string()),
  summary: z.string(),
  skills: z.array(z.string()),
  experiences: z.array(
    z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      years: z.union([z.number(), z.string()]).optional(),
      description: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string().optional(),
      institution: z.string().optional(),
      field: z.string().optional(),
      year: z.union([z.number(), z.string()]).optional(),
    }),
  ),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional(),
    }),
  ),
  yearsOfExperience: z.number().nullable(),
});

const SYSTEM_PROMPT = `You are a resume parser. From the resume text provided, return ONLY a valid JSON object (no surrounding prose) with exactly these keys. Use null for missing scalar fields and [] for missing lists; never invent data.
{
  "name": string,                    // candidate full name
  "title": string,                   // professional headline, e.g. "Senior Frontend Engineer"
  "email": string,
  "phone": string,
  "location": string,                // city / country
  "links": string[],                 // portfolio, LinkedIn, GitHub and other URLs
  "summary": string,                 // 1-2 sentence summary, in the resume's own language
  "skills": string[],                // technical skills and tools
  "experiences": [                   // professional experiences, most recent first
    { "title": string, "company": string, "location": string, "startDate": string, "endDate": string, "years": number, "description": string }
  ],
  "education": [                     // degrees / training
    { "degree": string, "institution": string, "field": string, "year": number }
  ],
  "certifications": string[],        // professional certifications
  "languages": string[],             // spoken/written human languages
  "projects": [                      // notable projects
    { "name": string, "description": string, "technologies": string[] }
  ],
  "yearsOfExperience": number        // total years of professional experience (0 if unknown)
}`;

const userPrompt = (markdown: string, correction?: string): string =>
  `${correction ? `${correction}\n\n` : ''}Parse this resume and return the structured JSON:\n\n${markdown}`;

/**
 * Hosted resume extraction via Groq, mirroring the Python template's
 * `instructor + Groq` pipeline: prompt the model in JSON mode, coerce the
 * response into ExtractedResume and validate it, retrying on failure. If no
 * API key is configured or every attempt fails, falls back to heuristic
 * parsing so the resume pipeline never hard-fails.
 */
@Injectable()
export class GroqExtractionService extends ExtractionService {
  private readonly logger = new Logger(GroqExtractionService.name);
  private readonly model =
    process.env.GROQ_EXTRACTION_MODEL ?? 'llama-3.3-70b-versatile';
  private readonly maxRetries = Number(process.env.GROQ_MAX_RETRIES ?? 3);
  private readonly client: Groq | null;

  constructor() {
    super();
    const apiKey = process.env.GROQ_API_KEY;
    this.client = apiKey ? new Groq({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn(
        'GROQ_API_KEY not set — resume extraction will use heuristic parsing',
      );
    }
  }

  async extract(rawText: string): Promise<ExtractedResume> {
    if (!this.client) {
      return heuristicExtract(rawText);
    }

    const markdown = rawText.slice(0, 20000);
    let correction: string | undefined;
    let lastError = '';

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt(markdown, correction) },
          ],
        });

        const content = completion.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(content) as Record<string, unknown>;
        const normalised = normaliseExtracted(parsed, rawText);

        const result = ResumeSchema.safeParse(normalised);
        if (result.success) {
          return result.data;
        }

        lastError = result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');
        correction = `Your previous response failed validation (${lastError}). Return a corrected JSON object matching the schema exactly.`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
      this.logger.warn(
        `Groq extraction attempt ${attempt}/${this.maxRetries} failed: ${lastError}`,
      );
    }

    this.logger.warn(
      'Groq extraction exhausted retries — falling back to heuristic parsing',
    );
    return heuristicExtract(rawText);
  }
}
