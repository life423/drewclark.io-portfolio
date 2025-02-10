// FILE: app/src/styles/tailwind-plugins/gradientOverlay.js

import plugin from 'tailwindcss/plugin'

// Helper to convert a hex color to an "R, G, B" string
function hexToRgb(hex) {
    hex = hex.replace('#', '')
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map(x => x + x)
            .join('')
    }
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `${r}, ${g}, ${b}`
}

export default plugin(function ({ addUtilities, theme }) {
    const green = theme('colors.brandGreen.200')
    const blue = theme('colors.brandBlue.200')
    const greenRgb = hexToRgb(green)
    const blueRgb = hexToRgb(blue)

    const gradientOverlay = {
        '.gradient-overlay': {
            // Create a linear gradient that goes from 40% opacity to full opacity
            backgroundImage: `linear-gradient(135deg, rgba(${greenRgb}, 0.4) 40%, rgba(${blueRgb}, 1) 100%)`,
            // Blend with the background image so the gradient acts as a filter
            mixBlendMode: 'overlay',
        },
    }
    addUtilities(gradientOverlay, ['responsive'])
})
