// PHASE 1 MOCK DATA — transactions. Raw numbers/ISO dates only; formatting
// happens in components via lib/format + lib/transactions.

export type TransactionType = "Income" | "Expense";
export type TransactionStatus = "Completed" | "Pending";

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  category: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // always positive; sign comes from `type`
}

export const transactionTypes: TransactionType[] = ["Income", "Expense"];
export const transactionStatuses: TransactionStatus[] = ["Completed", "Pending"];
export const transactionCategories = [
  "Sales",
  "Services",
  "Operations",
  "Software",
  "Utilities",
  "Payroll",
  "Marketing",
  "Logistics",
];

export const transactionFilters = ["All", "Income", "Expense", "Pending", "Completed"] as const;
export type TransactionFilter = (typeof transactionFilters)[number];

export const transactionSortOptions = [
  { value: "date-desc", label: "Date: newest first" },
  { value: "date-asc", label: "Date: oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
] as const;
export type TransactionSort = (typeof transactionSortOptions)[number]["value"];

export const transactions: Transaction[] = [
  // { id: "t-01", date: "2025-09-25", description: "ABC Trading", category: "Sales", type: "Income", status: "Completed", amount: 85_000 },
  // { id: "t-02", date: "2025-09-24", description: "Office Rent", category: "Operations", type: "Expense", status: "Completed", amount: 35_000 },
  // { id: "t-03", date: "2025-09-23", description: "AWS", category: "Software", type: "Expense", status: "Completed", amount: 12_400 },
  // { id: "t-04", date: "2025-09-22", description: "XYZ Corp", category: "Sales", type: "Income", status: "Completed", amount: 62_000 },
  // { id: "t-05", date: "2025-09-21", description: "Electricity", category: "Utilities", type: "Expense", status: "Completed", amount: 8_500 },
  // { id: "t-06", date: "2025-09-20", description: "Northgate Traders", category: "Sales", type: "Income", status: "Pending", amount: 48_000 },
  // { id: "t-07", date: "2025-09-19", description: "Staff Salaries", category: "Payroll", type: "Expense", status: "Completed", amount: 120_000 },
  // { id: "t-08", date: "2025-09-18", description: "Bright Hardware Co.", category: "Services", type: "Income", status: "Completed", amount: 37_500 },
  // { id: "t-09", date: "2025-09-17", description: "Google Workspace", category: "Software", type: "Expense", status: "Pending", amount: 2_900 },
  // { id: "t-10", date: "2025-09-16", description: "Meta Ads", category: "Marketing", type: "Expense", status: "Completed", amount: 21_050 },
  // { id: "t-11", date: "2025-09-15", description: "Freight & Courier", category: "Logistics", type: "Expense", status: "Pending", amount: 9_600 },
];
