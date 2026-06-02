import { Mission } from '../missions/entities/mission.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { ExtractedResume } from './extraction/extraction.service';

/** Lowercase + de-dupe a list of skill strings. */
export function normalizeSkills(skills: Iterable<string>): string[] {
  return Array.from(
    new Set(
      Array.from(skills)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

/** Union of a mission's structured + legacy skill lists (lowercased). */
export function missionSkills(mission: Mission): string[] {
  return normalizeSkills([
    ...(mission.requiredSkills ?? []),
    ...(mission.competencesRequises ?? []),
  ]);
}

export function resumeSkills(extracted?: ExtractedResume | null): string[] {
  return normalizeSkills(extracted?.skills ?? []);
}

/** A freelancer's manually-entered (form) competence names, lowercased. */
export function profileCompetenceSkills(
  profile?: FreelanceProfile | null,
): string[] {
  return normalizeSkills(
    (profile?.competences ?? [])
      .map((fc) => fc.competence?.nom)
      .filter((nom): nom is string => Boolean(nom)),
  );
}

/**
 * A freelancer's effective skill set = the union of their form competences and
 * the skills parsed from their resume (both normalised/de-duped). This is what
 * matching scores against, so neither source is silently ignored.
 */
export function freelanceSkills(
  profile?: FreelanceProfile | null,
  extracted?: ExtractedResume | null,
): string[] {
  return normalizeSkills([
    ...profileCompetenceSkills(profile),
    ...resumeSkills(extracted),
  ]);
}

/** Text fed to the embedder for a mission — all structured sections. */
export function buildMissionText(mission: Mission): string {
  const skills = missionSkills(mission);
  return [
    mission.titre,
    mission.experienceLevel
      ? `Experience level: ${mission.experienceLevel}`
      : '',
    skills.length ? `Required skills: ${skills.join(', ')}` : '',
    mission.description,
    mission.responsibilities
      ? `Responsibilities: ${mission.responsibilities}`
      : '',
    mission.niceToHave ? `Nice to have: ${mission.niceToHave}` : '',
  ]
    .filter((part) => part && part.trim())
    .join('\n');
}

/** Text fed to the embedder for a resume — built from the extracted JSON. */
export function buildResumeText(extracted?: ExtractedResume | null): string {
  if (!extracted) return '';

  const experiences = (extracted.experiences ?? [])
    .map((exp) => {
      const head = [exp.title, exp.company].filter(Boolean).join(' at ');
      const span = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
      const when = span || (exp.years ? String(exp.years) : '');
      const meta = [exp.location, when].filter(Boolean).join(', ');
      const desc = exp.description ? `: ${exp.description}` : '';
      return `${head}${meta ? ` (${meta})` : ''}${desc}`.trim();
    })
    .filter(Boolean);

  // Education entries may be legacy plain strings on rows parsed before the
  // schema was expanded — handle both shapes.
  const education = (extracted.education ?? [])
    .map((edu) => {
      if (typeof edu === 'string') return edu;
      const head = [edu.degree, edu.field].filter(Boolean).join(' in ');
      const inst = edu.institution ? ` — ${edu.institution}` : '';
      const year = edu.year ? ` (${edu.year})` : '';
      return `${head}${inst}${year}`.trim();
    })
    .filter(Boolean);

  const projects = (extracted.projects ?? [])
    .map((project) => {
      const tech = project.technologies?.length
        ? ` [${project.technologies.join(', ')}]`
        : '';
      const desc = project.description ? `: ${project.description}` : '';
      return `${project.name ?? ''}${desc}${tech}`.trim();
    })
    .filter(Boolean);

  return [
    extracted.title ?? '',
    extracted.summary ?? '',
    extracted.skills?.length ? `Skills: ${extracted.skills.join(', ')}` : '',
    experiences.length ? `Experience:\n${experiences.join('\n')}` : '',
    education.length ? `Education: ${education.join('; ')}` : '',
    projects.length ? `Projects:\n${projects.join('\n')}` : '',
    extracted.certifications?.length
      ? `Certifications: ${extracted.certifications.join(', ')}`
      : '',
    extracted.languages?.length
      ? `Languages: ${extracted.languages.join(', ')}`
      : '',
    extracted.yearsOfExperience
      ? `${extracted.yearsOfExperience} years of experience`
      : '',
  ]
    .filter((part) => part && part.trim())
    .join('\n');
}

/** Jaccard similarity of two skill sets — 0 when either is empty. */
export function skillJaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const skill of setA) if (setB.has(skill)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Blend cosine relevance with skill overlap into one 0–1 score. */
export function hybridScore(
  cosine: number,
  skillsA: string[],
  skillsB: string[],
): number {
  const overlap = skillJaccard(skillsA, skillsB);
  return 0.8 * cosine + 0.2 * overlap;
}
