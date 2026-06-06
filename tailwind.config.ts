import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#C4881B", light: "#DAA520", dark: "#8B6914" },
        crimson: { DEFAULT: "#B91C1C", light: "#DC2626" },
        navy: { DEFAULT: "#1E3A5F", light: "#2B4F7E", dark: "#0F2640" },
        brown: "#6B3A2A",
        cream: "#FFF8F0",
        ivory: "#FFFBF5",
        primary: "#1E3A5F",
        accent: "#C4881B",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#B91C1C",
        background: "#FFF8F0",
        border: "#E8D5C0",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        tamil: ["Arima", "Catamaran", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
