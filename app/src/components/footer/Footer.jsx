// FILE: app/src/components/footer/Footer.jsx
import React, { useRef, useState, useEffect } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import { IconPair } from '../utils/IconPair'
import clsx from 'clsx'

export default function Footer() {
  const containerRef = useRef(null)
  const inView = useIntersection(containerRef, { threshold: 0.1 })

  // Once these icons have turned orange, they won't switch back
  const [colorTriggered, setColorTriggered] = useState(false)

  useEffect(() => {
    if (inView && !colorTriggered) {
      // Give user time to see them green
      const timer = setTimeout(() => {
        setColorTriggered(true)
      }, 750)
      return () => clearTimeout(timer)
    }
  }, [inView, colorTriggered])

  // If not triggered => green; once triggered => orange
  // Keep the .animate-soft-glow so they continue pulsing after color change
  const iconClass = colorTriggered
    ? 'text-neonOrange-500 animate-soft-glow'
    : 'text-brandGreen-500 animate-soft-glow'

  return (
    <footer className="mt-16 text-white" ref={containerRef}>
      <div className="bg-brandGray-900 py-6 px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            
            <IconPair
              Icon={LuTwitter}
              iconAnimationClass={clsx(
                'fill-current stroke-current', 
                'transition-colors duration-500 ease-in-out',
                iconClass
              )}
              url="https://twitter.com/andrewgenai"
            />

            <IconPair
              Icon={LuGithub}
              iconAnimationClass={clsx(
                'fill-current stroke-current',
                'transition-colors duration-500 ease-in-out',
                iconClass
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
