// FILE: app/tailwind.config.js

import backgroundsPlugin from './src/styles/plugins/backgrounds.js'
import animationsPlugin from './src/styles/plugins/animations.js'
import textShadowsPlugin from './src/styles/plugins/textShadows.js'
import typography from '@tailwindcss/typography'
import {
    brandGreen,
    neonOrange,
    brandBlue,
    brandGray,
} from './src/styles/colors.js'

export default {
    content: ['./src/index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            boxShadow: {
                nav: '0 2px 10px rgba(0, 0, 0, 0.15)',
            },
            textShadow: {
                sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
                DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.2)',
                lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
                green: '0 0 5px rgba(16, 185, 129, 0.4)',
            },
            typography: theme => ({
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
                brandGreen,
                neonOrange,
                brandBlue,
                brandGray,
            },
        },
    },
    plugins: [
        backgroundsPlugin,
        animationsPlugin,
        textShadowsPlugin,
        typography,
    ],
}
