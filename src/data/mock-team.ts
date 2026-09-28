// PHASE 1 MOCK DATA — team & users.

export type UserRole = "Admin" | "Accountant" | "Viewer";
export type UserStatus = "Active" | "Pending";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export const userRoles: UserRole[] = ["Admin", "Accountant", "Viewer"];

export const teamUsers: TeamUser[] = [
  { id: "u-1", name: "John Smith", email: "john@acme.com", role: "Admin", status: "Active" },
  { id: "u-2", name: "Sarah Wilson", email: "sarah@acme.com", role: "Accountant", status: "Active" },
  { id: "u-3", name: "Mike Brown", email: "mike@acme.com", role: "Viewer", status: "Pending" },
];
