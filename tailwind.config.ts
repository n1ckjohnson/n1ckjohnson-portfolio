import type { Config } from "tailwindcss";

/**
 * Design tokens. Colours, easing and durations resolve to CSS variables
 * defined in app/globals.css so CSS-only and JS-driven motion share them.
 *
 * The type scale is deliberately flat: one size for reading, one for small
 * labels, and a page title only a step larger. Hierarchy comes from colour
 * and weight, not from size.
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
        canvas: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        accent: "var(--accent)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"]
      },
      fontSize: {
        // [size, line-height, tracking]
        small: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "-0.003em" }],
        body: ["0.9375rem", { lineHeight: "1.5rem", letterSpacing: "-0.009em" }],
        title: ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.016em" }]
      },
      maxWidth: {
        measure: "var(--measure)",
        stage: "var(--stage)"
      },
      spacing: {
        gutter: "var(--gutter)"
      },
      borderRadius: {
        stage: "var(--radius)",
        s: "var(--radius-s)"
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
