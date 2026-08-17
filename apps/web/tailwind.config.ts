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
          50: '#E3FDFD',
          100: '#CBF1F5',
          200: '#A6E3E9',
          500: '#71C9CE',
          600: '#5ab5bb',
          900: '#1e484c',
        }
      }
    }
  },
  plugins: [],
};

export default config;
