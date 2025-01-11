// src/hooks/useScrollPosition.js
import { useState, useEffect } from 'react'

export default function useScrollPosition() {
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        function handleScroll() {
            setScrollY(window.scrollY)
        }

        // Listen for scroll events
        window.addEventListener('scroll', handleScroll)
        // Initialize scroll position in case user is already scrolled
        handleScroll()

        // Cleanup event on unmount
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return scrollY
}
