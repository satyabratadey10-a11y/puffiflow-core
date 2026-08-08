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
        puffi: {
          50: '#f0f7ff',
          500: '#3b82f6',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
};

export default config;
