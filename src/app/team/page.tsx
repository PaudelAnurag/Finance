"use client";

import { Clock, Plus, UserCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/shell/kpi-card";
import { InviteInput, InviteUserModal } from "@/components/team/invite-user-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { TeamUser, UserRole, teamUsers, userRoles } from "@/data/mock-team";
import { filterUsers, initials, teamStats } from "@/lib/team";

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>(teamUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "All roles">("All roles");
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => teamStats(users), [users]);
  const visible = useMemo(() => filterUsers(users, query, role), [users, query, role]);

  function invite(input: InviteInput) {
    setUsers((prev) => [...prev, { ...input, id: `u-${Date.now()}`, status: "Pending" }]);
    setOpen(false);
  }

  return (
    <AppShell
      title="Team & Users"
      subtitle="Manage users in your company"
      action={
        <Button variant="accent" onClick={() => setOpen(true)}>
          <Plus /> Invite User
        </Button>
      }
    >
      <section aria-label="Team summary" className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Users" value={String(stats.total)} icon={Users} tone="blue" />
        <KpiCard label="Active Users" value={String(stats.active)} icon={UserCheck} tone="green" />
        <KpiCard label="Pending Invitations" value={String(stats.pending)} icon={Clock} tone="orange" />
      </section>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row">
          <SearchInput
            aria-label="Search users"
            placeholder="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | "All roles")}
            className="sm:w-44"
          >
            <option>All roles</option>
            {userRoles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-t text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-xs font-medium text-[var(--badge-blue-fg)]">
                        {initials(u.name)}
                      </span>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === "Admin" ? "purple" : u.role === "Accountant" ? "blue" : "gray"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={u.status === "Active" ? "green" : "orange"}>{u.status}</Badge>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr className="border-t">
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <InviteUserModal
        open={open}
        existingEmails={users.map((u) => u.email.toLowerCase())}
        onClose={() => setOpen(false)}
        onInvite={invite}
      />
    </AppShell>
  );
}
