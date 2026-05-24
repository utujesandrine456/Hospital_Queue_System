import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: '#769382',
        beige: '#E6E1D3',
        gray: {
          soft: '#C0C3B9',
        },
        cream: '#F3EFE3',
      },
      fontFamily: {
        sans: ['var(--font-sen)', 'system-ui', 'sans-serif'],
        sen: ['var(--font-sen)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config