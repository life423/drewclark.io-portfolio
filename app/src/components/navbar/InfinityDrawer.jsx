// app/src/components/navbar/InfinityDrawer.jsx
import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function InfinityDrawer({ isOpen, onClose, children }) {
    const drawerRef = useRef(null)
    const lastFocusedElementRef = useRef(null)

    // Handle ESC key to close
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            // Focus trap: store last focused element
            lastFocusedElementRef.current = document.activeElement

            // Lock body scroll
            document.body.style.overflow = 'hidden'
            // Listen for ESC
            document.addEventListener('keydown', handleKeyDown)

            // Auto-focus the drawer
            if (drawerRef.current) {
                drawerRef.current.focus()
            }
        } else {
            // Cleanup
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)
            // Return focus to last element
            if (lastFocusedElementRef.current) {
                lastFocusedElementRef.current.focus()
            }
        }

        return () => {
            // Cleanup if unmount
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    return (
        <>
            {/* Overlay */}
            <div
                className={`
          fixed inset-0 z-40 bg-black/50
          transition-opacity duration-300
          ${
              isOpen
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
          }
        `}
                aria-hidden='true'
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                role='dialog'
                aria-modal='true'
                aria-hidden={!isOpen}
                tabIndex={-1}
                ref={drawerRef}
                className={`
          fixed top-0 left-0 h-full z-50
          bg-brandGray-800 text-white shadow-lg
          w-[80%] max-w-sm  /* 80% wide, or go w-full if you want 100% */
          transition-transform duration-300
          flex flex-col
          outline-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Close Button w/ an X Icon */}
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 text-white hover:text-gray-200 transition'
                >
                    <XMarkIcon className='h-6 w-6' />
                </button>

                {/* Drawer Content */}
                <div className='p-6 overflow-y-auto flex-1'>{children}</div>
            </div>
        </>
    )
}
