import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mt-6 first:mt-0">
      <CardHeader>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

export function Row({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 py-3 sm:grid-cols-[200px_1fr]">
      <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="sm:max-w-sm">{children}</div>
    </div>
  );
}
