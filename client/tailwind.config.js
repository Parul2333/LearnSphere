/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRITICAL: This line tells Tailwind where your classes are
  ],
  theme: {
    extend: {
        // You can define custom colors/fonts/animations here later
    },
  },
  plugins: [],
}