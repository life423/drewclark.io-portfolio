// FILE: app/src/styles/tailwind-plugins/colorPulsePlugin.js

export default function colorPulsePlugin({ addUtilities, theme, e }) {
    // We'll reference your brand colors from the theme
    const orange = theme('colors.neonOrange.500', '#FF6B00') // fallback if not found
    const green = theme('colors.brandGreen.400', '#34D399')
    const blue = theme('colors.brandBlue.500', '#0EA5E9')

    // Define our custom @keyframes and utility classes
    addUtilities(
        {
            '@keyframes colorPulse': {
                '0%, 100%': {
                    backgroundPosition: '0% 50%',
                },
                '50%': {
                    backgroundPosition: '100% 50%',
                },
            },
            '.animate-colorPulse': {
                animation: 'colorPulse 4s ease-in-out infinite',
            },
            '.bg-pulse-gradient': {
                backgroundImage: `linear-gradient(90deg, ${orange} 0%, ${green} 50%, ${blue} 100%)`,
                backgroundSize: '200% 200%',
                backgroundRepeat: 'repeat',
            },
        },
        // Apply to responsive variants, etc.
        ['responsive', 'hover']
    )
}
