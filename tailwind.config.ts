import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(var(--color-brand) / <alpha-value>)",
          dark: "hsl(var(--color-brand-dark) / <alpha-value>)",
        },
        navy: "hsl(var(--color-navy) / <alpha-value>)",
        page: "hsl(var(--color-page) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        subtle: "hsl(var(--color-subtle) / <alpha-value>)",
        foreground: "hsl(var(--color-text-primary) / <alpha-value>)",
        muted: "hsl(var(--color-text-muted) / <alpha-value>)",
        line: "hsl(var(--color-border) / <alpha-value>)",
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        danger: "hsl(var(--color-danger) / <alpha-value>)",
      },
      borderRadius: {
        ui: "var(--radius-ui)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;
