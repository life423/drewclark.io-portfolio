import { useState, useEffect } from 'react'

export default function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let frame = null

    function handleScroll() {
      // If there's no pending animation frame request, schedule one.
      if (!frame) {
        frame = requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          frame = null // reset for the next scroll event
        })
      }
    }

    // Attach the scroll listener once on mount
    window.addEventListener('scroll', handleScroll)
    // Initialize scroll position in case user is already scrolled
    handleScroll()

    // Cleanup on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) {
        cancelAnimationFrame(frame)
      }
    }
  }, [])

  return scrollY
}