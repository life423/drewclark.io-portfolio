import React, { useEffect, useRef, Children } from 'react'
// import { XMarkIcon } from '@heroicons/react/24/outline'
import { LuX } from 'react-icons/lu'

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
            lastFocusedRef.current = document.activeElement

            document.body.style.overflow = 'hidden'

            document.addEventListener('keydown', handleKeyDown)

            drawerRef.current?.focus()
        } else {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)

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
            {}
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

            {}
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
           border-gradient-to-b from-brandGreen-400 to-brandBlue-400
          outline-none focus:outline-none
        `}
            >
                {}
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 outline-none focus:outline-none'
                >
                    <LuX className='h-10 w-10  text-brandGreen-300 hover:text-brandGreen-300 transition-colors' />
                </button>

                {}
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

                {}
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
