import plugin from 'tailwindcss/plugin'
import { brandGreen, neonOrange } from '../colors.js'

// Get color values without the leading #
const greenColor = brandGreen[500].substring(1)
const orangeColor = neonOrange[500].substring(1)

export default plugin(function ({ addBase, addUtilities }) {
    // 1. Base keyframes for all animations
    addBase({
        // These keyframes are used by active animations
        '@keyframes iconGentlePulse': {
            '0%':   { transform: 'scale(1)', color: `#${greenColor}` },
            '20%':  { transform: 'scale(1.15)', color: `#${orangeColor}` },
            '50%':  { transform: 'scale(1.2)', color: `#${orangeColor}`, filter: 'drop-shadow(0 0 5px rgba(255,107,0,0.7))' },
            '80%':  { transform: 'scale(1.15)', color: `#${orangeColor}` },
            '100%': { transform: 'scale(1)', color: `#${greenColor}` },
        },
        '@keyframes navLinkUnderline': {
            '0%': { transform: 'scaleX(0)', opacity: '0' },
            '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        '@keyframes navLinkGlow': {
            '0%': { textShadow: `0 0 0 rgba(${parseInt(orangeColor.substring(0, 2), 16)}, ${parseInt(orangeColor.substring(2, 4), 16)}, ${parseInt(orangeColor.substring(4, 6), 16)}, 0)` },
            '100%': { textShadow: `0 0 5px rgba(${parseInt(orangeColor.substring(0, 2), 16)}, ${parseInt(orangeColor.substring(2, 4), 16)}, ${parseInt(orangeColor.substring(4, 6), 16)}, 0.3)` },
        },
        '@keyframes fadeIn': {
            'from': { 
                opacity: '0', 
                transform: 'translateY(10px)' 
            },
            'to': { 
                opacity: '1', 
                transform: 'translateY(0)' 
            }
        },
        '@keyframes smoothFadeIn': {
            '0%': { 
                opacity: '0', 
                transform: 'translateY(15px)',
                filter: 'blur(5px)'
            },
            '60%': {
                filter: 'blur(0)'
            },
            '100%': { 
                opacity: '1', 
                transform: 'translateY(0)',
                filter: 'blur(0)'
            }
        },
        '@keyframes titleReveal': {
            '0%': { 
                opacity: '0',
                transform: 'scale(0.97) translateY(10px)',
                filter: 'blur(8px)'
            },
            '30%': {
                opacity: '0.5',
                filter: 'blur(4px)'
            },
            '100%': { 
                opacity: '1', 
                transform: 'scale(1) translateY(0)',
                filter: 'blur(0)'
            }
        },
        '@keyframes subtleSlideUp': {
            '0%': { 
                opacity: '0', 
                transform: 'translateY(8px)'
            },
            '100%': { 
                opacity: '1', 
                transform: 'translateY(0)'
            }
        },
        '@keyframes pulseSlow': {
            '0%': { opacity: '0.1', transform: 'scale(1)' },
            '50%': { opacity: '0.3', transform: 'scale(1.05)' },
            '100%': { opacity: '0.1', transform: 'scale(1)' }
        },
        '@keyframes navUnderline': {
            '0%': { width: '0%', opacity: '0' },
            '100%': { width: '100%', opacity: '1' }
        },
        '@keyframes navItemFloat': {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-2px)' },
            '100%': { transform: 'translateY(0)' }
        },
        '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(4px)' },
        },
        '@keyframes drawLineFromCenter': {
            '0%': { 
                width: '0%', 
                left: '50%',
                opacity: '0' 
            },
            '50%': { 
                opacity: '1' 
            },
            '100%': { 
                width: '50%', 
                left: '25%',
                opacity: '1' 
            }
        },
        '@keyframes accentLineDrawMobile': {
            '0%, 20%': { 
                width: '0', 
                opacity: '0' 
            },
            '30%': { 
                width: '0', 
                opacity: '1' 
            },
            '60%, 100%': { 
                width: '50%', 
                opacity: '1' 
            }
        },
        '@keyframes subtleShimmer': {
            '0%': { backgroundPosition: '-100% 0', opacity: '0' },
            '30%': { opacity: '0.7' },
            '70%': { opacity: '0.7' },
            '100%': { backgroundPosition: '200% 0', opacity: '0' }
        },
        '@keyframes shimmer': {
            '0%': { backgroundPosition: '200% 0' },
            '50%': { backgroundPosition: '0% 0' },
            '100%': { backgroundPosition: '-200% 0' }
        },
        '@keyframes cornerHighlight': {
            '0%, 25%': { 
                opacity: '0',
                transform: 'scale(0.8)' 
            },
            '50%': { 
                opacity: '1',
                transform: 'scale(1)' 
            },
            '75%, 100%': { 
                opacity: '0.7',
                transform: 'scale(1)' 
            }
        },
        '@keyframes pulseGentle': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-4px)' }
        },
        '@keyframes light-sweep': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
        },
        '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
        },
        '@keyframes float-delayed': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
        },
        '@keyframes float-slow': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' }
        },
        '@keyframes scroll-indicator': {
            '0%': { transform: 'translateY(0)', opacity: '0.7' },
            '50%': { transform: 'translateY(5px)', opacity: '1' },
            '100%': { transform: 'translateY(0)', opacity: '0.7' }
        },
        '@keyframes pulse-subtle': {
            '0%': { opacity: '0.6', transform: 'scale(1)' },
            '50%': { opacity: '1', transform: 'scale(1.05)' },
            '100%': { opacity: '0.6', transform: 'scale(1)' }
        },
        '@keyframes bounce-gentle': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' }
        },
        '@keyframes spin-slow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
        },
        '@keyframes celebrate': {
            '0%': { transform: 'scale(1)' },
            '25%': { transform: 'scale(1.2)' },
            '50%': { transform: 'scale(0.95)' },
            '75%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
        }
    });

    // 2. Add the animation utilities (removing the unused ones)
    addUtilities({
        '.animate-icon-gentle-pulse': {
            animation: 'iconGentlePulse 2s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            willChange: 'transform, color, filter',
        },
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
        '.nav-link-hover': {
            position: 'relative',
            transition: 'color 0.3s ease, transform 0.3s ease',
        },
        '.animate-fade-in': {
            animation: 'fadeIn 0.3s ease-out forwards',
            willChange: 'transform, opacity',
        },
        '.animate-fade-in-1': {
            animation: 'fadeIn 0.3s ease-out forwards',
            animationDelay: '100ms',
            animationFillMode: 'forwards',
            willChange: 'transform, opacity',
        },
        '.animate-fade-in-2': {
            animation: 'fadeIn 0.3s ease-out forwards',
            animationDelay: '200ms',
            animationFillMode: 'forwards',
            willChange: 'transform, opacity',
        },
        '.animate-fade-in-3': {
            animation: 'fadeIn 0.3s ease-out forwards',
            animationDelay: '300ms',
            animationFillMode: 'forwards',
            willChange: 'transform, opacity',
        },
        '.animate-pulse-slow': {
            animation: 'pulseSlow 3s ease-in-out infinite',
            willChange: 'opacity, transform',
        },
        '.animate-nav-underline': {
            animation: 'navUnderline 0.3s ease-out forwards',
            willChange: 'width, opacity',
        },
        '.animate-nav-float': {
            animation: 'navItemFloat 1.5s ease-in-out infinite',
            willChange: 'transform',
        },
        '.animate-bounce': {
            animation: 'bounce 1.5s ease-in-out infinite',
            willChange: 'transform',
        },
        '.animate-line-from-center': {
            animation: 'drawLineFromCenter 0.6s ease-out forwards',
            willChange: 'width, left, opacity',
        },
        '.animate-accent-line-draw': {
            animation: 'accentLineDrawMobile 1.5s ease-out forwards',
            animationDelay: '0.8s',
            willChange: 'width, opacity',
        },
        '.animate-subtle-shimmer': {
            animation: 'subtleShimmer 3s ease-in-out infinite',
            backgroundSize: '200% 100%',
            willChange: 'background-position, opacity',
        },
        '.animate-corner-highlight': {
            animation: 'cornerHighlight 2s ease-out forwards',
            animationDelay: '0.5s',
            willChange: 'opacity, transform',
        },
        '.animate-pulse-gentle': {
            animation: 'pulseGentle 2s infinite ease-in-out',
            willChange: 'transform',
        },
        '.animate-smooth-fade-in': {
            animation: 'smoothFadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
            willChange: 'transform, opacity, filter',
        },
        '.animate-title-reveal': {
            animation: 'titleReveal 1.2s cubic-bezier(0.33, 1, 0.68, 1) forwards',
            willChange: 'transform, opacity, filter',
        },
        '.animate-subtle-slide': {
            animation: 'subtleSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            willChange: 'transform, opacity',
        },
        '.animate-subtle-slide-1': {
            animation: 'subtleSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            animationDelay: '300ms',
            animationFillMode: 'forwards',
            willChange: 'transform, opacity',
        },
        '.animate-subtle-slide-2': {
            animation: 'subtleSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            animationDelay: '500ms',
            animationFillMode: 'forwards',
            willChange: 'transform, opacity',
        },
        '.animate-light-sweep': {
            animation: 'light-sweep 8s ease-in-out infinite',
            animationDelay: '2s'
        },
        '.animate-float': {
            animation: 'float 4s ease-in-out infinite'
        },
        '.animate-float-delayed': {
            animation: 'float-delayed 4s ease-in-out infinite',
            animationDelay: '1s'
        },
        '.animate-float-slow': {
            animation: 'float-slow 6s ease-in-out infinite',
            animationDelay: '2s'
        },
        '.animate-scroll-indicator': {
            animation: 'scroll-indicator 2s ease-in-out infinite'
        },
        '.animate-pulse-subtle': {
            animation: 'pulse-subtle 2s ease-in-out infinite',
            willChange: 'opacity, transform'
        },
        '.animate-bounce-gentle': {
            animation: 'bounce-gentle 2s infinite ease-in-out',
            willChange: 'transform'
        },
        '.animate-spin-slow': {
            animation: 'spin-slow 3s infinite linear',
            willChange: 'transform'
        },
        '.animate-celebrate': {
            animation: 'celebrate 1s ease-in-out',
            willChange: 'transform'
        }
    })
})
