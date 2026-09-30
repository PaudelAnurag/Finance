"use client";

import { useEffect, useRef, useState } from "react";

import {
  CashDecreaseAnswer,
  CashflowAnswer,
  ExpensesAnswer,
  OverdueAnswer,
  RevenueAnswer,
} from "@/components/ask/answer-cards";
import { AnswerFrame, UserBubble } from "@/components/ask/answer-frame";
import { ChatComposer } from "@/components/ask/chat-composer";
import { FallbackAnswer } from "@/components/ask/fallback-answer";
import { QuickInsights } from "@/components/ask/quick-insights";
import { AppShell } from "@/components/shell/app-shell";
import { AskFinanceKind, askQuestions, findAskFinanceQA } from "@/data/ask-finance-qa";
import { useDataset } from "@/lib/dataset/context";

const answerByKind: Record<AskFinanceKind, React.ComponentType> = {
  revenue: RevenueAnswer,
  "cash-decrease": CashDecreaseAnswer,
  overdue: OverdueAnswer,
  cashflow: CashflowAnswer,
  expenses: ExpensesAnswer,
};

interface ThreadItem {
  id: string;
  question: string;
  kind: AskFinanceKind | null;
  time: string;
}

const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function AskFinancePage() {
  const { source } = useDataset();
  // Newest first: the answer always appears right under the pinned question box.
  const [thread, setThread] = useState<ThreadItem[]>([
    { id: "seed", question: askQuestions.revenue, kind: "revenue", time: "10:24 AM" },
  ]);
  const composerRef = useRef<HTMLDivElement>(null);
  const newestRef = useRef<HTMLDivElement>(null);
  const seenCount = useRef(thread.length);

  function ask(question: string) {
    const match = findAskFinanceQA(question);
    setThread((prev) => [
      { id: `${Date.now()}`, question, kind: match ? match.kind : null, time: now() },
      ...prev,
    ]);
  }

  // Bring the new answer straight into view, just below the pinned composer.
  useEffect(() => {
    if (thread.length === seenCount.current) return;
    seenCount.current = thread.length;
    const el = newestRef.current;
    if (!el) return;
    el.style.scrollMarginTop = `${(composerRef.current?.offsetHeight ?? 0) + 12}px`;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [thread.length]);

  return (
    <AppShell
      title="Ask Finance AI"
      subtitle="Get instant answers about your finances, cash flow, and business performance."
    >
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div
            ref={composerRef}
            className="sticky top-0 z-20 -mx-6 bg-background/95 px-6 pb-3 pt-1 backdrop-blur md:-mx-10 md:px-10"
          >
            <ChatComposer onAsk={ask} />
          </div>

          <div className="space-y-8 pt-3">
            {thread.map((item, i) => {
              const Answer = item.kind ? answerByKind[item.kind] : null;
              return (
                <div key={item.id} ref={i === 0 ? newestRef : undefined} className="space-y-5">
                  <UserBubble text={item.question} time={item.time} />
                  <AnswerFrame
                    time={item.time}
                    source={
                      item.kind
                        ? source === "csv"
                          ? "Your uploaded CSV data"
                          : "No data uploaded yet — all figures are 0"
                        : "No matching mock answer"
                    }
                  >
                    {Answer ? <Answer /> : <FallbackAnswer onAsk={ask} />}
                  </AnswerFrame>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block">
          <QuickInsights onAsk={ask} />
        </div>
      </div>
    </AppShell>
  );
}
