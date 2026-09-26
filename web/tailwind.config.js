/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--ink-muted) / <alpha-value>)",
        "ink-subtle": "rgb(var(--ink-subtle) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          hover: "rgb(var(--brand-hover) / <alpha-value>)",
          soft: "rgb(var(--brand-soft) / <alpha-value>)",
          softer: "rgb(var(--brand-softer) / <alpha-value>)",
          line: "rgb(var(--brand-line) / <alpha-value>)",
          on: "rgb(var(--brand-on) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        premium: {
          DEFAULT: "rgb(var(--premium) / <alpha-value>)",
          hover: "rgb(var(--premium-hover) / <alpha-value>)",
          soft: "rgb(var(--premium-soft) / <alpha-value>)",
          softer: "rgb(var(--premium-softer) / <alpha-value>)",
          line: "rgb(var(--premium-line) / <alpha-value>)",
          on: "rgb(var(--premium-on) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          soft: "rgb(var(--success-soft) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          soft: "rgb(var(--warning-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        display: ["clamp(2.25rem, 1.4rem + 3.6vw, 4rem)", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "700" }],
        h1: ["clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["clamp(1.3rem, 1.05rem + 1.1vw, 1.75rem)", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        h3: ["1.0625rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        tiny: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        brand: "var(--shadow-brand)",
        "focus-brand": "var(--ring-brand)",
      },
      maxWidth: {
        prose: "68ch",
        shell: "76rem",
      },
      spacing: {
        13: "3.25rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96) translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
        "bubble-in": {
          from: { opacity: "0", transform: "translateY(6px) scale(.98)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.08)", opacity: "0.2" },
        },
        "dot-bounce": {
          "0%, 70%, 100%": { transform: "translateY(0)" },
          "35%": { transform: "translateY(-4px)" },
        },
        /* Halo de la zone scannée (scan corporel) */
        "zone-pulse": {
          "0%, 100%": { opacity: "0.12", transform: "scale(1)" },
          "50%": { opacity: "0.26", transform: "scale(1.07)" },
        },
        /* Bascule de la tête d'un côté puis de l'autre */
        "head-roll": {
          "0%, 100%": { transform: "rotate(-7deg)" },
          "50%": { transform: "rotate(7deg)" },
        },
        /* Montée / descente sur la pointe des pieds */
        "body-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1.8px)" },
        },
      },
      animation: {
        "fade-rise": "fade-rise .45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in .3s ease both",
        "scale-in": "scale-in .22s cubic-bezier(0.22, 1, 0.36, 1) both",
        "bubble-in": "bubble-in .28s cubic-bezier(0.22, 1, 0.36, 1) both",
        breathe: "breathe 7s ease-in-out infinite",
        "dot-bounce": "dot-bounce 1.2s ease-in-out infinite",
        "zone-pulse": "zone-pulse 2.6s ease-in-out infinite",
        "head-roll": "head-roll 3.4s ease-in-out infinite",
        "body-bob": "body-bob 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
