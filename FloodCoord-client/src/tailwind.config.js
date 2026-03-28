/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind v4 note:
  // - @tailwindcss/vite belongs in vite.config.js, not here.
  // - Design tokens (colors, fonts, radius, animations) are defined in src/index.css via @theme {}.
  // Keep this file minimal for scan/config purposes only.
}