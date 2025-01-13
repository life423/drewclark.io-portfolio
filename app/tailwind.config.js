// FILE: app/tailwind.config.js

import backgroundsPlugin from './src/styles/plugins/backgrounds.js'
import animationsPlugin from './src/styles/plugins/animations.js'
import textShadowsPlugin from './src/styles/plugins/textShadows.js'
import typography from '@tailwindcss/typography'
import {
    brandGreen,
    brandOrange,
    brandBlue,
    brandGray,
} from './src/styles/colors.js'

export default {
    // Enhanced content patterns to ensure comprehensive detection of used classes
    content: [
        './src/index.html', 
        './src/**/*.{js,jsx,ts,tsx}',
        // Ensure SVG and JSON files are also scanned (may contain classes)
        './src/**/*.svg',
        './src/**/*.json',
        // Handle dynamically generated content
        './public/**/*.html'
    ],
    
    // Safelist ensures critical classes are never purged even if not found in content analysis
    safelist: [
        // Core layout classes that might be dynamically generated
        'flex', 'hidden', 'block', 'grid',
        'w-full', 'h-full',
        
        // Classes used in animations or transitions
        'opacity-0', 'opacity-100',
        'translate-y-0', 'translate-y-full',
        'scale-95', 'scale-100',
        
        // Important brand color utility classes
        'text-brandGreen-300', 'text-brandGreen-500',
        'bg-brandGray-900', 'bg-brandGray-800',
        
        // Animation classes
        'animate-pulse', 'animate-spin',
        
        // Responsive classes most likely to be conditionally applied
        'sm:flex', 'md:flex', 'lg:flex', 'xl:flex',
        'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden',
    ],
    theme: {
        // Set default values to reduce CSS size
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            // Enable container queries
            containers: {
                'xs': '20rem',   // 320px
                'sm': '30rem',   // 480px  
                'md': '40rem',   // 640px
                'lg': '50rem',   // 800px
                'xl': '60rem',   // 960px
            },
            fontFamily: {
                sans: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
            },
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
                brandOrange,
                brandBlue,
                brandGray,
                // Also add neonOrange from the other version
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
            },
        },
    },
    plugins: [
        backgroundsPlugin,
        animationsPlugin,
        textShadowsPlugin,
        typography,
    ],
    
    // Additional optimization settings
    corePlugins: {
        // Disable rarely or unused core plugins
        placeholderOpacity: false,
        ringOpacity: false,
        boxShadowColor: false,
        filter: false, // If using backdrop-filter only, disable regular filter
    },
    
    // Performance optimization
    future: {
        hoverOnlyWhenSupported: true, // Optimize hover styles for touch devices
    },
    
    // Production optimization
    ...(process.env.NODE_ENV === 'production' && {
        // Minify CSS class names in production for even smaller CSS
        variants: {
            extend: {
                // Limit variants to essentials in production
                opacity: ['responsive', 'hover', 'focus'],
                backgroundColor: ['responsive', 'hover', 'focus'],
                textColor: ['responsive', 'hover', 'focus'],
            }
        }
    })
}
