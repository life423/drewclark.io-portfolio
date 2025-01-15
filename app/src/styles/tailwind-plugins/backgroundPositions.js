// backgroundPositions.js
export default function backgroundPositionsPlugin({ addUtilities }) {
    const newUtilities = {
        /* Common corner/edge positions */
        '.bg-top-left': {
            backgroundPosition: 'top left',
        },
        '.bg-top-center': {
            backgroundPosition: 'top center',
        },
        '.bg-top-right': {
            backgroundPosition: 'top right',
        },
        '.bg-center-left': {
            backgroundPosition: 'center left',
        },
        '.bg-center-center': {
            backgroundPosition: 'center center', // same as 'center'
        },
        '.bg-center-right': {
            backgroundPosition: 'center right',
        },
        '.bg-bottom-left': {
            backgroundPosition: 'bottom left',
        },
        '.bg-bottom-center': {
            backgroundPosition: 'bottom center',
        },
        '.bg-bottom-right': {
            backgroundPosition: 'bottom right',
        },

        /* Fine-tuned vertical offsets (helpful for adjusting where the focal point appears) */
        '.bg-pos-25': {
            backgroundPosition: '50% 25%',
        },
        '.bg-pos-33': {
            backgroundPosition: '50% 33%',
        },
        '.bg-pos-50': {
            backgroundPosition: '50% 50%',
        },
        '.bg-pos-66': {
            backgroundPosition: '50% 66%',
        },
        '.bg-pos-75': {
            backgroundPosition: '50% 75%',
        },
        '.bg-pos-80': {
            backgroundPosition: '50% 80%',
        },
        '.bg-pos-90': {
            backgroundPosition: '50% 90%',
        },
        '.bg-pos-95': {
            backgroundPosition: '50% 95%',
        },

        /* If you want exact pixel-based positioning (less common) */
        '.bg-pos-0-100': {
            backgroundPosition: '0 100px',
        },
        '.bg-pos-50-200': {
            backgroundPosition: '50% 200px',
        },

        // Add more if needed...
    }

    // By default, utilities are generated for all variants, including responsive
    addUtilities(newUtilities, ['responsive'])
}
