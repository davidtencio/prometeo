import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0c1117",
        panel: "#111821",
        panelSoft: "#17202b",
        borderSoft: "#263342",
        brand: "#49d18c",
        brandDark: "#1f9d66",
        mutedText: "#9aa7b4"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
