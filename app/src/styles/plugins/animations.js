import plugin from 'tailwindcss/plugin'

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
            '100%': { backgroundPosition: '100% 50%' },
        },
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
    })

    // 2. Animation utility classes
    const animationUtilities = {
        '.animate-pulse-once': {
            // Runs the “pulse” keyframes once, then stops
            animation: 'pulse 1s ease-out 1 forwards',
        },
        '.animate-color-pulse': {
            // Repeatedly changes background-position
            animation: 'colorPulse 4s ease-in-out infinite',
        },
        '.animate-icon-pulse': {
            // Pulses icons once
            animation: 'iconPulse 2.7s ease-in-out 1 forwards',
        },
        // Optional: Delay classes
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
    }

    // 3. Make them available in your Tailwind classes
    addUtilities(animationUtilities, ['responsive', 'hover'])
})
