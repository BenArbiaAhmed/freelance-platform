import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { Resume } from './entities/resume.entity';
import { EmbeddingService } from '../matching/embedding.service';
import { QdrantService } from '../matching/qdrant.service';
import { LlamaCloudParseService } from '../matching/parsing/llama-cloud-parse.service';
import { RESUME_COLLECTION } from '../matching/qdrant.constants';
import { buildResumeText, resumeSkills } from '../matching/matching.text';

@Injectable()
export class ResumeEmbeddingService {
  private readonly logger = new Logger(ResumeEmbeddingService.name);

  constructor(
    private readonly embedding: EmbeddingService,
    private readonly qdrant: QdrantService,
    private readonly llamaParse: LlamaCloudParseService,
  ) {}

  /**
   * Pull text out of a PDF/DOCX file. PDFs go through LlamaCloud (markdown)
   * when configured, falling back to local pdf-parse on any failure or when no
   * API key is set. Throws on unsupported types.
   */
  async extractText(
    filePath: string,
    mimeType?: string | null,
  ): Promise<string> {
    const buffer = await readFile(filePath);

    if (mimeType === 'application/pdf') {
      if (this.llamaParse.enabled) {
        try {
          return await this.llamaParse.parseToMarkdown(buffer, filePath);
        } catch (err) {
          this.logger.warn(
            `LlamaCloud parse failed (${
              err instanceof Error ? err.message : String(err)
            }) — falling back to local pdf-parse`,
          );
        }
      }
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return result.text ?? '';
      } finally {
        await parser.destroy();
      }
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? '';
    }

    if (mimeType === 'application/msword') {
      throw new Error('Legacy .doc format is not supported');
    }

    throw new Error(`Unsupported resume type: ${mimeType ?? 'unknown'}`);
  }

  /** Embed a READY resume from its extracted JSON and upsert into Qdrant. */
  async indexResume(resume: Resume): Promise<void> {
    try {
      const text = buildResumeText(resume.extracted);
      if (text.trim().length < 20) {
        this.logger.warn(`Resume ${resume.id} has too little text to embed`);
        return;
      }

      const vector = await this.embedding.embedDocument(text);
      if (!vector.length) {
        this.logger.warn(`Resume ${resume.id} produced an empty vector`);
        return;
      }

      await this.qdrant.upsert(RESUME_COLLECTION, {
        id: resume.id,
        vector,
        payload: {
          resumeId: resume.id,
          freelanceProfileId: resume.freelanceProfileId,
          skills: resumeSkills(resume.extracted),
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          createdAt: resume.createdAt?.toISOString?.() ?? undefined,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to index resume ${resume.id}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw err;
    }
  }

  async deleteResume(resumeId: string): Promise<void> {
    try {
      await this.qdrant.deletePoint(RESUME_COLLECTION, resumeId);
    } catch (err) {
      this.logger.error(
        `Failed to delete resume embedding ${resumeId}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}
