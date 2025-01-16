// src/components/navbar/InfinityDrawer.jsx
import React, { useRef, useEffect, useCallback } from 'react'

export default function InfinityDrawer({ isOpen, onClose, children }) {
    const drawerRef = useRef(null)
    const lastFocusedElementRef = useRef(null)

    const handleKeyDown = useCallback(
        event => {
            if (event.key === 'Escape') {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        if (isOpen) {
            lastFocusedElementRef.current = document.activeElement
            if (drawerRef.current) {
                drawerRef.current.focus()
            }
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.removeEventListener('keydown', handleKeyDown)
            if (lastFocusedElementRef.current) {
                lastFocusedElementRef.current.focus()
            }
            document.body.style.overflow = ''
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    return (
        <>
            {/* Overlay behind the drawer */}
            <div
                className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${
              isOpen
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
          }
        `}
                onClick={onClose}
                aria-hidden='true'
            />

            {/* Drawer panel */}
            <div
                role='dialog'
                aria-modal='true'
                aria-hidden={!isOpen}
                className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-brandGray-800 text-white shadow-xl
          transition-transform duration-300
          flex flex-col
          outline-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
                tabIndex={-1}
                ref={drawerRef}
            >
                <button
                    className='ml-auto mt-4 mr-4 text-white text-2xl bg-transparent border-none'
                    onClick={onClose}
                    aria-label='Close Menu'
                >
                    ✕
                </button>

                <div className='p-4 overflow-y-auto'>{children}</div>
            </div>
        </>
    )
}
