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
        // Mapped to CSS custom properties — design HTML source of truth
        navy: {
          DEFAULT: 'var(--navy)',           // #1B4DFF
          50:      'var(--navy-50)',         // #EEF2FF
          700:     'var(--navy-700)',        // #1640D6
          800:     'var(--navy-800)',        // #0E30A8
        },
        teal: {
          DEFAULT: 'var(--teal)',            // #00C9A7
          50:      'var(--teal-50)',         // #E6FBF5
        },
        orange: {
          DEFAULT: 'var(--orange)',          // #E85D04
          50:      'var(--orange-50)',       // #FFF1E6
        },
        success: {
          DEFAULT: 'var(--success)',         // #16A34A
          50:      'var(--success-50)',      // #ECFDF3
        },
        warning: {
          DEFAULT: 'var(--warning)',         // #D97706
          50:      'var(--warning-50)',      // #FEF6E7
        },
        danger: {
          DEFAULT: 'var(--danger)',          // #DC2626
          50:      'var(--danger-50)',       // #FEECEC
        },
        primary:  'var(--navy)',
        surface:  'var(--surface)',
        border:   'var(--border)',
        'text-1': 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
