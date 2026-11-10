import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { primary: { DEFAULT: "var(--color-primary)", hover: "var(--color-primary-hover)" }, muted: "var(--color-muted)" },
    },
  },
  plugins: [],
};

export default config;
