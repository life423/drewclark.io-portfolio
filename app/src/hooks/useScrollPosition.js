/**
 * Enhanced scroll position hook that efficiently tracks scroll position
 * Uses requestAnimationFrame and throttling for optimal performance
 * Also provides direction and percent information
 * 
 * @returns {Object} Scroll information including y position, direction, and percent
 */
import { useState, useEffect, useRef } from 'react'

export default function useScrollPosition() {
    const [scrollInfo, setScrollInfo] = useState({
        y: typeof window !== 'undefined' ? window.scrollY : 0,
        direction: 'none',
        percent: 0
    })
    
    // Use refs to track previous values and calculate direction
    const prevScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0)
    const frameRef = useRef(null)
    const throttleTimeoutRef = useRef(null)
    
    // We use this ref to track if we should update state
    // This avoids unnecessary re-renders if scroll position didn't change enough
    const minScrollChange = 0 // Only update if scroll changed by at least this many pixels
    
    useEffect(() => {
        if (typeof window === 'undefined') return
        
        // Function to calculate scroll percentage
        const getScrollPercent = () => {
            const h = document.documentElement
            const maxScrollHeight = h.scrollHeight - h.clientHeight
            return maxScrollHeight <= 0 ? 0 : Math.min(100, (window.scrollY / maxScrollHeight) * 100)
        }
        
        function handleScroll() {
            if (frameRef.current) return
            
            frameRef.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY
                
                // Only update if scroll position changed significantly
                if (Math.abs(currentScrollY - prevScrollY.current) >= minScrollChange) {
                    // Determine scroll direction
                    const direction = currentScrollY > prevScrollY.current ? 'down' : 
                                     currentScrollY < prevScrollY.current ? 'up' : 'none'
                    
                    // Calculate scroll percentage - useful for progress bar
                    const percent = getScrollPercent()
                    
                    // Update state with all scroll info
                    setScrollInfo({
                        y: currentScrollY,
                        direction,
                        percent
                    })
                    
                    // Update ref with current value
                    prevScrollY.current = currentScrollY
                }
                
                frameRef.current = null
            })
        }
        
        // Throttled scroll handler to improve performance
        function throttledScrollHandler() {
            if (throttleTimeoutRef.current === null) {
                throttleTimeoutRef.current = setTimeout(() => {
                    handleScroll()
                    throttleTimeoutRef.current = null
                }, 10) // 10ms throttle
            }
        }
        
        // Add event listener with passive option for performance
        window.addEventListener('scroll', throttledScrollHandler, { passive: true })
        
        // Initial call to set initial position
        handleScroll()
        
        return () => {
            window.removeEventListener('scroll', throttledScrollHandler)
            
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current)
                frameRef.current = null
            }
            
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current)
                throttleTimeoutRef.current = null
            }
        }
    }, [])
    
    return scrollInfo
}
