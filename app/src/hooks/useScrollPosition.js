/**
 * Enhanced scroll position hook that efficiently tracks scroll position
 * Uses requestAnimationFrame and throttling for optimal performance
 * Also provides direction and percent information
 * 
 * @returns {Object} Scroll information including y position, direction, and percent, and forceRecalculation function
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { scrollLockState } from './useLockBodyScroll'

export default function useScrollPosition() {
    const [scrollInfo, setScrollInfo] = useState({
        y: typeof window !== 'undefined' ? document.documentElement.scrollTop : 0,
        direction: 'none',
        percent: 0
    })
    
    // Use refs to track previous values and calculate direction
    const prevScrollY = useRef(typeof window !== 'undefined' ? document.documentElement.scrollTop : 0)
    const frameRef = useRef(null)
    const throttleTimeoutRef = useRef(null)
    const scrollEndTimeoutRef = useRef(null)
    
    // We use this ref to track if we should update state
    // This avoids unnecessary re-renders if scroll position didn't change enough
    const minScrollChange = 0 // Only update if scroll changed by at least this many pixels
    
    // Centralized recalculation function that gets the most accurate scroll percentage
    const recalculateScroll = useCallback(() => {
        // Skip if scroll is locked
        if (scrollLockState.isLocked) return
        
        // Get scroll values from documentElement (more consistent across browsers/devices)
        const doc = document.documentElement
        const scrollTop = doc.scrollTop
        const scrollHeight = doc.scrollHeight
        const clientHeight = doc.clientHeight
        
        // Calculate scrollable area (total height minus visible area)
        const scrollable = scrollHeight - clientHeight
        
        // Prevent division by zero and calculate percentage
        // Using Math.round and a slight buffer (100.5%) to ensure we hit 100% on mobile
        const percent = scrollable <= 0 ? 0 : Math.min(100.5, Math.round((scrollTop / scrollable) * 100))
        
        // Temporary debug logging to help diagnose scroll calculation issues
        console.log('DEBUG SCROLL: ', {
            scrollTop,
            scrollHeight,
            clientHeight,
            scrollable,
            rawPercent: (scrollTop / scrollable) * 100,
            finalPercent: percent,
            isBottomReached: scrollTop + clientHeight >= scrollHeight - 5 // within 5px of bottom
        });
        
        // Determine scroll direction
        const direction = scrollTop > prevScrollY.current ? 'down' : 
                         scrollTop < prevScrollY.current ? 'up' : 'none'
        
        // Update state with all scroll info
        setScrollInfo({
            y: scrollTop,
            direction,
            percent
        })
        
        // Update ref with current value
        prevScrollY.current = scrollTop
    }, [])
    
    // Function to force recalculation that can be called from outside components
    // particularly useful for "Show More" or dynamic content changes
    const forceRecalculation = useCallback(() => {
        if (scrollLockState.isLocked) return
        
        // Use requestAnimationFrame to ensure DOM has updated
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current)
        }
        
        frameRef.current = requestAnimationFrame(() => {
            recalculateScroll()
            frameRef.current = null
        })
    }, [recalculateScroll])
    
    useEffect(() => {
        if (typeof window === 'undefined') return
        
        // Throttled handler to improve performance
        function throttledHandler() {
            // Skip handling events entirely if body is locked
            if (scrollLockState.isLocked) return
            
            if (throttleTimeoutRef.current === null) {
                throttleTimeoutRef.current = setTimeout(() => {
                    forceRecalculation()
                    throttleTimeoutRef.current = null
                }, 10) // 10ms throttle
            }
        }
        
        // Special handler for scroll end detection
        // This helps catch the end of scrolling, including mobile "bounce" effects
        function onScrollEnd() {
            if (scrollLockState.isLocked) return
            
            // Clear existing timeout to avoid multiple calls
            if (scrollEndTimeoutRef.current) {
                clearTimeout(scrollEndTimeoutRef.current)
            }
            
            // Set a new timeout that will trigger once scrolling stops
            scrollEndTimeoutRef.current = setTimeout(() => {
                forceRecalculation()
                scrollEndTimeoutRef.current = null
            }, 150) // Wait for scrolling to fully stop
        }
        
        // Add event listeners with passive option for performance
        window.addEventListener('scroll', throttledHandler, { passive: true })
        window.addEventListener('scroll', onScrollEnd, { passive: true })
        window.addEventListener('resize', throttledHandler, { passive: true })
        window.addEventListener('orientationchange', throttledHandler, { passive: true })
        
        // Support for Visual Viewport API (specifically for mobile)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', throttledHandler)
            window.visualViewport.addEventListener('scroll', throttledHandler)
        }
        
        // Use ResizeObserver to watch for changes in document body height
        // This helps capture dynamic content changes like "Show More" toggles
        const resizeObserver = new ResizeObserver(throttledHandler)
        resizeObserver.observe(document.body)
        
        // Initial calculation
        if (!scrollLockState.isLocked) {
            forceRecalculation()
        }
        
        return () => {
            // Clean up event listeners
            window.removeEventListener('scroll', throttledHandler)
            window.removeEventListener('scroll', onScrollEnd)
            window.removeEventListener('resize', throttledHandler)
            window.removeEventListener('orientationchange', throttledHandler)
            
            // Clean up Visual Viewport listeners
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', throttledHandler)
                window.visualViewport.removeEventListener('scroll', throttledHandler)
            }
            
            resizeObserver.disconnect()
            
            // Cancel any pending animations
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current)
                frameRef.current = null
            }
            
            // Clear any pending timeouts
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current)
                throttleTimeoutRef.current = null
            }
            
            if (scrollEndTimeoutRef.current) {
                clearTimeout(scrollEndTimeoutRef.current)
                scrollEndTimeoutRef.current = null
            }
        }
    }, [forceRecalculation])
    
    // Return scroll info plus the force recalculation function
    return {
        ...scrollInfo,
        forceRecalculation
    }
}
