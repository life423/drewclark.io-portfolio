/**
 * Utility for responsive image handling
 * Returns the appropriate image source based on viewport width
 * 
 * @param {Object} sources - Object containing image sources for different breakpoints
 * @param {string} sources.xs - Extra small screens (< 640px)
 * @param {string} sources.sm - Small screens (>= 640px)
 * @param {string} sources.md - Medium screens (>= 768px)
 * @param {string} sources.lg - Large screens (>= 1024px)
 * @param {string} sources.xl - Extra large screens (>= 1280px)
 * @param {number} [width=0] - Current viewport width
 * @returns {string} - The appropriate image source
 */
export const getResponsiveImage = (sources, width = 0) => {
  // Get window width on client side if not provided
  const currentWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 0);

  // Return appropriate image based on breakpoints
  if (currentWidth >= 1280 && sources.xl) return sources.xl;
  if (currentWidth >= 1024 && sources.lg) return sources.lg;
  if (currentWidth >= 768 && sources.md) return sources.md;
  if (currentWidth >= 640 && sources.sm) return sources.sm;
  return sources.xs;
};

/**
 * Creates a srcSet string from image sources for different widths
 * 
 * @param {Object} sources - Object with image sources keyed by width in pixels
 * @returns {string} - Properly formatted srcSet string
 * 
 * @example
 * createSrcSet({
 *   640: '/images/small.jpg',
 *   1024: '/images/medium.jpg',
 *   1920: '/images/large.jpg'
 * });
 * // Returns: '/images/small.jpg 640w, /images/medium.jpg 1024w, /images/large.jpg 1920w'
 */
export const createSrcSet = (sources) => {
  return Object.entries(sources)
    .map(([width, src]) => `${src} ${width}w`)
    .join(', ');
};
