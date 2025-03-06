/**
 * Styling utilities and common patterns
 * Centralizes reusable styling logic to maintain consistency and DRY principles
 */

// Consistent gradient effects across components
export const gradients = {
  // Card gradients
  cardBorder: 'bg-gradient-to-br from-brandGreen-500/20 to-neonOrange-500/20',
  cardHover: 'bg-gradient-to-br from-brandGreen-500/30 to-neonOrange-500/30',
  
  // Section headings
  heading: 'bg-gradient-to-r from-brandGreen-500 to-neonOrange-500',
  
  // Backgrounds
  pageBg: 'bg-gradient-to-b from-brandGray-900 to-brandGray-800',
  darkOverlay: 'bg-gradient-to-b from-black/40 via-black/40 to-black/60',
  lightOverlay: 'bg-gradient-to-b from-brandGreen-500/15 via-brandBlue-500/10 to-transparent',
  
  // Button gradients
  primaryButton: 'bg-gradient-to-r from-brandGreen-600 to-brandGreen-700',
  accentButton: 'bg-gradient-to-r from-neonOrange-500 to-neonOrange-600',
};

// Standard transitions
export const transitions = {
  fast: 'transition-all duration-200',
  default: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  color: 'transition-colors duration-300',
  transform: 'transition-transform duration-300',
  opacity: 'transition-opacity duration-300',
  scale: 'transform transition duration-300 hover:scale-105',
};

// Common spacing patterns
export const spacing = {
  sectionY: 'py-16 md:py-20 lg:py-24',
  contentX: 'px-4 md:px-6 lg:px-8',
  gap: {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8',
  },
};

// Card styling patterns
export const cards = {
  base: `relative overflow-hidden rounded-lg ${transitions.default}`,
  hover: 'hover:-translate-y-1 hover:shadow-lg',
  shadow: 'shadow-md hover:shadow-lg',
  content: 'p-5 flex flex-col h-full',
};

// Button styling
export const buttons = {
  primary: `px-6 py-2.5 bg-brandGreen-600 text-white rounded-md ${transitions.default} hover:bg-brandGreen-700`,
  secondary: `px-6 py-2.5 bg-brandGray-700 text-white rounded-md ${transitions.default} hover:bg-brandGray-600`,
  accent: `px-6 py-2.5 bg-neonOrange-500 text-white rounded-md ${transitions.default} hover:bg-neonOrange-600`,
  icon: 'p-2 rounded-full bg-brandGray-800 hover:bg-brandGray-700',
};

// Text styles
export const typography = {
  heading: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    h4: 'text-xl md:text-2xl font-semibold',
  },
  body: {
    large: 'text-lg md:text-xl',
    default: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs',
  },
};

// Layout patterns
export const layout = {
  container: 'container mx-auto px-4 max-w-7xl',
  section: 'w-full relative',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  asymmetricGrid: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 md:gap-6',
};

// Project card size variants
export const projectCardSizes = {
  small: 'col-span-1 md:col-span-2',
  medium: 'col-span-1 md:col-span-1 lg:col-span-3',
  large: 'col-span-1 md:col-span-2 lg:col-span-4',
  featured: 'col-span-1 md:col-span-3 lg:col-span-6',
};

export default {
  gradients,
  transitions,
  spacing,
  cards,
  buttons,
  typography,
  layout,
};
