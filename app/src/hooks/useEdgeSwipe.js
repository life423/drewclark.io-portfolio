import { useEffect } from 'react'

export default function useEdgeSwipe({ edgeWidth = 20, onSwipeRight }) {
    useEffect(() => {
        let startX = null
        let startY = null

        function handleTouchStart(e) {
            // Only consider single-finger touches
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX
                startY = e.touches[0].clientY
            }
        }

        function handleTouchMove(e) {
            if (startX === null) return
            const currentX = e.touches[0].clientX
            const currentY = e.touches[0].clientY

            const deltaX = currentX - startX
            const deltaY = currentY - startY

            // Only trigger if horizontal swipe is significantly larger than vertical
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && deltaX > 0) {
                // If the swipe started near the left edge
                if (startX <= edgeWidth) {
                    onSwipeRight()
                }
                // Reset to avoid multiple triggers
                startX = null
                startY = null
            }
        }

        function cleanup() {
            startX = null
            startY = null
        }

        window.addEventListener('touchstart', handleTouchStart, {
            passive: true,
        })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('touchend', cleanup)
        window.addEventListener('touchcancel', cleanup)

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', cleanup)
            window.removeEventListener('touchcancel', cleanup)
        }
    }, [onSwipeRight, edgeWidth])
}
