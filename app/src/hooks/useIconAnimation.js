import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useSingleIconAnimation - Hook for managing the animation lifecycle of a single icon.
 *
 * @param {Object} options - Options for the hook.
 * @param {string} [options.animationClass='animate-icon-gentle-pulse'] - CSS animation class to apply.
 * @param {number} [options.maxIterations=3] - Maximum number of animation cycles.
 * @param {boolean} [options.inView=false] - Whether the element is in view.
 * @param {boolean} [options.autoStart=true] - Whether to start the animation automatically when in view.
 * @returns {Object} Object containing:
 *  - isAnimating: boolean indicating if animation is active.
 *  - currentClass: CSS class to apply (animationClass or empty string).
 *  - handleAnimationEnd: Callback to be triggered on animation end.
 *  - startAnimation: Function to manually start the animation.
 *  - stopAnimation: Function to manually stop the animation.
 */
export function useSingleIconAnimation({
  animationClass = 'animate-icon-gentle-pulse',
  maxIterations = 3,
  inView = false,
  autoStart = true
} = {}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const iterationCountRef = useRef(0)

  // Reset and auto-start when inView changes
  useEffect(() => {
    if (!inView) {
      iterationCountRef.current = 0
      setIsAnimating(false)
    } else if (autoStart && !isAnimating) {
      setIsAnimating(true)
    }
  }, [inView, autoStart, isAnimating])

  const handleAnimationEnd = useCallback(() => {
    iterationCountRef.current += 1
    if (iterationCountRef.current >= maxIterations) {
      setIsAnimating(false)
      iterationCountRef.current = 0
    }
  }, [maxIterations])

  const startAnimation = useCallback(() => {
    iterationCountRef.current = 0
    setIsAnimating(true)
  }, [])

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
    iterationCountRef.current = 0
  }, [])

  return {
    isAnimating,
    currentClass: isAnimating ? animationClass : '',
    handleAnimationEnd,
    startAnimation,
    stopAnimation,
  }
}

/**
 * useStaggeredIconAnimation - Hook for managing the sequential animation of two icons.
 *
 * This hook handles the staggered animation process:
 *  - When in view, the left icon starts animating.
 *  - On its animation end, the right icon animates.
 *  - After both animations complete, an iteration is counted.
 *  - Stops after the max number of iterations.
 *
 * @param {Object} options - Options for the hook.
 * @param {boolean} options.inView - Whether the icons are in view.
 * @param {number} [options.maxIterations=3] - Maximum number of animation cycles.
 * @returns {Object} Object containing:
 *  - leftClass: CSS class for the left icon.
 *  - rightClass: CSS class for the right icon.
 *  - onLeftEnd: Callback to be triggered when the left icon's animation ends.
 *  - onRightEnd: Callback to be triggered when the right icon's animation ends.
 *  - stopNow: Function to immediately stop the animations.
 */
export function useStaggeredIconAnimation({ inView, maxIterations = 3 } = {}) {
  const [iteration, setIteration] = useState(0)
  const [phase, setPhase] = useState(0) // 0: idle, 1: left animating, 2: right animating
  const [leftClass, setLeftClass] = useState('')
  const [rightClass, setRightClass] = useState('')

  const stopAll = useCallback(() => {
    setLeftClass('')
    setRightClass('')
    setPhase(0)
  }, [])

  // Reset when out of view
  useEffect(() => {
    if (!inView) {
      stopAll()
      setIteration(0)
    }
  }, [inView, stopAll])

  // Auto-start when in view, idle, and iterations remain
  useEffect(() => {
    if (inView && iteration < maxIterations && phase === 0) {
      setPhase(1)
      setLeftClass('animate-iconPulse')
    }
  }, [inView, iteration, maxIterations, phase])

  const onLeftEnd = useCallback(() => {
    if (phase !== 1) return
    setLeftClass('')
    setPhase(2)
    setRightClass('animate-iconPulse')
  }, [phase])

  const onRightEnd = useCallback(() => {
    if (phase !== 2) return
    setRightClass('')
    setPhase(0)
    setIteration(prev => prev + 1)
  }, [phase])

  const stopNow = useCallback(() => {
    stopAll()
    setIteration(maxIterations)
  }, [maxIterations, stopAll])

  // Stop all animations if maximum iterations are reached
  useEffect(() => {
    if (iteration >= maxIterations) {
      stopAll()
    }
  }, [iteration, maxIterations, stopAll])

  return {
    leftClass,
    rightClass,
    onLeftEnd,
    onRightEnd,
    stopNow,
  }
}
