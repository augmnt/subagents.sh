/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        // Core dark palette
        background: 'var(--background)',
        'background-subtle': 'var(--background-subtle)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',

        // Text colors
        foreground: 'var(--text-primary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',

        // Accent (electric cyan)
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
        },

        // Semantic colors
        primary: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--background)',
        },
        secondary: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },

        // Card/popover
        card: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-primary)',
        },

        // Input/ring
        input: 'var(--border)',
        ring: 'var(--accent)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      boxShadow: {
        'glow': '0 0 20px var(--accent-muted)',
        'glow-sm': '0 0 10px var(--accent-muted)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px var(--accent-muted)' },
          '50%': { boxShadow: '0 0 30px var(--accent-muted)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
