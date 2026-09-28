import { HelpCircle } from "lucide-react";

import { askFinanceQA } from "@/data/ask-finance-qa";

export function FallbackAnswer({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <>
      <p className="flex items-center gap-2 text-[14px] leading-relaxed">
        <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
        I don&apos;t have a mock answer for that yet in this demo. Try one of these:
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {askFinanceQA.map((qa) => (
          <button
            key={qa.id}
            onClick={() => onAsk(qa.question)}
            className="rounded-full border bg-card px-3 py-1.5 text-[13px] hover:bg-muted"
          >
            {qa.question}
          </button>
        ))}
      </div>
    </>
  );
}
