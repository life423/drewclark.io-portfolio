// FILE: app/src/styles/tailwind-plugins/fontFlashPlugin.js
import plugin from 'tailwindcss/plugin'

export default plugin(function ({ addBase, addUtilities }) {
    // Define the keyframes for the font flash animation.
    // Now the icon remains neon orange during the animation.
    addBase({
        '@keyframes fontFlash': {
            '0%': { color: '#FF6B00' }, // neonOrange.500
            '50%': { color: '#FF9B66' }, // neonOrange.300 (slightly lighter)
            '100%': { color: '#FF6B00' }, // neonOrange.500 again
        },
    })

    // Add the utility class for applying the font flash animation.
    addUtilities({
        '.animate-fontFlash': {
            animation: 'fontFlash 8s ease-in-out infinite',
        },
    })
})
