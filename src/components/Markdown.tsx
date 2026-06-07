"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  children: string;
};

function CodeBlock({ children }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(ref.current?.innerText ?? "").then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-borderSoft bg-surface/80 px-2 py-1 text-xs text-mutedText opacity-0 transition hover:text-white group-hover:opacity-100"
        aria-label="Copiar código"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <div
      className="prose prose-invert prose-sm max-w-none leading-relaxed
        prose-p:my-2 prose-headings:text-white prose-strong:text-white
        prose-a:text-sky-300 prose-li:my-0.5
        prose-code:rounded prose-code:bg-surface/70 prose-code:px-1.5 prose-code:py-0.5
        prose-code:text-brand prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-surface/70 prose-pre:border prose-pre:border-borderSoft
        prose-table:text-sm prose-th:text-white prose-td:border-borderSoft"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
