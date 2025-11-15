/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRITICAL: This line tells Tailwind where your classes are
  ],
  theme: {
    extend: {
        keyframes: {
            'fade-in-down': {
                '0%': {
                    opacity: '0',
                    transform: 'translateY(-20px)'
                },
                '100%': {
                    opacity: '1',
                    transform: 'translateY(0)'
                },
            },
            'fade-in-up': {
                '0%': {
                    opacity: '0',
                    transform: 'translateY(20px)'
                },
                '100%': {
                    opacity: '1',
                    transform: 'translateY(0)'
                },
            },
            'fade-in': {
                '0%': {
                    opacity: '0'
                },
                '100%': {
                    opacity: '1'
                },
            },
            'blob': {
                '0%, 100%': {
                    transform: 'translate(0, 0) scale(1)'
                },
                '33%': {
                    transform: 'translate(30px, -50px) scale(1.1)'
                },
                '66%': {
                    transform: 'translate(-20px, 20px) scale(0.9)'
                }
            },
        },
        animation: {
            'fade-in-down': 'fade-in-down 0.6s ease-out',
            'fade-in-up': 'fade-in-up 0.6s ease-out',
            'fade-in': 'fade-in 0.6s ease-out',
            'blob': 'blob 7s infinite',
        }
    },
  },
  plugins: [],
}
