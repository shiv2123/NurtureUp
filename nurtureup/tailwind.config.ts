import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Keep existing NurtureUp colors for backward compatibility
        'nurtureup-primary': {
          DEFAULT: '#4F8EF7', // Main brand color from blueprint
          50: '#EEF4FF',
          100: '#E0ECFF',
          200: '#C7DDFF',
          300: '#A5C4FF',
          400: '#5D91FF',
          500: '#4F8EF7', // Main
          600: '#3E6ED8', // Teen variation
          700: '#2E4A9F', // Adolescence
          800: '#1E3B82',
          900: '#1A2655',
        },
        
        // Blueprint Secondary Colors (renamed to avoid conflict)
        'nurtureup-secondary': {
          DEFAULT: '#F7B23D', // Sunshine gold
          50: '#FFF9E6',
          100: '#FFF2CC',
          200: '#FFE599',
          300: '#FFD866',
          400: '#FFCB33',
          500: '#F7B23D',
          600: '#E5A02A',
          700: '#CC8F18',
          800: '#B37E05',
          900: '#996D00',
        },
        
        // Stage-specific theme tokens from blueprint
        'stage': {
          'toddler': '#FFB13D',
          'early-childhood': '#4F8EF7',
          'school-age': '#3E6ED8',
          'adolescence': '#2E4A9F',
        },
        
        // Semantic colors from blueprint
        'success': '#3CC168',
        'warning': '#F7A53D',
        'danger': '#E45757',
        'info': '#4F8EF7',
        
        // Blueprint neutral system
        'neutral': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        
        // Surface colors for cards and backgrounds
        'surface': {
          light: '#FFFFFF',
          DEFAULT: '#F5F5F5',
          dark: '#27272A',
        },
        
        'background': {
          light: '#FFFFFF',
          dark: '#18181B',
        },
        
        // Blueprint outline color
        'outline': 'rgba(0, 0, 0, 0.08)',
      },
      
      // Blueprint typography system
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Parent interface
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'], // Headers
        child: ['Nunito Sans', 'system-ui', 'sans-serif'], // Child interface (friendly)
        mono: ['JetBrains Mono', 'SF Mono', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px
        'base': ['1rem', { lineHeight: '1.5' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.25' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.25' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],        // 48px
      },
      animation: {
        'bounce-soft': 'bounce 1s ease-in-out infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spinSlow 8s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'fade-out': 'fadeOut 0.5s ease-out forwards'
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0) rotate(-360deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(-180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' }
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' }
        }
      },
      backdropFilter: {
        'glass': 'blur(10px) saturate(180%)',
        'frost': 'blur(16px) saturate(200%)',
      },
      backgroundImage: {
        'gradient-modern': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-soft': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-calm': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-parent': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-child': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        
        // Demo UI design system gradients
        'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #06D6A0 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        'gradient-fab': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        
        // App background
        'app-bg': 'linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 50%, #D1FAE5 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Keep existing for backward compatibility
        'xs': '4px',
        'xl': '20px',   // Child cards
        '2xl': '24px',
        '3xl': '28px',  // FAB
        'card-parent': '16px',  // Blueprint spec
        'card-child': '20px',   // Blueprint spec
        'pill': '999px'
      },
      
      // Blueprint boxShadow system - exact shadow specifications from section 13
      boxShadow: {
        'none': '0 0 #0000',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.08)', // Blueprint card shadow
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        
        // Blueprint elevation levels
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)', // 2dp elevation
        'modal': '0 10px 25px rgba(0, 0, 0, 0.15)', // 8dp elevation
        'fab': '0 4px 14px rgba(0, 0, 0, 0.15)', // 12dp elevation
      },
      
      // Blueprint motion system - cubic-bezier(0.25, 0.8, 0.5, 1) easing
      transitionTimingFunction: {
        'blueprint': 'cubic-bezier(0.25, 0.8, 0.5, 1)', // Blueprint easing
        'out': 'cubic-bezier(0.25, 0.8, 0.5, 1)', // Same as blueprint
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      
      // Blueprint motion durations - xs: 150ms, sm: 250ms, md: 400ms, lg: 700ms
      transitionDuration: {
        'xs': '150ms', // Blueprint XS
        'sm': '250ms', // Blueprint SM  
        'md': '400ms', // Blueprint MD
        'lg': '700ms', // Blueprint LG
        'fast': '150ms',
        'normal': '250ms', 
        'slow': '400ms'
      },
      
      // Blueprint spacing scale - 8pt grid: [4, 8, 12, 16, 24, 32, 40]
      spacing: {
        '0': '0px',
        '1': '4px',   // Blueprint scale[0]  
        '2': '8px',   // Blueprint scale[1] - base unit
        '3': '12px',  // Blueprint scale[2]
        '4': '16px',  // Blueprint scale[3] - 2x base
        '5': '20px',
        '6': '24px',  // Blueprint scale[4] - 3x base
        '7': '28px',
        '8': '32px',  // Blueprint scale[5] - 4x base
        '9': '36px',
        '10': '40px', // Blueprint scale[6] - 5x base
        '11': '44px', // ButtonPrimary height from blueprint
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      }
    }
  },
  plugins: [
    // require('daisyui') // DISABLED for demo UI - DaisyUI conflicts with demo styles
  ],
  // daisyui: {
  //   themes: [
  //     {
  //       nurtureup: {
  //         "primary": "#4F8EF7",
  //         "secondary": "#F7B23D", 
  //         "accent": "#3CC168",
  //         "neutral": "#64748B",
  //         "base-100": "#FFFFFF",
  //         "base-200": "#F1F5F9",
  //         "base-300": "#E2E8F0",
  //         "info": "#4F8EF7",
  //         "success": "#3CC168",
  //         "warning": "#F7A53D",
  //         "error": "#E45757",
  //       }
  //     },
  //     "light"
  //   ],
  //   base: true,
  //   styled: true,
  //   utils: true,
  // }
}

export default config 