export interface ResumeExperience {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  years?: number | string;
  description?: string;
}

export interface ResumeEducation {
  degree?: string;
  institution?: string;
  field?: string;
  year?: number | string;
}

export interface ResumeProject {
  name?: string;
  description?: string;
  technologies?: string[];
}

/** Structured resume content produced from raw CV text. */
export interface ExtractedResume {
  /** Candidate identity / contact details (null when not present in the CV). */
  name: string | null;
  /** Professional headline, e.g. "Senior Frontend Engineer". */
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  /** Portfolio / LinkedIn / GitHub and other profile URLs. */
  links: string[];

  summary: string;
  skills: string[];
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  certifications: string[];
  /** Spoken/written human languages (e.g. "English", "French"). */
  languages: string[];
  projects: ResumeProject[];
  yearsOfExperience: number | null;
}

/**
 * DI token for resume extraction. Swappable (Groq today, Ollama as a
 * self-hosted alternative). Implementations must always resolve to a
 * best-effort result and never throw, so the resume pipeline can keep going.
 */
export abstract class ExtractionService {
  abstract extract(rawText: string): Promise<ExtractedResume>;
}
