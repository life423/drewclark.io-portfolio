import backgroundsPlugin from './styles/tailwind-plugins/backgrounds.js'
import backgroundPositionsPlugin from './styles/tailwind-plugins/backgroundPositions.js'
import colorPulsePlugin from './styles/tailwind-plugins/colorPulsePlugin.js'
import iconPulsePlugin from './styles/tailwind-plugins/iconPulsePlugin.js'
import staggeredPulsePlugin from './styles/tailwind-plugins/staggeredPulsePlugin.js'
import gradientOverlay from './styles/tailwind-plugins/gradientOverlay.js'

export default {
    content: ['./index.html', './**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brandGreen: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    350: '#51DDA8',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                    950: '#015338',
                },
                neonOrange: {
                    50: '#FFF2E8',
                    100: '#FFE6D1',
                    200: '#FFC199',
                    300: '#FF9B66',
                    400: '#FF7A33',
                    500: '#FF6B00',
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
                    500: '#0EA5E9',
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
                    500: '#71717A',
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
        backgroundPositionsPlugin,
        colorPulsePlugin,
        iconPulsePlugin,
        staggeredPulsePlugin,
        gradientOverlay,
    ],
}
