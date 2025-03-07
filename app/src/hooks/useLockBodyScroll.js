import { useEffect } from 'react'

// Create a global flag to track when scrolling is locked
// This will be used by other hooks like useScrollPosition
export const scrollLockState = {
    isLocked: false
}

/**
 * Enhanced hook that locks body scrolling and maintains scroll position
 * Uses techniques that work across browsers including iOS
 */
export default function useLockBodyScroll(isLocked) {
    useEffect(() => {
        // Save the original body style properties to restore later
        const originalStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            scrollY: window.scrollY
        }

        if (isLocked) {
            // Update global state first
            scrollLockState.isLocked = true

            // Lock scroll - compliant approach that works in iOS
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${originalStyle.scrollY}px`
            document.body.style.width = '100%'
        } else {
            // Restore original styles
            document.body.style.overflow = originalStyle.overflow
            document.body.style.position = originalStyle.position
            document.body.style.top = originalStyle.top
            document.body.style.width = originalStyle.width
            
            // Restore scroll position - but only if we were previously locked
            if (scrollLockState.isLocked) {
                const scrollY = parseInt(document.body.style.top || '0') * -1
                window.scrollTo(0, scrollY)
            }
            
            // Update global state
            scrollLockState.isLocked = false
        }

        // Clean up function
        return () => {
            // Only run cleanup if component unmounts while locked
            if (isLocked) {
                document.body.style.overflow = originalStyle.overflow
                document.body.style.position = originalStyle.position
                document.body.style.top = originalStyle.top
                document.body.style.width = originalStyle.width
                window.scrollTo(0, originalStyle.scrollY)
                
                // Reset global state
                scrollLockState.isLocked = false
            }
        }
    }, [isLocked]) // Only re-run when isLocked changes
}
