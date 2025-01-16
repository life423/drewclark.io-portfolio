// app/src/styles/tailwind-plugins/flipDrawerPlugin.js

export default function flipDrawerPlugin({ addBase, addUtilities }) {
    // 1) Define keyframes with addBase()
    addBase({
        '@keyframes flipOpen': {
            '0%': { transform: 'rotateY(-90deg)' },
            '80%': { transform: 'rotateY(5deg)' },
            '100%': { transform: 'rotateY(0deg)' },
        },
        '@keyframes flipClose': {
            '0%': { transform: 'rotateY(0deg)' },
            '100%': { transform: 'rotateY(-90deg)' },
        },
    })

    // 2) Define utility classes that use those keyframes
    addUtilities({
        '.animate-flipOpen': {
            animation: 'flipOpen 0.5s ease forwards',
            'transform-origin': 'left center',
            'backface-visibility': 'hidden',
        },
        '.animate-flipClose': {
            animation: 'flipClose 0.4s ease forwards',
            'transform-origin': 'left center',
            'backface-visibility': 'hidden',
        },
    })
}
