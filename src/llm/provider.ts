import { FileChunk } from '../core/chunk.js';
import { ChunkSummary } from '../core/summarize.js';

export interface LLMProvider {
    summarizeChunk(chunk: FileChunk): Promise<Partial<ChunkSummary>>;
    synthesizeProject?(summaries: ChunkSummary[]): Promise<string>;
}


