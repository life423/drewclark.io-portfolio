/**
 * Brand color palette definitions
 * These colors are used throughout the application and referenced in tailwind.config.js
 */

export const brandGreen = {
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
}

export const brandOrange = {
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
}

export const brandBlue = {
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
}

export const brandGray = {
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
}

/**
 * Brand colors - single standardized export pattern
 * 
 * Usage:
 * import { brandColors } from '../styles/colors'
 * 
 * Access individual colors:
 * - brandColors.green[500]  // #10B981
 * - brandColors.orange[500] // #FF6B00
 * - brandColors.blue[500]   // #0EA5E9
 * - brandColors.gray[500]   // #71717A
 */
export const brandColors = {
    green: brandGreen,
    orange: brandOrange,
    blue: brandBlue,
    gray: brandGray
}

// For easy access to most commonly used shades
export const coreColors = {
    green: brandGreen[500],  // #10B981
    blue: brandBlue[500],    // #0EA5E9
    orange: brandOrange[500], // #FF6B00
    gray: brandGray[500],    // #71717A
}

// Export as default for backward compatibility
export default brandColors;
