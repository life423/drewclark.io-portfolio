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
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        // Micro animations for interactive icons
        '@keyframes subtleWobble': {
            '0%':   { transform: 'scale(1)' },
            '50%':  { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
        },
        '@keyframes slightRotate': {
            '0%':   { transform: 'rotate(0deg)' },
            '50%':  { transform: 'rotate(5deg)' },
            '100%': { transform: 'rotate(0deg)' },
        },
        '@keyframes gentleBounce': {
            '0%':   { transform: 'translateY(0)' },
            '50%':  { transform: 'translateY(-2px)' },
            '100%': { transform: 'translateY(0)' },
        },
        '@keyframes faintPulse': {
            '0%':   { opacity: 1 },
            '50%':  { opacity: 0.8 },
            '100%': { opacity: 1 },
        },
        '@keyframes softGlow': {
            '0%':   { filter: 'drop-shadow(0 0 0px #FF6B00)' },
            '50%':  { filter: 'drop-shadow(0 0 6px #FF6B00)' },
            '100%': { filter: 'drop-shadow(0 0 0px #FF6B00)' },
        },
    })

    // 2. Animation utility classes
    const animationUtilities = {
        '.animate-pulse-once': {
            // Runs the "pulse" keyframes once, then stops
            animation: 'pulse 1s ease-out 1 forwards',
        },
        '.animate-color-pulse': {
            // Repeatedly changes background-position
            animation: 'colorPulse 6s ease-in-out infinite',
        },
        '.animate-icon-pulse': {
            // Pulses icons once
            animation: 'iconPulse 2.7s ease-in-out 1 forwards',
        },
        // Micro animation utility classes
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
            animation: 'softGlow 1.5s ease-in-out infinite',
        },
        // Optional: Delay classes
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
    }

    // 3. Make them available in your Tailwind classes
    addUtilities(animationUtilities, ['responsive', 'hover'])
})
