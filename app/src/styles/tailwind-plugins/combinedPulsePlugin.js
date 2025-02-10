// FILE: app/src/styles/tailwind-plugins/combinedPulsePlugin.js
import plugin from 'tailwindcss/plugin'

export default plugin(function ({ addBase, addUtilities }) {
    // Define keyframes for both animations.
    addBase({
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7', color: '#FF7A33' },
            '10%': {
                transform: 'scale(1.1)',
                opacity: '0.65',
                color: '#FF7A33',
            },
            '20%': {
                transform: 'scale(1.2)',
                opacity: '0.6',
                color: '#FF7A33',
            },
            '30%': {
                transform: 'scale(1.3)',
                opacity: '0.55',
                color: '#FF7A33',
            },
            '40%': {
                transform: 'scale(1.45)',
                opacity: '0.5',
                color: '#FF7A33',
            },
            '50%': {
                transform: 'scale(1.6)',
                opacity: '0.4',
                color: '#FF7A33',
            },
            '60%': {
                transform: 'scale(1.75)',
                opacity: '0.3',
                color: '#FF7A33',
            },
            '70%': {
                transform: 'scale(1.9)',
                opacity: '0.2',
                color: '#FF7A33',
            },
            '80%': {
                transform: 'scale(2.05)',
                opacity: '0.15',
                color: '#FF7A33',
            },
            '90%': {
                transform: 'scale(2.2)',
                opacity: '0.12',
                color: '#FF7A33',
            },
            '95%': {
                transform: 'scale(2.3)',
                opacity: '0.11',
                color: '#FF7A33',
            },
            '100%': {
                transform: 'scale(2.4)',
                opacity: '0.06',
                color: '#FF7A33',
            },
        },
    })

    // Add combined utility classes.
    addUtilities({
        // Combined class: applies both fontFlash (for neon orange) and iconPulse (for the pulse effect)
        '.animate-iconCombined': {
            animation:
                'iconPulse 2s ease-in-out 3 forwards',
        },
        // Optionally, add a default state class for non-animated state (brand green)
        '.icon-default': {
            color: '#10B981', // brandGreen.500
            fill: '#10B981', // ensure fill matches
        },
    })
})
