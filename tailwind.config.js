/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ghostly: {
          primary: '#4A90E2',
          secondary: '#87CEEB',
          accent: '#6C5CE7',
          success: '#00B894',
          warning: '#FDCB6E',
          danger: '#E17055',
          dark: '#2d3748',
          light: '#f7fafc',
          border: '#e2e8f0',
        }
      },
      backgroundImage: {
        'ghostly-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'ghostly-gradient-light': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'ghostly-wave': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'glassmorphism': 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'count-up': 'count-up 2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'ghost-bounce': 'ghost-bounce 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(106, 92, 231, 0.4)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(106, 92, 231, 0.6)',
            transform: 'scale(1.02)'
          }
        },
        wave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'count-up': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'ghost-bounce': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(-2deg)' },
          '75%': { transform: 'translateY(-5px) rotate(2deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 20px rgba(106, 92, 231, 0.4)',
        'glow-lg': '0 0 30px rgba(106, 92, 231, 0.6)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
