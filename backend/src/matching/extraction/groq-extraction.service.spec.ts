const create = jest.fn();

jest.mock('groq-sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create } },
  })),
}));

import { GroqExtractionService } from './groq-extraction.service';

const RAW = 'Senior engineer. React and TypeScript. 6 years of experience.';

describe('GroqExtractionService', () => {
  const originalKey = process.env.GROQ_API_KEY;

  beforeEach(() => {
    create.mockReset();
  });

  afterAll(() => {
    process.env.GROQ_API_KEY = originalKey;
  });

  it('falls back to heuristic parsing when no API key is set', async () => {
    delete process.env.GROQ_API_KEY;
    const service = new GroqExtractionService();

    const result = await service.extract(RAW);

    expect(create).not.toHaveBeenCalled();
    expect(result.skills).toEqual(
      expect.arrayContaining(['react', 'typescript']),
    );
    expect(result.yearsOfExperience).toBe(6);
  });

  it('parses and validates a Groq JSON response', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: 'Senior engineer',
              skills: ['React', 'TypeScript'],
              experiences: [{ title: 'Engineer', company: 'Acme', years: 6 }],
              education: ['BSc'],
              yearsOfExperience: 6,
            }),
          },
        },
      ],
    });

    const service = new GroqExtractionService();
    const result = await service.extract(RAW);

    expect(create).toHaveBeenCalledTimes(1);
    expect(result.summary).toBe('Senior engineer');
    expect(result.skills).toEqual(['React', 'TypeScript']);
    expect(result.experiences).toHaveLength(1);
    expect(result.yearsOfExperience).toBe(6);
  });

  it('retries on a malformed response then falls back to heuristic', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    process.env.GROQ_MAX_RETRIES = '2';
    create.mockResolvedValue({
      choices: [{ message: { content: 'not json' } }],
    });

    const service = new GroqExtractionService();
    const result = await service.extract(RAW);

    expect(create).toHaveBeenCalledTimes(2);
    // Heuristic fallback still recovers skills from the raw text.
    expect(result.skills).toEqual(
      expect.arrayContaining(['react', 'typescript']),
    );
    delete process.env.GROQ_MAX_RETRIES;
  });
});
