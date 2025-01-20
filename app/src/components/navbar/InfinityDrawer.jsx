// app/src/components/navbar/InfinityDrawer.jsx
import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function InfinityDrawer({
    isOpen,
    onClose,
    children,
}) {
    const drawerRef = useRef(null)
    const lastFocusedRef = useRef(null)

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            // Lock scroll, listen for ESC
            lastFocusedRef.current = document.activeElement
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleKeyDown)

            // Focus the drawer container
            drawerRef.current?.focus()
        } else {
            // Unlock scroll, remove ESC
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
            {/* Overlay */}
            <div
                className={`
          fixed inset-0 z-60
          bg-gradient-to-br from-brandGreen-700/20 to-brandGreen-500/20
          transition-opacity duration-300
          backdrop-blur-md
          ${
              isOpen
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
          }
        `}
                onClick={onClose}
                aria-hidden='true'
            />

            {/* Drawer Panel */}
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
          transition-transform duration-300
          z-70 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 text-white hover:text-gray-300'
                >
                    <XMarkIcon className='h-6 w-6' />
                </button>

                <div className='p-6 overflow-y-auto flex-1'>{children}</div>
            </div>
        </>
    )
}
