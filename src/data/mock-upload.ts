// Upload Data config + sample files. CSV is the only working format in Phase 1.
import { transactions } from "@/data/mock-transactions";

export const uploadConstraints = { maxSizeMB: 25 };

export const supportedFormats = [
  { label: "CSV", status: "Available" },
  { label: "Excel (.xlsx)", status: "Coming later" },
];

export const csvSpec = {
  requiredColumns: [
    { name: "date", hint: "YYYY-MM-DD" },
    { name: "description", hint: "Text" },
    { name: "category", hint: "Text, e.g. Sales" },
    { name: "type", hint: "Income or Expense" },
    { name: "amount", hint: "Positive number, e.g. 85000 or 12,400.50" },
    { name: "status", hint: "Completed or Pending" },
  ],
} as const;

/** Sample rows reuse the Transactions page mock data (single source of truth). */
export const sampleCsvRows: string[][] = transactions.map((t) => [
  t.date,
  t.description,
  t.category,
  t.type,
  String(t.amount),
  t.status,
]);

/** Deliberately flawed file so the error UI can be exercised. */
export const sampleCsvWithErrors = `date,description,category,type,amount,status
2025-09-25,ABC Trading,Sales,Income,85000,Completed
2025-09-24,Office Rent,Operations,Expense,35000,Completed
2025-09-23,AWS,Software,Expense,abc,Completed
,XYZ Corp,Sales,Income,62000,Completed
2025-09-21,Refund Desk,Sales,refund,1500,Completed
2025-09-20,Electricity,Utilities,Expense,8500,Completed
2025-09-20,Electricity,Utilities,Expense,8500,Completed
`;

export const connectedSources = [
  { id: "xero", name: "Xero", description: "Sync invoices, bills and bank transactions", status: "Not connected" },
];
