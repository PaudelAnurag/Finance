// PHASE 1 MOCK DATA — settings (not persisted; persistence comes with the backend).

export const businessDefaults = {
  companyName: "Acme Components Ltd",
  industry: "Manufacturing",
  fiscalYear: "July – June",
  companySize: "11–50 employees",
};

export const industryOptions = ["Manufacturing", "Retail", "Wholesale & Distribution", "Services", "Technology", "Hospitality", "Other"];

export const dataSources = [
  { name: "CSV / Excel", status: "Available" },
  { name: "Xero", status: "Not connected" },
];

export const aiDefaults = { forecastPeriod: "3 months", responseStyle: "Detailed" };
export const forecastPeriodOptions = ["3 months", "6 months", "12 months"];
export const responseStyleOptions = ["Concise", "Detailed"];

export const notificationOptions = [
  { id: "cash-flow", label: "Cash-flow alerts", enabled: true },
  { id: "overdue", label: "Overdue invoice alerts", enabled: true },
  { id: "low-cash", label: "Low-cash warnings", enabled: true },
];

export const securityItems = [
  { label: "Two-factor authentication", value: "Not enabled" },
  { label: "Session timeout", value: "30 minutes" },
];
