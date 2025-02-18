import plugin from 'tailwindcss/plugin'

// Consolidated animation keyframes and utilities
export default plugin(function ({ addBase, addUtilities, theme }) {
    // Base keyframes for all animations
    addBase({
        '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '50%': { transform: 'scale(1.5)', opacity: '0.3' },
            '100%': { transform: 'scale(2)', opacity: '0' },
        },
        '@keyframes colorPulse': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
        },
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
    })

    // Animation utilities
    const animationUtilities = {
        '.animate-pulse-once': {
            animation: 'pulse 1s ease-out 1 forwards',
        },
        '.animate-color-pulse': {
            animation: 'colorPulse 4s ease-in-out infinite',
        },
        '.animate-icon-pulse': {
            animation: 'iconPulse 2.7s ease-in-out 1 forwards',
        },
        // Delay utilities for staggered animations
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
    }

    addUtilities(animationUtilities, ['responsive', 'hover'])
})
