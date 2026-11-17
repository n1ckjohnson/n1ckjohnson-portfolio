"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type Option = {
  key: string;
  label: string;
  /** Read out instead of the label where the label alone is too terse. */
  name?: string;
  disabled?: boolean;
};

/**
 * A segmented control: one choice from a short list.
 *
 * It is a radio group, so arrow keys move the selection and Tab moves past
 * the whole control. Every interactive demonstration on the site uses this
 * one component, which is what keeps their controls consistent.
 */
export function Segmented({
  label,
  options,
  value,
  onChange,
  onPeek,
  className,
}: {
  /** Names the group for assistive technology. */
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (key: string) => void;
  /** Called when an option is about to be chosen, to warm its media. */
  onPeek?: (key: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = options.filter((option) => !option.disabled);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    const edge = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : null;
    if ((!step && edge === null) || !enabled.length) return;
    event.preventDefault();
    const at = enabled.findIndex((option) => option.key === value);
    const next = enabled[edge ?? (at + step + enabled.length) % enabled.length];
    onChange(next.key);
    ref.current?.querySelector<HTMLButtonElement>(`[data-key="${next.key}"]`)?.focus();
  };

  return (
    <div ref={ref} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn("seg", className)}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          data-key={option.key}
          data-label={option.label}
          aria-checked={option.key === value}
          aria-label={option.name}
          disabled={option.disabled}
          tabIndex={option.key === value ? 0 : -1}
          className="seg__item"
          onClick={() => onChange(option.key)}
          onPointerEnter={onPeek ? () => onPeek(option.key) : undefined}
          onFocus={onPeek ? () => onPeek(option.key) : undefined}
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

/** An on/off control in the same voice. */
export function Toggle({ pressed, onChange, label }: { pressed: boolean; onChange: (pressed: boolean) => void; label: string }) {
  return (
    <span className="seg">
      <button type="button" className="seg__item" data-label={label} aria-pressed={pressed} onClick={() => onChange(!pressed)}>
        <span>{label}</span>
      </button>
    </span>
  );
}
