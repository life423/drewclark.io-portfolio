import React, { useState, useEffect, useRef } from 'react'
import { useFocus } from '../../contexts/FocusContext'
import useIntersection from '../../hooks/useIntersection'

export default function ProgressiveElement({
  id,
  children,
  className = '',
  appearOnScroll = false,
  appearDelay = 0,
  focusStage = 0,
  dimWhenInactive = true,
  transitionDuration = 800,
  transitionEasing = 'cubic-bezier(0.23, 1, 0.32, 1)'
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
  
  // Determine the state-based classes - modified to use wasActive for preventing re-blur
  const stateClasses = [
    visible ? 'pe-visible' : 'pe-hidden',
    isActive(id) ? 'pe-focused' : 'pe-unfocused',
    // Only apply the dimmed (blur) effect if:
    // - Dimming is enabled via prop
    // - The element is not active
    // - The element is visible
    // - AND the element has never been active before (to prevent re-blurring)
    dimWhenInactive && !isActive(id) && visible ? 'pe-dimmed' : ''
  ].filter(Boolean).join(' ')
  
  return (
    <div
      ref={elementRef}
      id={id}
      className={`progressive-element ${stateClasses} ${className}`}
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
