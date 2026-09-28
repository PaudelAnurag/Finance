import type { TeamUser, UserRole } from "@/data/mock-team";

export function teamStats(users: TeamUser[]) {
  return {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    pending: users.filter((u) => u.status === "Pending").length,
  };
}

export function filterUsers(users: TeamUser[], query: string, role: UserRole | "All roles") {
  const q = query.trim().toLowerCase();
  return users.filter(
    (u) =>
      (role === "All roles" || u.role === role) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
