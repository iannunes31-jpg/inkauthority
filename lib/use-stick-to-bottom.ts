"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

// Follows streamed text only while the reader is at the bottom; scrolling up
// to read stops the auto-scroll, and sending a new message resumes it.
export function useStickToBottom(ref: RefObject<HTMLElement | null>, messages: { role: string }[]) {
  const stick = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  const lastRole = messages[messages.length - 1]?.role;
  useLayoutEffect(() => {
    if (lastRole === "user") stick.current = true;
  }, [messages.length, lastRole]);

  // Runs before paint on every render so streamed text never visibly jumps.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  });
}
