import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import useIntersection from '../../hooks/useIntersection'
import '../../styles/components/hero-tagline.css'

const VISIBILITY_OPTIONS = { threshold: 0.1 }
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** One typing entrance, shared by both responsive copies. Never erases or loops. */
export default function TypedTextEffect({ text, compactText = text, typingSpeed = 60, startDelay = 0 }) {
  const elementRef = useRef(null)
  const isVisible = useIntersection(elementRef, VISIBILITY_OPTIONS)
  const stepCount = Math.max(text.length, compactText.length)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches)
  const [typedSteps, setTypedSteps] = useState(() => reducedMotion ? stepCount : 0)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  const [ready, setReady] = useState(startDelay === 0)
  const complete = reducedMotion || typedSteps >= stepCount

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), startDelay)
    return () => window.clearTimeout(timer)
  }, [startDelay])

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      // Switching motion back on must not replay text already shown in full.
      setTypedSteps(stepCount)
      return
    }
    if (complete || !ready || !isVisible || !pageVisible) return
    const timer = window.setTimeout(() => setTypedSteps(current => Math.min(current + 1, stepCount)), typingSpeed)
    return () => window.clearTimeout(timer)
  }, [complete, ready, isVisible, pageVisible, reducedMotion, typedSteps, stepCount, typingSpeed])

  const reveal = copy => complete ? copy : copy.slice(0, Math.ceil(typedSteps * copy.length / stepCount))

  return (
    <span ref={elementRef} className='block w-full' data-testid='hero-tagline'>
      {/* Read the sentence once, without announcing each animated character. */}
      <span className='sr-only'>
        <span className='md:hidden'>{compactText}</span>
        <span className='hidden md:inline'>{text}</span>
      </span>
      <span aria-hidden='true' className='grid'>
        {/* Reserve the final wrapping before typing so the actions stay put. */}
        <span className='invisible col-start-1 row-start-1 pointer-events-none'>
          <span className='md:hidden'>{compactText}</span>
          <span className='hidden md:inline'>{text}</span>
        </span>
        <span className='col-start-1 row-start-1'>
          <span className='md:hidden' data-typed-copy='compact'>{reveal(compactText)}</span>
          <span className='hidden md:inline' data-typed-copy='full'>{reveal(text)}</span>
          {!complete && ready && isVisible && pageVisible && <span className='hero-tagline-cursor' />}
        </span>
      </span>
    </span>
  )
}

TypedTextEffect.propTypes = {
  text: PropTypes.string.isRequired,
  compactText: PropTypes.string,
  typingSpeed: PropTypes.number,
  startDelay: PropTypes.number,
}
