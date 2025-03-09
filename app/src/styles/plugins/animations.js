import plugin from 'tailwindcss/plugin'
import { brandGreen, neonOrange } from '../colors.js'

// Get color values without the leading #
const greenColor = brandGreen[500].substring(1)
const orangeColor = neonOrange[500].substring(1)

export default plugin(function ({ addBase, addUtilities }) {
    // 1. Base keyframes for all animations
    addBase({
        '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '50%': { transform: 'scale(1.5)', opacity: '0.3' },
            '100%': { transform: 'scale(2)', opacity: '0' },
        },
        '@keyframes colorPulse': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '1', color: `#${greenColor}` },
            '25%': { transform: 'scale(1.2)', opacity: '1', color: `#${orangeColor}` },
            '75%': { transform: 'scale(1.2)', opacity: '1', color: `#${orangeColor}` },
            '100%': { transform: 'scale(1)', opacity: '1', color: `#${greenColor}` },
        },
        '@keyframes iconTap': {
            '0%': { transform: 'scale(1)', color: `#${greenColor}` },
            '30%': { transform: 'scale(0.9)', color: `#${orangeColor}` },
            '60%': { transform: 'scale(1.15)', color: `#${orangeColor}` },
            '100%': { transform: 'scale(1)', color: `#${greenColor}` },
        },
        '@keyframes iconGentlePulse': {
            '0%':   { transform: 'scale(1)', color: `#${greenColor}` },
            '20%':  { transform: 'scale(1.15)', color: `#${orangeColor}` },
            '50%':  { transform: 'scale(1.2)', color: `#${orangeColor}`, filter: 'rawrop-shadow(0 0 5px rgba(255,107,0,0.7))' },
            '80%':  { transform: 'scale(1.15)', color: `#${orangeColor}` },
            '100%': { transform: 'scale(1)', color: `#${greenColor}` },
        },
        '@keyframes drawerLinkPop': {
            '0%': { transform: 'translateY(20px) scale(0.9) rotateX(25deg)', opacity: '0' },
            '40%': { transform: 'translateY(0) scale(1.05) rotateX(0deg)', opacity: '0.8' },
            '80%': { transform: 'translateY(0) scale(1)', opacity: '1' },
            '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        '@keyframes navLinkUnderline': {
            '0%': { transform: 'scaleX(0)', opacity: '0' },
            '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        '@keyframes navLinkGlow': {
            '0%': { textShadow: `0 0 0 rgba(${parseInt(orangeColor.substring(0, 2), 16)}, ${parseInt(orangeColor.substring(2, 4), 16)}, ${parseInt(orangeColor.substring(4, 6), 16)}, 0)` },
            '100%': { textShadow: `0 0 5px rgba(${parseInt(orangeColor.substring(0, 2), 16)}, ${parseInt(orangeColor.substring(2, 4), 16)}, ${parseInt(orangeColor.substring(4, 6), 16)}, 0.3)` },
        },
        '@keyframes drawerLinkFadeIn': {
            '0%': { 
                transform: 'translateY(10px)',
                opacity: '0' 
            },
            '100%': { 
                transform: 'translateY(0)',
                opacity: '1' 
            }
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
        '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
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
        }
    });

    // 2. Add the animation utilities
    addUtilities({
        '.animate-pulse-once': {
            animation: 'pulse 1s ease-out 1 forwards',
        },
        '.animate-color-pulse': {
            animation: 'colorPulse 6s ease-in-out infinite',
        },
        '.animate-icon-pulse': {
            animation: 'iconPulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            filter: 'drop-shadow(0 0 4px currentColor)',
        },
        '.animate-icon-tap': {
            animation: 'iconTap 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            filter: 'drop-shadow(0 0 4px currentColor)',
        },
        '.animate-icon-gentle-pulse': {
            animation:
                'iconGentlePulse 2s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            willChange: 'transform, color, filter',
        },
        '.animate-subtle-wobble': {
            animation: 'subtleWobble 1s ease-in-out infinite',
        },
        '.animate-slight-rotate': {
            animation: 'slightRotate 1s ease-in-out infinite',
        },
        '.animate-gentle-bounce': {
            animation: 'gentleBounce 1s ease-in-out infinite',
        },
        '.animate-faint-pulse': {
            animation: 'faintPulse 1.5s ease-in-out infinite',
        },
        '.animate-soft-glow': {
            animation: 'softGlow 1.2s ease-in-out infinite',
            transition: 'all 0.3s ease',
            transform: 'scale(1.05)',
        },
        '.animate-triple-pulse-to-orange': {
            animation: 'triplePulseToOrange 4s ease-in-out 1 forwards',
        },
        '.animate-drawer-link-pop': {
            animation:
                'drawerLinkPop 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
            'will-change': 'transform, opacity',
        },
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
        // And add this to your utilities:
        '.animate-drawer-link-fade-in': {
            animation: 'drawerLinkFadeIn 0.5s ease-out forwards',
            willChange: 'transform, opacity',
        },
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
        '.animate-shimmer': {
            animation: 'shimmer 2s linear infinite',
            backgroundSize: '200% 100%',
            willChange: 'background-position',
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
        '.animate-subtle-shimmer-slow': {
            animation: 'subtleShimmer 5s ease-in-out infinite',
            backgroundSize: '200% 100%',
            willChange: 'background-position, opacity',
        },
        '.animate-corner-highlight': {
            animation: 'cornerHighlight 2s ease-out forwards',
            animationDelay: '0.5s',
            willChange: 'opacity, transform',
        },
    })
})
