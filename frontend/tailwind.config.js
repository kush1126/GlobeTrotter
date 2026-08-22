/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          muted: "#475569",
          faint: "#94A3B8",
        },
        paper: {
          DEFAULT: "#F9F8F5",
          pure: "#FFFFFF",
          dim: "#E8E4DA",
          dark: "#D8D2C2",
        },
        route: {
          DEFAULT: "#0F766E",
          light: "#14B8A6",
          dark: "#115E59",
          subtle: "#F0FDFA",
        },
        ochre: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          subtle: "#FEF3C7",
        },
        rust: {
          DEFAULT: "#E11D48",
          dark: "#BE123C",
          subtle: "#FFE4E6",
        },
        indigo: {
          brand: "#4338CA",
          subtle: "#EEF2FF",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        heading: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        body: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        lift: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
