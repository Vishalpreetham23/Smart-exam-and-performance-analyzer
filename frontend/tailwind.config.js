/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Peach/Earthy palette
        gray: {
          50: '#F8EDE8', // Background
          100: '#F3D6CC', // Icon Background / Register Button BG
          200: '#F2C9BC', // Border color
          700: '#7A6F6A', // Normal text
          800: '#4A3F3A', // Heading color
          900: '#2A251E',
          400: '#B0A4A0', // Placeholder
        },
        primary: {
          50: '#FDF3F2',
          100: '#F3D6CC',
          200: '#F2C9BC',
          500: '#E8A18C', // Primary Peach
          600: '#D9907A', // Hover Peach
          700: '#BF7A66',
        },
        secondary: {
          color: '#8A5A4A', // Register Button Text color
        }
      },
      boxShadow: {
        'premium': '0 8px 20px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
