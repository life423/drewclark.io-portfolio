// FILE: app/tailwind.config.js

import backgroundsPlugin from './src/styles/plugins/backgrounds.js'
import animationsPlugin from './src/styles/plugins/animations.js'
import progressBarsPlugin from './src/styles/plugins/progressBars.js'
import textShadowsPlugin from './src/styles/plugins/textShadows.js'
import typography from '@tailwindcss/typography'

export default {
    content: ['./src/index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            textShadow: {
                sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
                DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.2)',
                lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
                green: '0 0 5px rgba(16, 185, 129, 0.4)',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.brandGray.300'),
                        a: {
                            color: theme('colors.brandGreen.400'),
                            '&:hover': {
                                color: theme('colors.brandGreen.300'),
                            },
                        },
                        strong: {
                            color: theme('colors.brandGreen.300'),
                        },
                        h1: {
                            color: theme('colors.white'),
                        },
                        h2: {
                            color: theme('colors.white'),
                        },
                        h3: {
                            color: theme('colors.brandGreen.300'),
                        },
                        h4: {
                            color: theme('colors.brandGreen.400'),
                        },
                        code: {
                            color: theme('colors.brandGreen.300'),
                            backgroundColor: theme('colors.brandGray.800'),
                            borderRadius: theme('borderRadius.md'),
                            paddingLeft: theme('spacing.1'),
                            paddingRight: theme('spacing.1'),
                        },
                    },
                },
                invert: {
                    css: {
                        color: theme('colors.brandGray.300'),
                        a: {
                            color: theme('colors.brandGreen.400'),
                            '&:hover': {
                                color: theme('colors.brandGreen.300'),
                            },
                        },
                    },
                },
            }),
            colors: {
                brandGreen: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    350: '#51DDA8', // new shade between 300 and 400
                    400: '#34D399',
                    500: '#10B981', // Balanced mid-tone green
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                    950: '#015338', // extra dark green
                },
                neonOrange: {
                    50: '#FFF2E8',
                    100: '#FFE6D1',
                    200: '#FFC199',
                    300: '#FF9B66',
                    400: '#FF7A33',
                    500: '#FF6B00', // Core neon accent
                    600: '#E66000',
                    700: '#CC5500',
                    800: '#993F00',
                    900: '#662A00',
                },
                brandBlue: {
                    50: '#EBF8FF',
                    100: '#D1EEFC',
                    200: '#A7D8F0',
                    300: '#7ECBF4',
                    400: '#38BDF8',
                    500: '#0EA5E9', // Vibrant sky-blue
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                },
                brandGray: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A', // Mid-level gray
                    600: '#52525B',
                    700: '#3F3F46',
                    800: '#27272A',
                    900: '#18181B',
                },
            },
        },
    },
    plugins: [
        backgroundsPlugin,
        animationsPlugin,
        progressBarsPlugin,
        textShadowsPlugin,
        typography,
    ],
}
