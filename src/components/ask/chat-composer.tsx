"use client";

import { Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { askFinanceQA } from "@/data/ask-finance-qa";

export function ChatComposer({ onAsk }: { onAsk: (question: string) => void }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (!value.trim()) return;
    onAsk(value);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <Card className="shadow-sm">
      <div className="flex items-center gap-3 px-4 pt-3">
        <Sparkles className="size-4.5 shrink-0 text-accent" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ask a question about your finances…"
          aria-label="Ask a question about your finances"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          aria-label="Send"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent/90"
        >
          <Send className="size-4" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2.5" aria-label="Suggested questions">
        {askFinanceQA.map((qa) => (
          <button
            key={qa.id}
            onClick={() => onAsk(qa.question)}
            className="shrink-0 rounded-full border border-accent/20 bg-[var(--badge-blue-bg)] px-3 py-1 text-[13px] text-accent hover:bg-accent hover:text-white"
          >
            {qa.question}
          </button>
        ))}
      </div>
    </Card>
  );
}
