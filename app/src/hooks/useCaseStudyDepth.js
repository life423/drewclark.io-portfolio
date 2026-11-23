import { useEffect } from 'react'

const ROOMY_CASE = '(min-width: 900px) and (min-height: 700px)'
const MAX_TRAVEL = 48

// Scroll changes one decorative layer. No React state or control geometry is
// involved, and there is no animation loop after scrolling stops.
export default function useCaseStudyDepth(dialogRef, projectId) {
    useEffect(() => {
        const dialog = dialogRef.current
        const article = dialog?.closest('.work-studio-case')
        if (!article) return

        const roomy = window.matchMedia(ROOMY_CASE)
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
        const navbar = document.querySelector('header nav')
        let frame = null
        let listening = false
        let lastOffset
        const enabled = () => roomy.matches && !reduced.matches && !document.hidden
        const writeOffset = value => {
            const offset = value.toFixed(3)
            if (offset === lastOffset) return
            lastOffset = offset
            dialog.style.setProperty('--case-depth-offset', `${offset}px`)
        }
        const update = () => {
            frame = null
            if (!enabled()) return
            // Follow the panel's full pinned interval. Using viewport height
            // made the wash stop early on tall windows, while reading continued.
            const rect = article.getBoundingClientRect()
            const inset = parseFloat(window.getComputedStyle(dialog).top) || 0
            const distance = Math.max(1, rect.height - dialog.clientHeight)
            const progress = Math.max(0, Math.min(1, (inset - rect.top) / distance))
            writeOffset(progress * MAX_TRAVEL)
        }
        const schedule = () => {
            if (enabled() && frame === null) frame = window.requestAnimationFrame(update)
        }
        const syncMotion = () => {
            if (frame !== null) window.cancelAnimationFrame(frame)
            frame = null
            if (enabled()) {
                if (!listening) window.addEventListener('scroll', schedule, { passive: true })
                listening = true
                schedule()
            } else {
                window.removeEventListener('scroll', schedule)
                listening = false
                writeOffset(0)
            }
        }
        const sizeObserver = new window.ResizeObserver(schedule)
        sizeObserver.observe(article)
        if (navbar) sizeObserver.observe(navbar)
        roomy.addEventListener('change', syncMotion)
        reduced.addEventListener('change', syncMotion)
        document.addEventListener('visibilitychange', syncMotion)
        window.addEventListener('resize', schedule, { passive: true })
        syncMotion()

        return () => {
            if (frame !== null) window.cancelAnimationFrame(frame)
            window.removeEventListener('scroll', schedule)
            window.removeEventListener('resize', schedule)
            document.removeEventListener('visibilitychange', syncMotion)
            roomy.removeEventListener('change', syncMotion)
            reduced.removeEventListener('change', syncMotion)
            sizeObserver.disconnect()
            dialog.style.removeProperty('--case-depth-offset')
        }
    }, [dialogRef, projectId])
}
