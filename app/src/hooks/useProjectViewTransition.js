import { useCallback, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

const SHARED_PARTS = ['art', 'title']

function isInView(element) {
    if (!element) return false
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
        && rect.right > 0 && rect.left < window.innerWidth
}

// Only the chosen project's artwork frame and title travel between views.
// Navigation, focus and scrolling also work without the animation API.
export default function useProjectViewTransition() {
    const active = useRef(null)
    const sequence = useRef(0)
    const clearNames = useRef(() => {})

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const skip = () => active.current?.skipTransition()
        const handOffToExplorer = event => {
            const transition = active.current
            if (!transition) return
            transition.skipTransition()
            // Some engines retire the snapshot layer on the next rendering
            // update. Let the dialog await that native completion, not a timer.
            if (event.detail) event.detail.settled = transition.finished.catch(() => {})
        }
        window.addEventListener('resize', skip)
        // A native drawer must own the top layer, without project snapshots
        // painting over it during a rapid card-to-Explorer interaction.
        window.addEventListener('portfolio:explore-build', handOffToExplorer)
        reduceMotion.addEventListener('change', skip)
        return () => {
            skip()
            clearNames.current()
            sequence.current++
            document.documentElement.classList.remove('project-view-transition')
            window.removeEventListener('resize', skip)
            window.removeEventListener('portfolio:explore-build', handOffToExplorer)
            reduceMotion.removeEventListener('change', skip)
        }
    }, [])

    return useCallback(({ from, update, place, destination }) => {
        active.current?.skipTransition()
        clearNames.current()
        const id = ++sequence.current
        active.current = null
        document.documentElement.classList.remove('project-view-transition')

        const animate = from && document.startViewTransition
            && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const named = []
        const parts = animate ? SHARED_PARTS.filter(part => {
            const element = from.querySelector(`[data-project-${part}]`)
            if (!isInView(element)) return false
            element.style.viewTransitionName = `project-${part}`
            named.push(element)
            return true
        }) : []
        const cleanup = () => {
            // The prior destination can be the next transition's source. A
            // late finished promise must not remove that newer owner's names.
            if (id !== sequence.current) return
            named.forEach(element => element.style.removeProperty('view-transition-name'))
            active.current = null
            document.documentElement.classList.remove('project-view-transition')
        }
        clearNames.current = cleanup

        const render = () => {
            // A newer click can supersede a transition before its callback runs.
            if (id !== sequence.current) return
            flushSync(update)
            place()
            const target = destination?.()
            parts.forEach(part => {
                const element = target?.querySelector(`[data-project-${part}]`)
                if (!isInView(element)) return
                // A different detail poster may still be loading. Let its
                // reserved frame load normally rather than animate a blank.
                const image = part === 'art' ? element.querySelector('img') : null
                if (image && (!image.complete || !image.naturalWidth)) return
                element.style.viewTransitionName = `project-${part}`
                named.push(element)
            })
        }

        if (!parts.length) {
            render()
            cleanup()
            return
        }

        document.documentElement.classList.add('project-view-transition')
        try {
            const transition = document.startViewTransition(render)
            active.current = transition
            // Resize, hidden tabs and browser snapshot limits may skip motion.
            // The native update callback still performs the navigation.
            transition.ready.catch(() => {})
            transition.finished.then(cleanup, cleanup)
        } catch {
            render()
            cleanup()
        }
    }, [])
}
