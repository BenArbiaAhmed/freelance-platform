import {
  detectSkills,
  detectYears,
  heuristicExtract,
  normaliseExtracted,
} from './extraction.heuristic';

describe('extraction.heuristic', () => {
  describe('detectSkills', () => {
    it('finds known skills regardless of surrounding punctuation', () => {
      const skills = detectSkills(
        'I build apps with React, TypeScript and Node.js.',
      );
      expect(skills).toEqual(expect.arrayContaining(['react', 'typescript']));
    });

    it('returns an empty array when nothing matches', () => {
      expect(detectSkills('Lorem ipsum dolor sit amet')).toEqual([]);
    });
  });

  describe('detectYears', () => {
    it('parses "N years" / "N ans"', () => {
      expect(detectYears('I have 7 years of experience')).toBe(7);
      expect(detectYears('8 ans d’expérience')).toBe(8);
    });

    it('returns null when absent or out of range', () => {
      expect(detectYears('no number here')).toBeNull();
      expect(detectYears('99 years')).toBeNull();
    });
  });

  describe('normaliseExtracted', () => {
    it('keeps valid LLM fields and coerces the shape', () => {
      const result = normaliseExtracted(
        {
          name: ' Ada Lovelace ',
          title: 'Senior Engineer',
          email: 'ada@example.com',
          links: ['https://github.com/ada', ' '],
          summary: '  Senior dev  ',
          skills: ['React', 'React', ' '],
          experiences: [
            { title: 'Dev', company: 'Acme', years: 3, location: 'Remote' },
          ],
          education: [{ degree: 'BSc', field: 'CS', institution: 'MIT' }],
          certifications: ['AWS SAA'],
          languages: ['English', 'French'],
          projects: [{ name: 'Matcher', technologies: ['Qdrant', 'NestJS'] }],
          yearsOfExperience: '5',
        },
        'raw text',
      );
      expect(result.name).toBe('Ada Lovelace');
      expect(result.email).toBe('ada@example.com');
      expect(result.links).toEqual(['https://github.com/ada']);
      expect(result.summary).toBe('Senior dev');
      expect(result.skills).toEqual(['React']);
      expect(result.experiences[0].location).toBe('Remote');
      expect(result.education[0]).toMatchObject({ degree: 'BSc', field: 'CS' });
      expect(result.certifications).toEqual(['AWS SAA']);
      expect(result.languages).toEqual(['English', 'French']);
      expect(result.projects[0].technologies).toEqual(['Qdrant', 'NestJS']);
      expect(result.yearsOfExperience).toBe(5);
    });

    it('accepts legacy string education entries', () => {
      const result = normaliseExtracted({ education: ['BSc CS'] }, 'raw text');
      expect(result.education).toEqual([{ degree: 'BSc CS' }]);
    });

    it('defaults contact fields to null and lists to empty', () => {
      const result = normaliseExtracted({}, 'raw text');
      expect(result.name).toBeNull();
      expect(result.email).toBeNull();
      expect(result.links).toEqual([]);
      expect(result.certifications).toEqual([]);
      expect(result.projects).toEqual([]);
    });

    it('backfills empty fields from the raw text', () => {
      const result = normaliseExtracted(
        { skills: [] },
        'Built with Python and Docker. 4 years of experience.',
      );
      expect(result.summary).toContain('Python');
      expect(result.skills).toEqual(
        expect.arrayContaining(['python', 'docker']),
      );
      // yearsOfExperience is only filled by the heuristic path, not normalise.
      expect(result.yearsOfExperience).toBeNull();
    });
  });

  describe('heuristicExtract', () => {
    it('produces a best-effort resume with no LLM', () => {
      const result = heuristicExtract(
        'Frontend engineer. React, Tailwind CSS. 6 years of experience.',
      );
      expect(result.skills).toEqual(
        expect.arrayContaining(['react', 'tailwind css']),
      );
      expect(result.yearsOfExperience).toBe(6);
      expect(result.experiences).toEqual([]);
    });
  });
});
