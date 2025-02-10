// FILE: app/tailwind.config.js

import backgroundsPlugin from './src/styles/tailwind-plugins/backgrounds.js'
import backgroundPositionsPlugin from './src/styles/tailwind-plugins/backgroundPositions.js'
import colorPulsePlugin from './src/styles/tailwind-plugins/colorPulsePlugin.js'

export default {
    content: ['./src/index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brandGreen: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981', // Balanced mid-tone green
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
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

            // Replace "haloPulse" with an iconPulse effect
            keyframes: {
                iconPulse: {
                    '0%': {
                        transform: 'scale(1)',
                        opacity: '0.7',
                    },
                    '10%': {
                        transform: 'scale(1.1)',
                        opacity: '0.65',
                    },
                    '20%': {
                        transform: 'scale(1.2)',
                        opacity: '0.6',
                    },
                    '30%': {
                        transform: 'scale(1.3)',
                        opacity: '0.55',
                    },
                    '40%': {
                        transform: 'scale(1.45)',
                        opacity: '0.5',
                    },
                    '50%': {
                        transform: 'scale(1.6)',
                        opacity: '0.4',
                    },
                    '60%': {
                        transform: 'scale(1.75)',
                        opacity: '0.3',
                    },
                    '70%': {
                        transform: 'scale(1.9)',
                        opacity: '0.2',
                    },
                    '80%': {
                        transform: 'scale(2.05)',
                        opacity: '0.12',
                    },
                    '90%': {
                        transform: 'scale(2.2)',
                        opacity: '0.06',
                    },
                    '95%': {
                        transform: 'scale(2.3)',
                        opacity: '0.03',
                    },
                    '100%': {
                        transform: 'scale(2.4)',
                        opacity: '0',
                    },
                },
            },

            animation: {
                iconPulse: 'iconPulse 8s ease-in-out infinite',
            },
        },
    },
    plugins: [backgroundsPlugin, backgroundPositionsPlugin, colorPulsePlugin],
}
