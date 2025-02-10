// FILE: src/styles/tailwind-plugins/staggeredPulsePlugin.js

import plugin from 'tailwindcss/plugin'

export default plugin(function ({ addBase, addUtilities }) {
    // 1. Keyframe for a single run pulse
    addBase({
        '@keyframes oneShotPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '50%': { transform: 'scale(1.5)', opacity: '0.3' },
            '100%': { transform: 'scale(2)', opacity: '0' },
        },
    })

    // 2. Utility for that single iteration (rather than infinite)
    addUtilities({
        '.animate-oneShotPulse': {
            animation: 'oneShotPulse 1s ease-out 1 forwards',
            // "1s" total, "1" iteration, "forwards" so it stays at scale(2), opacity(0)
        },
        // Delays for a wave effect
        '.delay-0': { 'animation-delay': '0s' },
        '.delay-1': { 'animation-delay': '0.2s' },
        '.delay-2': { 'animation-delay': '0.4s' },
    })
})
