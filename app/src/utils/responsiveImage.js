/**
 * Enhanced utility for responsive image handling
 * Returns the appropriate image source based on viewport width and format support
 * 
 * @param {Object} sources - Object containing image sources for different breakpoints
 * @param {Object} sources.xs - Extra small screens (< 640px) options
 * @param {string} sources.xs.default - Default format (jpg/png)
 * @param {string} [sources.xs.webp] - WebP format if available
 * @param {string} [sources.xs.avif] - AVIF format if available
 * @param {Object} sources.sm - Small screens (>= 640px) options
 * @param {Object} sources.md - Medium screens (>= 768px) options
 * @param {Object} sources.lg - Large screens (>= 1024px) options
 * @param {Object} sources.xl - Extra large screens (>= 1280px) options
 * @param {number} [width=0] - Current viewport width
 * @param {Object} [options] - Additional options
 * @param {string} [options.format='default'] - Preferred format (default, webp, avif)
 * @returns {string} - The appropriate image source
 */
export const getResponsiveImage = (sources, width = 0, options = {}) => {
  // Get window width on client side if not provided
  const currentWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 0);
  const preferredFormat = options.format || 'default';
  
  // Determine which breakpoint to use
  let breakpoint = 'xs';
  if (currentWidth >= 1280 && sources.xl) breakpoint = 'xl';
  else if (currentWidth >= 1024 && sources.lg) breakpoint = 'lg';
  else if (currentWidth >= 768 && sources.md) breakpoint = 'md';
  else if (currentWidth >= 640 && sources.sm) breakpoint = 'sm';
  
  // If sources for this breakpoint is a string (legacy format), return it directly
  if (typeof sources[breakpoint] === 'string') {
    return sources[breakpoint];
  }
  
  // Get the source object for this breakpoint
  const source = sources[breakpoint];
  if (!source) return '';
  
  // Return the appropriate format, falling back to default if preferred format not available
  return source[preferredFormat] || source.webp || source.default;
};

/**
 * Checks if WebP format is supported by the browser
 * 
 * @returns {Promise<boolean>} - Resolves to true if WebP is supported
 */
export const supportsWebP = async () => {
  if (typeof window === 'undefined') return false;
  
  if ('supportsWebP' in window) {
    return window.supportsWebP;
  }
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  
  try {
    const result = await fetch(webpData).then(r => r.blob());
    window.supportsWebP = result.size > 0;
    return window.supportsWebP;
  } catch (e) {
    window.supportsWebP = false;
    return false;
  }
};

/**
 * Checks if AVIF format is supported by the browser
 * 
 * @returns {Promise<boolean>} - Resolves to true if AVIF is supported
 */
export const supportsAVIF = async () => {
  if (typeof window === 'undefined') return false;
  
  if ('supportsAVIF' in window) {
    return window.supportsAVIF;
  }
  
  const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  try {
    const result = await fetch(avifData).then(r => r.blob());
    window.supportsAVIF = result.size > 0;
    return window.supportsAVIF;
  } catch (e) {
    window.supportsAVIF = false;
    return false;
  }
};

/**
 * Get the best supported image format for the current browser
 * 
 * @returns {Promise<string>} - Resolves to 'avif', 'webp', or 'default'
 */
export const getBestImageFormat = async () => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'default';
};

/**
 * Creates a srcSet string from image sources for different widths
 * 
 * @param {Object} sources - Object with image sources keyed by width in pixels
 * @param {string} [format='default'] - Image format (default, webp, avif)
 * @returns {string} - Properly formatted srcSet string
 * 
 * @example
 * createSrcSet({
 *   640: { default: '/images/small.jpg', webp: '/images/small.webp' },
 *   1024: { default: '/images/medium.jpg', webp: '/images/medium.webp' },
 *   1920: { default: '/images/large.jpg', webp: '/images/large.webp' }
 * }, 'webp');
 * // Returns: '/images/small.webp 640w, /images/medium.webp 1024w, /images/large.webp 1920w'
 */
export const createSrcSet = (sources, format = 'default') => {
  return Object.entries(sources)
    .map(([width, src]) => {
      // Handle both string sources and object sources
      const sourceUrl = typeof src === 'string' ? src : (src[format] || src.default);
      return `${sourceUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Creates a picture element with multiple source formats and sizes
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.alt - Alt text for the image
 * @param {Object} config.sources - Source objects for different sizes
 * @param {string} config.fallback - Fallback image URL
 * @param {Object} [config.imgProps] - Additional props for img element
 * @returns {Object} - Object with srcSet, sources array, and img props
 */
export const createResponsivePicture = (config) => {
  const { alt, sources, fallback, imgProps = {} } = config;
  
  // Generate source elements for different formats
  const sourceElements = [];
  
  // AVIF sources
  const avifSrcSet = createSrcSet(sources, 'avif');
  if (avifSrcSet) {
    sourceElements.push({
      type: 'image/avif',
      srcSet: avifSrcSet,
      sizes: imgProps.sizes || 'auto'
    });
  }
  
  // WebP sources
  const webpSrcSet = createSrcSet(sources, 'webp');
  if (webpSrcSet) {
    sourceElements.push({
      type: 'image/webp',
      srcSet: webpSrcSet,
      sizes: imgProps.sizes || 'auto'
    });
  }
  
  // Default format sources
  const defaultSrcSet = createSrcSet(sources, 'default');
  
  return {
    sources: sourceElements,
    imgProps: {
      src: fallback,
      alt,
      srcSet: defaultSrcSet,
      ...imgProps
    }
  };
};
