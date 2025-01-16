// src/components/navbar/useSwipeToOpen.js (skeleton)
import { useEffect } from 'react'

export default function useSwipeToOpen(onOpenDrawer) {
    useEffect(() => {
        let startX = 0
        let currentX = 0
        const threshold = 50 // how far the user must swipe to trigger

        function onTouchStart(e) {
            // Only start if user touches near left edge, e.g. < 20px from screen edge
            if (e.touches[0].clientX < 20) {
                startX = e.touches[0].clientX
            }
        }

        function onTouchMove(e) {
            currentX = e.touches[0].clientX
        }

        function onTouchEnd() {
            // If user swiped right enough distance, open the drawer
            if (currentX - startX > threshold) {
                onOpenDrawer()
            }
            // reset
            startX = 0
            currentX = 0
        }

        document.addEventListener('touchstart', onTouchStart)
        document.addEventListener('touchmove', onTouchMove)
        document.addEventListener('touchend', onTouchEnd)

        return () => {
            document.removeEventListener('touchstart', onTouchStart)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
        }
    }, [onOpenDrawer])
}
