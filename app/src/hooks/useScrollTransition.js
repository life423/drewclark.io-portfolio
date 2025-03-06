import { useState, useEffect } from 'react';

/**
 * Hook to calculate transition values based on scroll position
 * @param {Object} options - Configuration options
 * @param {number} options.startOffset - Scroll position where transition begins (in pixels or vh units)
 * @param {number} options.endOffset - Scroll position where transition completes (in pixels or vh units)
 * @param {boolean} options.useViewportHeight - If true, interpret offsets as vh units instead of pixels
 * @returns {Object} Transition values and metrics
 */
export default function useScrollTransition({
  startOffset = 0,
  endOffset = 100,
  useViewportHeight = true
}) {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Get initial measurements
    const vh = window.innerHeight;
    setViewportHeight(vh);

    // Convert vh values to pixels if necessary
    const start = useViewportHeight ? (startOffset * vh / 100) : startOffset;
    const end = useViewportHeight ? (endOffset * vh / 100) : endOffset;
    const range = end - start;

    // Handle scroll events
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // Calculate progress (0 to 1)
      if (currentScroll <= start) {
        setProgress(0);
      } else if (currentScroll >= end) {
        setProgress(1);
      } else {
        setProgress((currentScroll - start) / range);
      }
    };

    // Handle window resize
    const handleResize = () => {
      const newVh = window.innerHeight;
      setViewportHeight(newVh);
      // Recalculate progress with new viewport height
      handleScroll();
    };

    // Initial calculation
    handleScroll();

    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [startOffset, endOffset, useViewportHeight]);

  return {
    progress,          // 0 to 1 representing transition progress
    scrollY,           // Current scroll position in pixels
    viewportHeight,    // Current viewport height
    isInView: progress > 0 && progress < 1, // Whether currently in transition zone
    hasEntered: progress > 0,  // Whether entered or passed transition start
    hasExited: progress >= 1,  // Whether completed transition
  };
}
