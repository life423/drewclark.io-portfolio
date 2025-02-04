// app/src/components/navbar/InfinityDrawer.jsx
import React, { useEffect, useRef, Children } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function InfinityDrawer({ isOpen, onClose, children }) {
    const drawerRef = useRef(null)
    const lastFocusedRef = useRef(null)

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            // Save the last focused element
            lastFocusedRef.current = document.activeElement

            // Prevent background scroll
            document.body.style.overflow = 'hidden'

            // Listen for ESC
            document.addEventListener('keydown', handleKeyDown)

            // Focus the drawer for accessibility
            drawerRef.current?.focus()
        } else {
            // Restore background scroll
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)

            // Restore focus
            if (lastFocusedRef.current) {
                lastFocusedRef.current.focus()
            }
        }

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    return (
        <>
            {/*
        --------------------------------------------------------
        Overlay: Now more opaque so the rest of the screen
        isn't see-through. No brand gradient; just a solid
        brandGray overlay to keep it simple & dark.
      --------------------------------------------------------
      */}
            <div
                className={`
          fixed inset-0 z-60
          bg-brandGray-900/80
          transition-opacity duration-300
          ${
              isOpen
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
          }
        `}
                onClick={onClose}
                aria-hidden='true'
                tabIndex={-1}
                role='presentation'
            />

            {/*
        --------------------------------------------------------
        Drawer Panel: Semi-transparent brandGray + frosted blur
        Has a gradient border-l for subtle brand synergy.
      --------------------------------------------------------
      */}
            <div
                role='dialog'
                aria-modal='true'
                aria-hidden={!isOpen}
                ref={drawerRef}
                tabIndex={-1}
                className={`
          fixed top-0 left-0 h-screen
          w-[70%] max-w-sm
          z-70 flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          backdrop-blur-md bg-brandGray-800/60
          border-l-[3px] border-gradient-to-b from-brandGreen-400 to-brandBlue-400
          outline-none focus:outline-none
        `}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 outline-none focus:outline-none'
                >
                    <XMarkIcon className='h-10 w-10  text-brandGreen-300 hover:text-brandGreen-300 transition-colors' />
                </button>

                {/*
          Main Drawer Content
          Centered vertically with space between items
          for a clean layout.
        */}
                <ul className='flex flex-col items-center justify-center flex-1 space-y-6 text-brandGray-50'>
                    {['Home', 'Projects', 'Contact'].map((item, idx) => (
                        <li
                            key={item}
                            className={`
                opacity-0
                translate-y-4
                transition-all
                duration-300
                delay-[${idx * 75}ms]
                ${isOpen ? 'opacity-100 translate-y-0' : ''}
              `}
                        >
                            {item}
                        </li>
                    ))}
                </ul>

                {/*
          If you pass children to the drawer,
          they get animated in a similar fade/slide style.
        */}
                {Children.map(children, (child, index) => (
                    <div
                        className={`
              transition-all duration-300 transform-gpu
              ${
                  isOpen
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
              }
            `}
                        style={{
                            transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>
        </>
    )
}
