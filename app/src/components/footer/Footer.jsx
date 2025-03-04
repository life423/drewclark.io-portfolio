// FILE: app/src/components/footer/Footer.jsx
import React, { useRef, useState, useEffect } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import { IconPair } from '../utils/IconPair'
import clsx from 'clsx'
import useScrollPosition from '../../hooks/useScrollPosition'

export default function Footer() {
  const containerRef = useRef(null)
  const inView = useIntersection(containerRef, { threshold: 0.1 })
  const scrollY = useScrollPosition()
  
  // Track animation states
  const [hasBeenSeen, setHasBeenSeen] = useState(false)
  const [animationTriggered, setAnimationTriggered] = useState(false)
  const [wasOutOfView, setWasOutOfView] = useState(false)
  
  // First time footer comes into view
  useEffect(() => {
    if (inView && !hasBeenSeen) {
      setHasBeenSeen(true);
    }
  }, [inView, hasBeenSeen]);
  
  // If footer was previously seen but is now out of view
  useEffect(() => {
    if (hasBeenSeen && !inView) {
      setWasOutOfView(true);
    }
  }, [hasBeenSeen, inView]);
  
  // When user scrolls back down and footer comes into view again
  useEffect(() => {
    if (inView && wasOutOfView && !animationTriggered) {
      setAnimationTriggered(true);
    }
  }, [inView, wasOutOfView, animationTriggered]);

  // Determine which animation to use
  const animationClass = animationTriggered 
    ? 'animate-triple-pulse-to-orange' 
    : '';

  return (
    <footer className="mt-16 text-white" ref={containerRef}>
      <div className="bg-brandGray-900 py-6 px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <IconPair
              Icon={LuTwitter}
              iconAnimationClass={clsx(
                'fill-current stroke-current', 
                'text-brandGreen-500',
                animationClass
              )}
              url="https://twitter.com/andrewgenai"
            />

            <IconPair
              Icon={LuGithub}
              iconAnimationClass={clsx(
                'fill-current stroke-current',
                'text-brandGreen-500',
                animationClass
              )}
              url="https://github.com/life423"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span>Clark Company Limited</span>
            <span>&copy;</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
