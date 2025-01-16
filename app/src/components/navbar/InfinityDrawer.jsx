// src/components/navbar/InfinityDrawer.jsx
import React, { useRef, useEffect, useCallback } from 'react'

export default function InfinityDrawer({ isOpen, onClose, children }) {
    const drawerRef = useRef(null)

    // Close on 'Escape' key
    const handleKeyDown = useCallback(
        e => {
            if (e.key === 'Escape') {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        if (isOpen) {
            // Trap focus when open
            const drawerElement = drawerRef.current
            if (drawerElement) {
                drawerElement.focus()
            }

            document.addEventListener('keydown', handleKeyDown)
        } else {
            document.removeEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    return (
        <div
            // ARIA & Dialog semantics
            role='dialog'
            aria-modal='true'
            aria-hidden={!isOpen}
            className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 
        bg-brandGray-800 text-white shadow-lg 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      `}
            // Focus the drawer container itself
            tabIndex='-1'
            ref={drawerRef}
        >
            {/* Close Button */}
            <button
                className='absolute top-4 right-4 text-white'
                onClick={onClose}
            >
                Close
            </button>

            {/* Drawer content (nav links, etc.) */}
            <nav className='mt-12 p-4 space-y-4'>{children}</nav>
        </div>
    )
}
