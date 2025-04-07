import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useFocus } from '../../contexts/FocusContext'
import useIntersection from '../../hooks/useIntersection'
import { ANIMATION, EASING } from '../../styles/constants'

export default function ProgressiveElement({
  id,
  children,
  className = '',
  appearOnScroll = false,
  appearDelay = 0,
  dimWhenInactive = true,
  transitionDuration = ANIMATION.STANDARD,
  transitionEasing = EASING.SMOOTH
}) {
  const [visible, setVisible] = useState(false)
  const { isActive, focusElement } = useFocus()
  const elementRef = useRef(null)
  const isIntersecting = useIntersection(elementRef, { threshold: 0.2 })
  
  // Handle initial appearance based on delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, appearDelay)
    
    return () => clearTimeout(timer)
  }, [appearDelay])
  
  // Handle scroll-based appearance if enabled
  useEffect(() => {
    if (appearOnScroll && isIntersecting) {
      setVisible(true)
    }
  }, [appearOnScroll, isIntersecting])
  
  // Determine the state-based classes based on visibility, focus state, and dimming preference
  const stateClasses = clsx(
    visible ? 'pe-visible' : 'pe-hidden',
    isActive(id) ? 'pe-focused' : 'pe-unfocused',
    // Only apply the dimmed (blur) effect if:
    // - Dimming is enabled via prop
    // - The element is not active
    // - The element is visible
    {
      'pe-dimmed': dimWhenInactive && !isActive(id) && visible
    }
  )
  
  return (
    <div
      ref={elementRef}
      id={id}
      className={clsx('progressive-element', stateClasses, className)}
      style={{
        transition: `opacity ${transitionDuration}ms ${transitionEasing}, 
                     transform ${transitionDuration}ms ${transitionEasing},
                     filter ${transitionDuration}ms ${transitionEasing}`,
      }}
      onClick={() => focusElement(id)}
    >
      {children}
    </div>
  )
}
