// FILE: src/styles/tailwind-plugins/iconPulsePlugin.js

import plugin from 'tailwindcss/plugin'

export default plugin(function ({ addBase, addUtilities }) {
    // Define the keyframes for the icon pulse animation.
    addBase({
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '10%': { transform: 'scale(1.1)', opacity: '0.65' },
            '20%': { transform: 'scale(1.2)', opacity: '0.6' },
            '30%': { transform: 'scale(1.3)', opacity: '0.55' },
            '40%': { transform: 'scale(1.45)', opacity: '0.5' },
            '50%': { transform: 'scale(1.6)', opacity: '0.4' },
            '60%': { transform: 'scale(1.75)', opacity: '0.3' },
            '70%': { transform: 'scale(1.9)', opacity: '0.2' },
            '80%': { transform: 'scale(2.05)', opacity: '0.12' },
            '90%': { transform: 'scale(2.2)', opacity: '0.06' },
            '95%': { transform: 'scale(2.3)', opacity: '0.03' },
            '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
    })

    // Add the utility class for applying the icon pulse animation.
    addUtilities({
        '.animate-iconPulse': {
            animation: 'iconPulse 8s ease-in-out infinite',
        },
    })
})
