import { useState, useEffect } from 'react'

/**
 * Hook for tracking viewport size and providing responsive breakpoint information.
 * This builds on our existing resize detection to provide an enterprise-level
 * responsive solution that components can leverage.
 * 
 * @returns {Object} Object containing viewport information:
 *  - width: Current viewport width
 *  - height: Current viewport height
 *  - isMobile: True if width is below 640px (sm breakpoint)
 *  - isTablet: True if width is between 640px and 1024px (sm to lg breakpoints)
 *  - isDesktop: True if width is at least 1024px (lg breakpoint)
 *  - breakpoint: Current breakpoint string ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export default function useViewport() {
  // Initialize with window dimensions if available (client-side)
  // Use reasonable defaults for server-side rendering
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    // Skip for server-side rendering
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Set dimensions on mount and add listener
    handleResize()
    window.addEventListener('resize', handleResize)

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Determine current breakpoint based on Tailwind's default breakpoints
  const getBreakpoint = (width) => {
    if (width < 640) return 'xs'
    if (width < 768) return 'sm'
    if (width < 1024) return 'md'
    if (width < 1280) return 'lg'
    if (width < 1536) return 'xl'
    return '2xl'
  }

  // Add derived properties
  return {
    ...dimensions,
    isMobile: dimensions.width < 640,
    isTablet: dimensions.width >= 640 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    breakpoint: getBreakpoint(dimensions.width)
  }
}
