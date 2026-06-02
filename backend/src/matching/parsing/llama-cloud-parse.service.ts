import { Injectable, Logger } from '@nestjs/common';
import { basename } from 'path';

interface UploadResponse {
  id: string;
  status?: string;
}

interface JobStatusResponse {
  status: string;
}

interface MarkdownResultResponse {
  markdown?: string;
}

/**
 * PDF → Markdown via LlamaCloud (LlamaParse), the TypeScript counterpart of the
 * Python template's `upload_and_parse`. Talks to the LlamaParse REST API
 * directly (upload → poll job → fetch markdown) to avoid pulling in a heavy
 * SDK, matching how OllamaExtractionService calls its API over fetch.
 *
 * Disabled (enabled === false) when LLAMA_CLOUD_API_KEY is unset; callers are
 * expected to fall back to local parsing in that case.
 */
@Injectable()
export class LlamaCloudParseService {
  private readonly logger = new Logger(LlamaCloudParseService.name);
  private readonly apiKey = process.env.LLAMA_CLOUD_API_KEY;
  private readonly baseUrl =
    process.env.LLAMA_CLOUD_BASE_URL ?? 'https://api.cloud.llamaindex.ai';
  // "agentic" tier in the template ≈ parse_page_with_agent in the REST API.
  private readonly parseMode =
    process.env.LLAMA_CLOUD_PARSE_MODE ?? 'parse_page_with_agent';
  private readonly pollIntervalMs = 2000;
  private readonly maxWaitMs = Number(
    process.env.LLAMA_CLOUD_TIMEOUT_MS ?? 120_000,
  );

  get enabled(): boolean {
    return Boolean(this.apiKey);
  }

  /** Upload a document and return its parsed markdown, or throw on failure. */
  async parseToMarkdown(buffer: Buffer, filePath: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('LLAMA_CLOUD_API_KEY not set');
    }

    const jobId = await this.upload(buffer, filePath);
    await this.waitForJob(jobId);
    return this.fetchMarkdown(jobId);
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      accept: 'application/json',
    };
  }

  private async upload(buffer: Buffer, filePath: string): Promise<string> {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(buffer)]), basename(filePath));
    form.append('parse_mode', this.parseMode);

    const res = await fetch(`${this.baseUrl}/api/v1/parsing/upload`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: form,
    });
    if (!res.ok) {
      throw new Error(
        `LlamaCloud upload failed (${res.status}): ${await res.text()}`,
      );
    }
    const data = (await res.json()) as UploadResponse;
    if (!data.id) {
      throw new Error('LlamaCloud upload returned no job id');
    }
    return data.id;
  }

  private async waitForJob(jobId: string): Promise<void> {
    const deadline = Date.now() + this.maxWaitMs;
    while (Date.now() < deadline) {
      const res = await fetch(`${this.baseUrl}/api/v1/parsing/job/${jobId}`, {
        headers: this.authHeaders(),
      });
      if (!res.ok) {
        throw new Error(`LlamaCloud status check failed (${res.status})`);
      }
      const { status } = (await res.json()) as JobStatusResponse;
      const normalised = status?.toUpperCase();
      if (normalised === 'SUCCESS') return;
      if (normalised === 'ERROR' || normalised === 'FAILED') {
        throw new Error(`LlamaCloud parsing job ${jobId} ${status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
    throw new Error(`LlamaCloud parsing job ${jobId} timed out`);
  }

  private async fetchMarkdown(jobId: string): Promise<string> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/parsing/job/${jobId}/result/markdown`,
      { headers: this.authHeaders() },
    );
    if (!res.ok) {
      throw new Error(`LlamaCloud result fetch failed (${res.status})`);
    }
    const data = (await res.json()) as MarkdownResultResponse;
    if (!data.markdown || !data.markdown.trim()) {
      throw new Error('LlamaCloud returned no markdown content');
    }
    return data.markdown;
  }
}
