/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "background": "#121317",
        "on-background": "#e3e2e8",
        "surface-container-low": "#1a1b20",
        "on-secondary-container": "#a1fcf7",
        "surface-variant": "#343439",
        "surface-container": "#1f1f24",
        "on-secondary": "#003735",
        "tertiary-fixed-dim": "#ffb3ae",
        "surface-container-high": "#292a2e",
        "on-surface-variant": "#bacac7",
        "on-tertiary": "#68000b",
        "error-container": "#93000a",
        "on-error": "#690005",
        "secondary-fixed-dim": "#7bd6d1",
        "on-primary-fixed": "#00201e",
        "surface-container-highest": "#343439",
        "primary-container": "#62f9ee",
        "tertiary": "#ffffff",
        "primary-fixed-dim": "#3cdcd1",
        "inverse-surface": "#e3e2e8",
        "primary": "#ffffff",
        "surface": "#121317",
        "on-tertiary-container": "#c31f29",
        "outline-variant": "#3c4948",
        "error": "#ffb4ab",
        "tertiary-fixed": "#ffdad7",
        "inverse-on-surface": "#2f3035",
        "secondary-fixed": "#98f2ed",
        "inverse-primary": "#006a64",
        "outline": "#859491",
        "surface-bright": "#38393e",
        "on-primary-fixed-variant": "#00504b",
        "on-secondary-fixed-variant": "#00504d",
        "secondary-container": "#007774",
        "surface-dim": "#121317",
        "on-error-container": "#ffdad6",
        "on-surface": "#e3e2e8",
        "on-primary-container": "#00716b",
        "surface-container-lowest": "#0d0e12",
        "on-secondary-fixed": "#00201f",
        "tertiary-container": "#ffdad7",
        "primary-fixed": "#62f9ee",
        "on-tertiary-fixed-variant": "#930014",
        "secondary": "#7bd6d1",
        "surface-tint": "#3cdcd1",
        "on-tertiary-fixed": "#410004",
        "on-primary": "#003734"
      },
      fontFamily: {
        headline: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        label: ["var(--font-label)"],
        mono: ["var(--font-mono)"],
        nothing: ["var(--font-nothing)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0",
        lg: "0",
        xl: "0",
        full: "9999px",
        none: "0px"
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate"
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(102, 252, 241, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(102, 252, 241, 0.8)' }
        }
      }
    },
  },
  plugins: [],
};
