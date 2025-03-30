// Tailwind breakpoint values from tailwind.config.js
export const breakpoints = {
  xs: 0,       // anything below sm
  sm: 640,     // Small devices (phones)
  md: 768,     // Medium devices (tablets)
  lg: 1024,    // Large devices (desktops)
  xl: 1280,    // Extra large devices
  '2xl': 1536  // 2X Extra large devices
}

/**
 * Get the current breakpoint name based on width
 * 
 * @param {number} width - The current viewport width
 * @returns {string} - The breakpoint name ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export function getBreakpoint(width) {
  if (width < breakpoints.sm) return 'xs'
  if (width < breakpoints.md) return 'sm'
  if (width < breakpoints.lg) return 'md'
  if (width < breakpoints.xl) return 'lg'
  if (width < breakpoints['2xl']) return 'xl'
  return '2xl'
}
