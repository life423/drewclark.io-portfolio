import { useState, useEffect, useRef } from 'react'

export default function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (!ref.current) return

        const handleResize = entries => {
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
