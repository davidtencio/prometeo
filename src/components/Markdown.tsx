"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  children: string;
};

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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
