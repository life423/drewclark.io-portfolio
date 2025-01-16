// src/components/navbar/useSwipeToOpen.js
import { useEffect } from 'react'

export default function useSwipeToOpen(onOpenDrawer) {
    useEffect(() => {
        let startX = 0
        let currentX = 0
        const threshold = 50
        const edgeZone = 20

        function onTouchStart(e) {
            if (e.touches[0].clientX < edgeZone) {
                startX = e.touches[0].clientX
            }
        }

        function onTouchMove(e) {
            currentX = e.touches[0].clientX
        }

        function onTouchEnd() {
            if (currentX - startX > threshold) {
                onOpenDrawer()
            }
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
