// Lightweight in-memory store to avoid native deps for MVP
export const db = {
    users: new Map<string, { id: string; email: string; name?: string; password_hash: string; created_at: number }>(),
    projects: new Map<string, { id: string; owner_user_id: string; name: string; slug: string; created_at: number }>(),
    docs: new Map<string, { id: string; project_id: string; path: string; content: string; updated_at: number }>(),
    apiKeys: new Map<string, { id: string; user_id: string; key: string; label: string; created_at: number; last_used_at: number | null; usage_count: number }>(),
    apiUsageByKey: new Map<string, { key_id: string; total_requests: number; total_input_tokens: number; total_output_tokens: number; total_usd: number; last_used_at: number | null }>()
};

export function migrate() {
    // no-op for in-memory MVP
}


