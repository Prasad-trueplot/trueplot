import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        field: "#EEF3EE",
        plot: "#276749",
        earth: "#8A5A44",
      },
    },
  },
  plugins: [],
};

export default config;

