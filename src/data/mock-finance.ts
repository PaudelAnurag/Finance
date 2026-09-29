// Non-numeric UI placeholder only. All financial numbers now come from the
// active Dataset (src/lib/dataset) — empty/0 until a CSV is uploaded — never
// from hardcoded values here. See src/lib/dataset/empty vs from-transactions.

/** Recent-questions list is chat history UI, not financial data — stays static in Phase 1. */
export const recentQuestions: { text: string; time: string }[] = [];
