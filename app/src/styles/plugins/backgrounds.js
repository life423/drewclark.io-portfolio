import plugin from 'tailwindcss/plugin'

// Helper to convert hex to RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('')
    }
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `${r}, ${g}, ${b}`
}

export default plugin(function ({ addUtilities, theme }) {
    // Get theme colors
    const green = theme('colors.brandGreen.200')
    const blue = theme('colors.brandBlue.200')
    const orange = theme('colors.neonOrange.500')
    
    // Convert colors to RGB for overlay
    const greenRgb = hexToRgb(green)
    const blueRgb = hexToRgb(blue)

    const backgroundUtilities = {
        // Background Positions
        '.bg-pos-t': { backgroundPosition: 'top' },
        '.bg-pos-tr': { backgroundPosition: 'top right' },
        '.bg-pos-r': { backgroundPosition: 'right' },
        '.bg-pos-br': { backgroundPosition: 'bottom right' },
        '.bg-pos-b': { backgroundPosition: 'bottom' },
        '.bg-pos-bl': { backgroundPosition: 'bottom left' },
        '.bg-pos-l': { backgroundPosition: 'left' },
        '.bg-pos-tl': { backgroundPosition: 'top left' },
        '.bg-pos-c': { backgroundPosition: 'center' },

        // Vertical Position Percentages
        ...Array.from({ length: 20 }, (_, i) => {
            const percent = (i + 1) * 5 // 5%, 10%, 15%, ..., 100%
            return {
                [`.bg-pos-v-${percent}`]: {
                    backgroundPosition: `50% ${percent}%`
                }
            }
        }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

        // Background Scaling
        '.bg-scale-80': {
            backgroundSize: '80% auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        },
        '.bg-scale-60': {
            backgroundSize: '60% auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        },

        // Gradient Overlays
        '.gradient-overlay': {
            backgroundImage: `linear-gradient(135deg, rgba(${greenRgb}, 0.4) 40%, rgba(${blueRgb}, 1) 100%)`,
            mixBlendMode: 'overlay',
        },
        '.bg-pulse-gradient': {
            backgroundImage: `linear-gradient(90deg, ${orange} 0%, ${green} 50%, ${blue} 100%)`,
            backgroundSize: '200% 200%',
            backgroundRepeat: 'repeat',
        }
    }

    addUtilities(backgroundUtilities, ['responsive'])
})
