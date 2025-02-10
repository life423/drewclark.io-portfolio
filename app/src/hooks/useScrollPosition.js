import { useState, useEffect } from 'react'

export default function useScrollPosition() {
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        let frame = null

        function handleScroll() {
            if (!frame) {
                frame = requestAnimationFrame(() => {
                    setScrollY(window.scrollY)
                    frame = null
                })
            }
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (frame) {
                cancelAnimationFrame(frame)
            }
        }
    }, [])

    return scrollY
}
