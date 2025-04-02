import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect if an element is in the viewport
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [ref, isInViewport] - Ref to attach to element and boolean indicating if it's in viewport
 */
const useIsInViewport = (options = {}) => {
  const [isInViewport, setIsInViewport] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInViewport(entry.isIntersecting);
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [elementRef, isInViewport];
};

export default useIsInViewport;
