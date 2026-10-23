"use client";

import { Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: ReactNode; text: string; disabled?: boolean };

// Reads the <option> children so pages can swap <select> for <Select> without other changes.
function readOptions(children: ReactNode): Option[] {
  const out: Option[] = [];
  const walk = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as { value?: unknown; children?: ReactNode; disabled?: boolean };
      if (child.type === "option") {
        const label = props.children;
        const text = Children.toArray(label).map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : "")).join("");
        out.push({ value: String(props.value ?? text), label, text, disabled: props.disabled });
      } else if (props.children) {
        walk(props.children);
      }
    });
  walk(children);
  return out;
}

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  id?: string;
};

export function Select({ value, defaultValue, onChange, disabled, className, children, id, ...rest }: Props) {
  const options = readOptions(children);
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = value ?? inner;
  const selected = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxH: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();

  const place = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 220 && above > below;
    setPos({
      left: r.left,
      width: r.width,
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      maxH: Math.min(320, up ? above : below),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (o: Option) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    if (o.value !== current) onChange?.({ target: { value: o.value } });
    setOpen(false);
    triggerRef.current?.focus();
  };

  const step = (dir: 1 | -1) => {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) return setActive(i);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      return setOpen(true);
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (options[active]) choose(options[active]); }
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      // Type-ahead: jump to the first option starting with what was typed.
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
      const i = options.findIndex((o) => !o.disabled && o.text.toLowerCase().startsWith(typed.current.text));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={rest["aria-label"]}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full flex items-center justify-between gap-2 text-left bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          className,
          open && "border-primary"
        )}
      >
        <span className={cn("truncate", !selected?.value && "text-muted-foreground")}>{selected?.label ?? "Selecionar"}</span>
        <ChevronDown className={cn("w-4 h-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && pos &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            onKeyDown={onKeyDown}
            style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH, zIndex: 300 }}
            className="overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/40 p-1 animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {options.map((o, i) => {
              const isSel = o.value === current;
              return (
                <div
                  key={o.value + i}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled}
                  onMouseEnter={() => !o.disabled && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer select-none",
                    i === active && "bg-foreground/10",
                    isSel && "font-semibold",
                    !o.value && "text-muted-foreground",
                    o.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && <Check className="w-4 h-4 shrink-0" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
