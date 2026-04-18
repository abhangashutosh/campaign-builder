import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B4DFF',
          50: '#EEF2FF',
          700: '#1640D6',
          800: '#0E30A8',
        },
        teal: {
          DEFAULT: '#00C9A7',
          50: '#E6FBF5',
        },
        orange: {
          DEFAULT: '#E85D04',
          50: '#FFF1E6',
        },
        success: {
          DEFAULT: '#16A34A',
          50: '#ECFDF3',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#FEF6E7',
        },
        danger: {
          DEFAULT: '#DC2626',
          50: '#FEECEC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
