// FILE: app/src/hooks/useIntersection.js
import { useState, useEffect } from 'react'

export default function useIntersection(ref, options = {}) {
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting)
            },
            { threshold: 0.1, ...options }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref, options])

    return inView
}
