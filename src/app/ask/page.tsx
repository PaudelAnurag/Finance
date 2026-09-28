import { ChevronRight, Lightbulb } from "lucide-react";

import { ChatComposer } from "@/components/ask/chat-composer";
import { QuickInsights } from "@/components/ask/quick-insights";
import { RevenueAnswerCard, UserBubble } from "@/components/ask/answer-card";
import { AppShell } from "@/components/shell/app-shell";
import { suggestedQuestions } from "@/lib/demo/placeholder";

export default function AskFinancePage() {
  return (
    <AppShell
      active="Ask Finance AI"
      title="Ask Finance AI"
      subtitle="Get instant answers about your finances, cash flow, and business performance."
    >
      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <ChatComposer />

          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lightbulb className="size-4" />
            Suggested Questions
          </div>
          <div className="-mt-2 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                className="flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-[13px] hover:bg-muted"
              >
                {q}
              </button>
            ))}
            <button className="flex size-8 items-center justify-center rounded-full border bg-card text-muted-foreground hover:bg-muted" aria-label="More suggestions">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="space-y-5 pt-2">
            <UserBubble text="What was our total revenue last month?" time="Apr 30, 2025 · 10:24 AM" />
            <RevenueAnswerCard time="Apr 30, 2025 · 10:24 AM" />
          </div>
        </div>

        <div className="hidden lg:block">
          <QuickInsights />
        </div>
      </div>
    </AppShell>
  );
}
