import { useState, useEffect, useRef } from 'react'

export default function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (!ref.current) return

        // Set initial dimensions on mount if ref.current exists
        if (ref.current) {
            setDimensions({
                width: ref.current.clientWidth,
                height: ref.current.clientHeight
            })
        }

        const handleResize = entries => {
            // Early return if entries is empty or ref is null
            if (!entries.length || !ref.current) return
            
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        }

        const resizeObserver = new ResizeObserver(handleResize)
        resizeObserver.observe(ref.current)

        // Cleanup on unmount
        return () => resizeObserver.disconnect()
    }, [ref])

    return dimensions
}
