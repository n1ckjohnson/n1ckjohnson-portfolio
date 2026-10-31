import type { Config } from "tailwindcss";

/**
 * Design tokens. Colors, easing and durations resolve to CSS variables
 * defined in app/globals.css so CSS-only and JS-driven motion share them.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"]
      },
      fontSize: {
        // [size, line-height, tracking]
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.005em" }],
        small: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        body: ["0.9375rem", { lineHeight: "1.5rem", letterSpacing: "-0.006em" }],
        lead: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.012em" }],
        title: ["1.75rem", { lineHeight: "2.125rem", letterSpacing: "-0.025em" }],
        display: ["2.25rem", { lineHeight: "2.625rem", letterSpacing: "-0.032em" }]
      },
      maxWidth: {
        measure: "34rem",
        page: "76rem"
      },
      spacing: {
        gutter: "var(--gutter)"
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)"
      },
      transitionDuration: {
        press: "var(--dur-press)",
        quick: "var(--dur-quick)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)"
      }
    }
  },
  plugins: []
};

export default config;
