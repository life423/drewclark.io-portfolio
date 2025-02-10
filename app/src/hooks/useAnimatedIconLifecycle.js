// FILE: app/src/hooks/useAnimatedIconLifecycle.js
import { useState, useEffect, useRef } from 'react'

export default function useAnimatedIconLifecycle({
    maxIterations = 3,
    iconRef, // ref to the icon element
    inView = false, // from IntersectionObserver or something
}) {
    const [animateClass, setAnimateClass] = useState('') // empty by default
    const iterationCountRef = useRef(0)

    // When we come into view, start animating if not done
    useEffect(() => {
        if (inView && animateClass === '') {
            // Start the animation once we see the icon
            setAnimateClass('animate-iconPulse') // or "animate-fontFlash", etc.
        }
    }, [inView, animateClass])

    // onAnimationIteration callback
    function handleAnimationIteration() {
        iterationCountRef.current += 1
        if (iterationCountRef.current >= maxIterations) {
            setAnimateClass('') // remove the animation class
        }
    }

    // onClick or onTouch for user stopping the animation
    function handleUserStop() {
        setAnimateClass('')
    }

    return {
        animateClass,
        handleAnimationIteration,
        handleUserStop,
    }
}
