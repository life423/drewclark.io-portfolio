// FILE: app/src/hooks/useStaggeredTwoIcons.js

import { useState, useEffect, useCallback } from 'react'

export default function useStaggeredTwoIcons({ inView, maxIterations = 3 }) {
    // Count how many full cycles (Twitter → GitHub) we’ve done
    const [iteration, setIteration] = useState(0)
    // 0=idle, 1=twitter anim, 2=github anim
    const [phase, setPhase] = useState(0)

    const [leftClass, setLeftClass] = useState('')
    const [rightClass, setRightClass] = useState('')

    // Start if inView, haven't exceeded max, and we’re idle
    useEffect(() => {
        if (inView && iteration < maxIterations && phase === 0) {
            // Start left icon (Twitter)
            setPhase(1)
            setLeftClass('animate-iconPulse')
        }
    }, [inView, iteration, maxIterations, phase])

    // Left icon ends -> start right icon
    const onLeftEnd = useCallback(() => {
        // Only proceed if we’re in left-phase
        if (phase !== 1) return
        setLeftClass('')
        setPhase(2)
        setRightClass('animate-iconPulse')
    }, [phase])

    // Right icon ends -> increment iteration
    const onRightEnd = useCallback(() => {
        if (phase !== 2) return
        setRightClass('')
        setPhase(0)

        setIteration(prev => prev + 1)
    }, [phase])

    // If user scrolls away, reset
    useEffect(() => {
        if (!inView) {
            stopAll()
        }
    }, [inView])

    // If iteration >= max => done
    useEffect(() => {
        if (iteration >= maxIterations) {
            stopAll()
        }
    }, [iteration, maxIterations])

    // user taps -> stop now
    const stopNow = useCallback(() => {
        stopAll()
        // Set iteration to max to block future restarts
        setIteration(maxIterations)
    }, [maxIterations])

    // Helper to clear classes/phase
    const stopAll = useCallback(() => {
        setLeftClass('')
        setRightClass('')
        setPhase(0)
    }, [])

    return {
        leftClass,
        rightClass,
        onLeftEnd,
        onRightEnd,
        stopNow,
    }
}
