// Predefined Q&A registry for Phase 1 mock Ask Finance AI.
// "kind" selects which answer card renders; numbers come from the active dataset.

export type AskFinanceKind = "revenue" | "cash-decrease" | "overdue" | "cashflow" | "expenses";

export interface AskFinanceQA {
  id: string;
  question: string;
  kind: AskFinanceKind;
}

export const askQuestions = {
  revenue: "What was our total revenue last month?",
  cashDecrease: "Why did our cash balance decrease?",
  overdue: "Which customers have overdue invoices?",
  cashflow: "How is our cash flow looking?",
  expenses: "What are our biggest expenses?",
} as const;

export const askFinanceQA: AskFinanceQA[] = [
  { id: "revenue", question: askQuestions.revenue, kind: "revenue" },
  { id: "cash-decrease", question: askQuestions.cashDecrease, kind: "cash-decrease" },
  { id: "overdue", question: askQuestions.overdue, kind: "overdue" },
  { id: "cashflow", question: askQuestions.cashflow, kind: "cashflow" },
  { id: "expenses", question: askQuestions.expenses, kind: "expenses" },
];

export function findAskFinanceQA(question: string) {
  const q = question.trim().toLowerCase();
  return askFinanceQA.find((qa) => qa.question.toLowerCase() === q);
}
