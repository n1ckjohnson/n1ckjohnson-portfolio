import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#ffffff",
        ink: "#171717",
        muted: "#6b665d",
        line: "rgba(23, 23, 23, 0.08)"
      },
      fontFamily: {
        brand: ["var(--font-inter)", "Inter", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        headline: ["var(--font-inter)", "Inter", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        sans: [
          "var(--font-inter)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "Avenir Next",
          "Segoe UI",
          "sans-serif"
        ],
        display: [
          "var(--font-inter)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "Avenir Next",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
