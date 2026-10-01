import { Section } from "@/components/settings/settings-layout";
import { notificationOptions } from "@/data/mock-settings";

export function NotificationsSection({
  value,
  onChange,
}: {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}) {
  return (
    <Section title="Notifications">
      {notificationOptions.map((n) => (
        <label key={n.id} className="flex cursor-pointer items-center gap-3 py-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={value[n.id] ?? false}
            onChange={(e) => onChange({ ...value, [n.id]: e.target.checked })}
          />
          {n.label}
        </label>
      ))}
    </Section>
  );
}
