import { useEffect, useState, useRef } from 'react'
import { throttle } from 'lodash' // or implement your own throttle function

export function useScrollTracking(threshold = 50, throttleMs = 200) {
    const [scrollData, setScrollData] = useState({
        position: 0,
        direction: null,
    })
    const previousScroll = useRef(0)

    useEffect(() => {
        const handleScroll = throttle(() => {
            const currentScroll = window.scrollY
            if (Math.abs(currentScroll - previousScroll.current) > threshold) {
                setScrollData({
                    position: currentScroll,
                    direction:
                        currentScroll > previousScroll.current ? 'down' : 'up',
                    distance: Math.abs(currentScroll - previousScroll.current),
                })
                previousScroll.current = currentScroll
            }
        }, throttleMs)

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [threshold, throttleMs])

    return scrollData
}
