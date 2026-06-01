export interface ResumeExperience {
  title?: string;
  company?: string;
  years?: number | string;
  description?: string;
}

/** Structured resume content produced from raw CV text. */
export interface ExtractedResume {
  summary: string;
  skills: string[];
  experiences: ResumeExperience[];
  education: string[];
  yearsOfExperience: number | null;
}

/**
 * DI token for resume extraction. Swappable (Ollama today, could be a hosted
 * LLM later). Implementations must always resolve to a best-effort result and
 * never throw, so the resume pipeline can keep going.
 */
export abstract class ExtractionService {
  abstract extract(rawText: string): Promise<ExtractedResume>;
}
