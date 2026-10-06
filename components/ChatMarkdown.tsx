"use client";

import React from "react";

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      return <strong key={i}><em>{part.slice(3, -3)}</em></strong>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ChatMarkdown({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^---+$/.test(trimmed) || /^—{2,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-white/10 my-2" />);
    } else if (/^###\s/.test(line)) {
      elements.push(
        <p key={i} className="font-bold text-[13px] uppercase tracking-wide mt-3 mb-0.5 opacity-70">
          {renderInline(line.replace(/^###\s/, ""))}
        </p>
      );
    } else if (/^##\s/.test(line)) {
      elements.push(
        <p key={i} className="font-bold mt-3 mb-0.5">
          {renderInline(line.replace(/^##\s/, ""))}
        </p>
      );
    } else if (/^#\s/.test(line)) {
      elements.push(
        <p key={i} className="font-bold text-base mt-3 mb-0.5">
          {renderInline(line.replace(/^#\s/, ""))}
        </p>
      );
    } else if (/^[-•]\s/.test(line)) {
      elements.push(
        <p key={i} className="pl-3 flex gap-1.5">
          <span className="shrink-0 mt-[3px] opacity-60">•</span>
          <span>{renderInline(line.replace(/^[-•]\s/, ""))}</span>
        </p>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/)!;
      elements.push(
        <p key={i} className="pl-3 flex gap-1.5">
          <span className="shrink-0 font-semibold">{match[1]}.</span>
          <span>{renderInline(match[2])}</span>
        </p>
      );
    } else if (trimmed === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
    }
  }

  return <div className={`space-y-1 leading-relaxed text-[14px] ${className}`}>{elements}</div>;
}
