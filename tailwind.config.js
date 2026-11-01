/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#010201',
          900: '#040603',
          800: '#080B07',
          700: '#0D120C',
          600: '#141C15',
        },
        glass: {
          light: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.10)',
          dim: 'rgba(255,255,255,0.03)',
        },
        mint: {
          50: '#F0FFF8',
          100: '#DFFFEE',
          200: '#A8FFD9',
          300: '#6BFFB8',
          400: '#2BFF9C',
          500: '#0DED84',
          600: '#0BC46C',
          700: '#0A9758',
        },
        ink: {
          50: '#F5FAF7',
          100: '#DCE6E0',
          200: '#B4C2B9',
          300: '#8C9C91',
          400: '#6E7D73',
        },
      },
      fontFamily: {
        display: ['System'],
      },
      borderRadius: {
        '4xl': '28px',
        '5xl': '34px',
      },
    },
  },
  plugins: [],
};
