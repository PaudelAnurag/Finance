import { NextResponse } from "next/server";

const API_KEY = "finance-test-key";

const transactions = [
  {
    "date": "2026-01-01",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 25000.0,
    "status": "Pending"
  },
  {
    "date": "2026-01-02",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 26504.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-03",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 28009.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-04",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 29513.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-05",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 30516.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-06",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 9860.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-07",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 10933.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-08",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 12005.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-09",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 12576.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-10",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 13648.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-11",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 14721.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-12",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 15793.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-13",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 16364.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-14",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 17436.5,
    "status": "Pending"
  },
  {
    "date": "2026-01-15",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 18509.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-16",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 19581.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-17",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 20152.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-18",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 21224.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-19",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 22297.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-20",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 51577.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-21",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 52580.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-22",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 54084.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-23",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 55589.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-24",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 57093.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-25",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 58096.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-26",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 28800.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-27",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 29873.0,
    "status": "Pending"
  },
  {
    "date": "2026-01-28",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 30945.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-29",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 31516.0,
    "status": "Completed"
  },
  {
    "date": "2026-01-30",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 32588.5,
    "status": "Completed"
  },
  {
    "date": "2026-01-31",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 33661.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-01",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 34733.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-02",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 35304.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-03",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 36376.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-04",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 37449.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-05",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 38521.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-06",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 39092.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-07",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 40164.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-08",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 41237.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-09",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 79157.5,
    "status": "Pending"
  },
  {
    "date": "2026-02-10",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 80160.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-11",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 81664.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-12",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 83169.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-13",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 84673.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-14",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 85676.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-15",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 47740.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-16",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 48813.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-17",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 49885.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-18",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 50456.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-19",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 51528.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-20",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 52601.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-21",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 53673.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-22",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 54244.0,
    "status": "Pending"
  },
  {
    "date": "2026-02-23",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 55316.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-24",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 56389.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-25",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 57461.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-26",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 58032.0,
    "status": "Completed"
  },
  {
    "date": "2026-02-27",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 59104.5,
    "status": "Completed"
  },
  {
    "date": "2026-02-28",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 60177.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-01",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 106737.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-02",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 107740.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-03",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 109244.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-04",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 110749.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-05",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 112253.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-06",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 113256.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-07",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 66680.5,
    "status": "Pending"
  },
  {
    "date": "2026-03-08",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 67753.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-09",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 68825.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-10",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 69396.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-11",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 70468.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-12",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 71541.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-13",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 72613.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-14",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 73184.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-15",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 74256.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-16",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 75329.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-17",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 76401.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-18",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 76972.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-19",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 78044.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-20",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 79117.0,
    "status": "Pending"
  },
  {
    "date": "2026-03-21",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 134317.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-22",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 135320.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-23",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 136824.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-24",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 138329.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-25",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 139833.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-26",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 140836.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-27",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 10620.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-28",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 11693.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-29",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 12765.5,
    "status": "Completed"
  },
  {
    "date": "2026-03-30",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 13336.0,
    "status": "Completed"
  },
  {
    "date": "2026-03-31",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 14408.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-01",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 15481.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-02",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 16553.5,
    "status": "Pending"
  },
  {
    "date": "2026-04-03",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 17124.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-04",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 18196.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-05",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 19269.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-06",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 20341.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-07",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 20912.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-08",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 21984.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-09",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 23057.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-10",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 161897.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-11",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 162900.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-12",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 164404.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-13",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 165909.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-14",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 167413.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-15",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 168416.0,
    "status": "Pending"
  },
  {
    "date": "2026-04-16",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 29560.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-17",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 30633.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-18",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 31705.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-19",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 32276.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-20",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 33348.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-21",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 34421.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-22",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 35493.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-23",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 36064.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-24",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 37136.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-25",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 38209.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-26",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 39281.5,
    "status": "Completed"
  },
  {
    "date": "2026-04-27",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 39852.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-28",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 40924.5,
    "status": "Pending"
  },
  {
    "date": "2026-04-29",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 41997.0,
    "status": "Completed"
  },
  {
    "date": "2026-04-30",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 29477.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-01",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 30480.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-02",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 31984.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-03",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 33489.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-04",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 34993.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-05",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 35996.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-06",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 48500.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-07",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 49573.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-08",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 50645.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-09",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 51216.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-10",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 52288.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-11",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 53361.0,
    "status": "Pending"
  },
  {
    "date": "2026-05-12",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 54433.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-13",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 55004.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-14",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 56076.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-15",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 57149.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-16",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 58221.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-17",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 58792.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-18",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 59864.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-19",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 60937.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-20",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 57057.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-21",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 58060.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-22",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 59564.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-23",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 61069.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-24",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 62573.5,
    "status": "Pending"
  },
  {
    "date": "2026-05-25",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 63576.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-26",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 67440.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-27",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 68513.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-28",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 69585.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-29",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 70156.0,
    "status": "Completed"
  },
  {
    "date": "2026-05-30",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 71228.5,
    "status": "Completed"
  },
  {
    "date": "2026-05-31",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 72301.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-01",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 73373.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-02",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 73944.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-03",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 75016.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-04",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 76089.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-05",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 77161.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-06",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 77732.0,
    "status": "Pending"
  },
  {
    "date": "2026-06-07",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 78804.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-08",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 79877.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-09",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 84637.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-10",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 85640.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-11",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 87144.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-12",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 88649.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-13",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 90153.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-14",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 91156.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-15",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 11380.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-16",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 12453.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-17",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 13525.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-18",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 14096.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-19",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 15168.5,
    "status": "Pending"
  },
  {
    "date": "2026-06-20",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 16241.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-21",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 17313.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-22",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 17884.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-23",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 18956.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-24",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 20029.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-25",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 21101.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-26",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 21672.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-27",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 22744.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-28",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 23817.0,
    "status": "Completed"
  },
  {
    "date": "2026-06-29",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 112217.5,
    "status": "Completed"
  },
  {
    "date": "2026-06-30",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 113220.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-01",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 114724.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-02",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 116229.0,
    "status": "Pending"
  },
  {
    "date": "2026-07-03",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 117733.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-04",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 118736.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-05",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 30320.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-06",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 31393.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-07",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 32465.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-08",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 33036.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-09",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 34108.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-10",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 35181.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-11",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 36253.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-12",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 36824.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-13",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 37896.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-14",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 38969.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-15",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 40041.5,
    "status": "Pending"
  },
  {
    "date": "2026-07-16",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 40612.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-17",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 41684.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-18",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 42757.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-19",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 139797.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-20",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 140800.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-21",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 142304.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-22",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 143809.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-23",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 145313.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-24",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 146316.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-25",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 49260.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-26",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 50333.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-27",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 51405.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-28",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 51976.0,
    "status": "Pending"
  },
  {
    "date": "2026-07-29",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 53048.5,
    "status": "Completed"
  },
  {
    "date": "2026-07-30",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 54121.0,
    "status": "Completed"
  },
  {
    "date": "2026-07-31",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 55193.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-01",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 55764.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-02",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 56836.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-03",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 57909.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-04",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 58981.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-05",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 59552.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-06",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 60624.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-07",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 61697.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-08",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 167377.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-09",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 168380.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-10",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 169884.5,
    "status": "Pending"
  },
  {
    "date": "2026-08-11",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 171389.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-12",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 172893.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-13",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 173896.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-14",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 68200.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-15",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 69273.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-16",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 70345.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-17",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 70916.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-18",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 71988.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-19",
    "description": "Internet Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 73061.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-20",
    "description": "Electricity Bill",
    "category": "Utilities",
    "type": "Expense",
    "amount": 74133.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-21",
    "description": "Employee Salary",
    "category": "Payroll",
    "type": "Expense",
    "amount": 74704.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-22",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "type": "Expense",
    "amount": 75776.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-23",
    "description": "Business Travel",
    "category": "Travel",
    "type": "Expense",
    "amount": 76849.0,
    "status": "Pending"
  },
  {
    "date": "2026-08-24",
    "description": "Equipment Purchase",
    "category": "Equipment",
    "type": "Expense",
    "amount": 77921.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-25",
    "description": "Insurance Premium",
    "category": "Insurance",
    "type": "Expense",
    "amount": 78492.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-26",
    "description": "Bank Charges",
    "category": "Banking",
    "type": "Expense",
    "amount": 79564.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-27",
    "description": "Customer Refund",
    "category": "Refunds",
    "type": "Expense",
    "amount": 5637.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-28",
    "description": "Warehouse Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 34957.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-29",
    "description": "ABC Trading Sales",
    "category": "Sales",
    "type": "Income",
    "amount": 35960.0,
    "status": "Completed"
  },
  {
    "date": "2026-08-30",
    "description": "XYZ Corp Invoice",
    "category": "Sales",
    "type": "Income",
    "amount": 37464.5,
    "status": "Completed"
  },
  {
    "date": "2026-08-31",
    "description": "Online Store Revenue",
    "category": "Sales",
    "type": "Income",
    "amount": 38969.0,
    "status": "Completed"
  },
  {
    "date": "2026-09-01",
    "description": "Consulting Services",
    "category": "Services",
    "type": "Income",
    "amount": 40473.5,
    "status": "Completed"
  },
  {
    "date": "2026-09-02",
    "description": "Client Payment",
    "category": "Receivables",
    "type": "Income",
    "amount": 41476.0,
    "status": "Completed"
  },
  {
    "date": "2026-09-03",
    "description": "Software Subscription",
    "category": "Software",
    "type": "Expense",
    "amount": 12140.5,
    "status": "Completed"
  },
  {
    "date": "2026-09-04",
    "description": "Office Rent",
    "category": "Operations",
    "type": "Expense",
    "amount": 13213.0,
    "status": "Completed"
  },
  {
    "date": "2026-09-05",
    "description": "AWS Cloud Services",
    "category": "Software",
    "type": "Expense",
    "amount": 14285.5,
    "status": "Pending"
  },
  {
    "date": "2026-09-06",
    "description": "Google Workspace",
    "category": "Software",
    "type": "Expense",
    "amount": 14856.0,
    "status": "Completed"
  },
  {
    "date": "2026-09-07",
    "description": "Office Supplies",
    "category": "Operations",
    "type": "Expense",
    "amount": 15928.5,
    "status": "Completed"
  }
];
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      // Settings lets users pick a custom auth header (default x-api-key), so allow it in the preflight.
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-API-Key",
      // Chrome asks permission before a public site calls a private IP (192.168.x.x, 10.x.x.x).
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Max-Age": "600",
    },
  });
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!API_KEY || authorization !== `Bearer ${API_KEY}`) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  return NextResponse.json(transactions, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}