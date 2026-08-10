import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7fe",
          200: "#bfd4fe",
          300: "#93b6fd",
          400: "#608df9",
          500: "#3d68f2",
          600: "#2a48e6",
          700: "#2338c7",
          800: "#22319f",
          900: "#212f7d",
          950: "#161c4a",
        },
        surface: {
          light: "#f7f8fb",
          dark: "#0f1424",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16,24,40,0.06), 0 1px 3px 0 rgba(16,24,40,0.08)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "blob-a": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(48px, -56px) scale(1.12)" },
          "66%": { transform: "translate(-36px, 40px) scale(0.92)" },
        },
        "blob-b": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(-64px, 36px) scale(1.18)" },
          "70%": { transform: "translate(52px, -28px) scale(0.9)" },
        },
        "blob-c": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "35%": { transform: "translate(40px, 60px) scale(1.08)" },
          "75%": { transform: "translate(-48px, -36px) scale(0.94)" },
        },
      },
      animation: {
        "fade-in": "fade-in .2s ease-out",
        "slide-up": "slide-up .25s ease-out",
        "gradient-pan": "gradient-pan 14s ease-in-out infinite",
        "blob-a": "blob-a 22s ease-in-out infinite",
        "blob-b": "blob-b 27s ease-in-out infinite",
        "blob-c": "blob-c 24s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
