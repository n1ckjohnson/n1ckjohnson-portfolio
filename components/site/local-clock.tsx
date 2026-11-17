"use client";

import { useEffect, useState } from "react";
import { clockParts, clockText, untilNextMinute, type ClockParts } from "@/lib/time";

/**
 * The time in one place, kept current.
 *
 * - The zone is an IANA name, so the reading is right wherever the visitor
 *   is and daylight saving needs no code here.
 * - Nothing is rendered on the server or during hydration: the server does
 *   not know what time the page will be opened. The line's height is
 *   reserved, and the time fades in once the browser has read its clock.
 * - It re-reads at the start of every minute, and again whenever the tab
 *   comes back into view, since background tabs may skip timers.
 * - Each character has its own slot. Only the characters that changed
 *   move: the old one leaves upward, the new one arrives from below.
 */
export function LocalClock({ timeZone, place }: { timeZone: string; place: string }) {
  const [parts, setParts] = useState<ClockParts | null>(null);

  useEffect(() => {
    let timer = 0;
    const read = () => {
      const next = clockParts(new Date(), timeZone);
      setParts((current) => (current && clockText(current) === clockText(next) ? current : next));
    };
    const schedule = () => {
      window.clearTimeout(timer);
      // A few milliseconds past the minute, so the reading has already changed.
      timer = window.setTimeout(() => {
        read();
        schedule();
      }, untilNextMinute(Date.now()) + 25);
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      read();
      schedule();
    };

    read();
    schedule();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, [timeZone]);

  const hour = parts?.hour ?? "";
  const minute = parts?.minute ?? "";

  return (
    <p>
      {/* Read as one sentence. The moving characters below are for the eye only. */}
      <span className="sr-only">{parts ? `${clockText(parts)} in ${place}` : `Local time in ${place}`}</span>
      <span aria-hidden="true" className="clock" data-ready={parts ? "true" : undefined}>
        <span className="clock__time">
          <Slot digit char={hour.length > 1 ? hour[0] : ""} />
          <Slot digit char={hour.slice(-1)} />
          <Slot char={parts ? ":" : ""} />
          <Slot digit char={minute[0] ?? ""} />
          <Slot digit char={minute[1] ?? ""} />
          <Slot char={parts ? ` ${parts.period[0]}` : ""} />
          <Slot char={parts ? "M" : ""} />
        </span>
        {` in ${place}`}
      </span>
    </p>
  );
}

type SlotState = { current: string; previous: string | null; turn: number };

/** One character of the clock. Remembers the last one just long enough to slide it out. */
function Slot({ char, digit = false }: { char: string; digit?: boolean }) {
  const [state, setState] = useState<SlotState>({ current: char, previous: null, turn: 0 });

  // Derived during render: a changed character starts a new turn.
  if (char !== state.current) {
    // The first value to arrive, and a slot that was empty, appear without a roll.
    const rolls = state.current !== "" && char !== "";
    setState({ current: char, previous: rolls ? state.current : null, turn: state.turn + (rolls ? 1 : 0) });
  }

  const rolling = state.turn > 0 && state.previous !== null;

  return (
    <span className="clock__slot" data-digit={digit ? "" : undefined} data-empty={char === "" ? "" : undefined}>
      {rolling ? (
        <span
          key={`out-${state.turn}`}
          className="clock__char"
          data-move="out"
          onAnimationEnd={() => setState((value) => ({ ...value, previous: null }))}
        >
          {state.previous}
        </span>
      ) : null}
      <span key={`in-${state.turn}`} className="clock__char" data-move={state.turn > 0 ? "in" : undefined}>
        {state.current}
      </span>
    </span>
  );
}
