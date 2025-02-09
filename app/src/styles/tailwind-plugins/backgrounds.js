export default function ({ addUtilities }) {
    const newUtilities = {
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
    }

    addUtilities(newUtilities, ['responsive'])
}
