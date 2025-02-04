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
            {/* ---------------------------------------------
                 Overlay (dim + blur) 
                 - fades in/out based on isOpen
               --------------------------------------------- */}
            <div
                className={`
                    fixed inset-0 z-60
                    bg-gradient-to-br from-brandGreen-700/20 to-brandGreen-500/20
                    backdrop-blur-md
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

            {/* ---------------------------------------------
                 Drawer Panel
               --------------------------------------------- */}
            <div
                role='dialog'
                aria-modal='true'
                aria-hidden={!isOpen}
                ref={drawerRef}
                tabIndex={-1}
                className={`
                    fixed top-0 left-0 h-screen
                    w-[70%] max-w-sm
                    bg-brandGray-800 text-white shadow-lg
                    z-70 flex flex-col
                    outline-none focus:outline-none ring-0 focus:ring-0

                    /* Transition + transform for micro-animations */
                    transition-all duration-300 transform-gpu
                    ${
                        isOpen
                            ? 'translate-x-0 scale-100 opacity-100'
                            : '-translate-x-full scale-95 opacity-0'
                    }
                `}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 text-white hover:text-gray-300
                               outline-none focus:outline-none'
                >
                    <XMarkIcon className='h-6 w-6' />
                </button>

                {/* 
                  Main Content 
                  We wrap each child in a small fade/slide-in 
                  with staggered delays
                */}
                <div
                    className='
                        flex-1
                        flex
                        flex-col
                        justify-center
                        items-center
                        gap-6 /* space out the drawer items */
                        px-6 /* horizontal padding */
                        py-4 /* vertical padding */
                        overflow-y-auto
                        outline-none focus:outline-none
                    '
                >
                    {Children.map(children, (child, index) => (
                        <div
                            // Transition each child in
                            className={`
                                transition-all duration-300 transform-gpu
                                ${
                                    isOpen
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-2'
                                }
                            `}
                            style={{
                                transitionDelay: isOpen
                                    ? `${index * 50}ms`
                                    : '0ms',
                            }}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
