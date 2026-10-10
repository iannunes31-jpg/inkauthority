"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => <p className="font-bold text-base mt-4 mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-bold mt-4 mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-bold text-[13px] uppercase tracking-wide mt-3 mb-1 opacity-80">{children}</p>,
  h4: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h5: ({ children }) => <p className="font-semibold mt-2 mb-1">{children}</p>,
  h6: ({ children }) => <p className="font-semibold mt-2 mb-1">{children}</p>,
  p: ({ children }) => <p className="my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-1 marker:opacity-60">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-1 marker:font-semibold">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  hr: () => <hr className="border-border my-3" />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-3 my-2 opacity-90">{children}</blockquote>,
  code: ({ children }) => <code className="bg-muted rounded px-1 py-0.5 text-[13px]">{children}</code>,
  pre: ({ children }) => <pre className="bg-muted rounded-lg p-3 my-2 overflow-x-auto text-[13px] [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }) => <th className="text-left font-semibold px-3 py-2 border-b border-border whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 border-b border-border align-top">{children}</td>,
};

const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

// Gemini often starts a table right under a list item; without a blank line
// Markdown reads it as part of that item and the raw pipes show up.
function separateTables(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const startsTable = TABLE_ROW.test(lines[i]) && TABLE_SEPARATOR.test(lines[i + 1] ?? "");
    const prev = out[out.length - 1];
    if (startsTable && prev !== undefined && prev.trim() !== "" && !TABLE_ROW.test(prev)) out.push("");
    out.push(lines[i]);
  }
  return out.join("\n");
}

// Memoized so earlier messages don't re-parse on every streamed token.
export const ChatMarkdown = memo(function ChatMarkdown({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`leading-relaxed text-[14px] break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {separateTables(text)}
      </ReactMarkdown>
    </div>
  );
});
