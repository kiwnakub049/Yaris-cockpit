/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tesla: {
          black: '#0a0a0a',
          darkgray: '#1a1a1a',
          gray: '#2a2a2a',
          lightgray: '#404040',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'gpu-spin': 'gpuSpin 1s linear infinite',
        'gpu-pulse': 'gpuPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateZ(0)' },
          '100%': { opacity: '1', transform: 'translateZ(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translate3d(-100%, 0, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        slideInRight: {
          '0%': { transform: 'translate3d(100%, 0, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        gpuSpin: {
          'from': { transform: 'rotate3d(0, 0, 1, 0deg)' },
          'to': { transform: 'rotate3d(0, 0, 1, 360deg)' },
        },
        gpuPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale3d(1, 1, 1)' },
          '50%': { opacity: '.5', transform: 'scale3d(1.05, 1.05, 1)' },
        },
      },
      willChange: {
        'transform': 'transform',
        'opacity': 'opacity',
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [],
}
