/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Medical Semantic System
        medical: {
          primary: "#0284C7", // Trustworthy Clinical Blue
          primaryHover: "#0369A1",
          accent: "#0D9488", // Healing Teal
          accentHover: "#0F766E",
          danger: "#EF4444",
          warning: "#F59E0B",

          // Light Mode Canvas
          lightBg: "#F8FAFC", // Ice White background
          lightSurface: "#FFFFFF", // Pure White components
          lightText: "#0F172A", // High visibility text
          lightMuted: "#475569", // Readable secondary text

          // Dark Mode Canvas
          darkBg: "#0B0F19", // Deep Medical Dark (No pure black)
          darkSurface: "#131B2E", // Slightly lighter midnight surface
          darkText: "#F8FAFC", // Crisp text response
          darkMuted: "#94A3B8", // Clear visible subtext
        },
      },
    },
  },
  plugins: [],
};
