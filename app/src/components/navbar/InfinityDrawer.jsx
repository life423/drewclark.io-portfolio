// app/src/components/navbar/InfinityDrawer.jsx
import React, { useRef, useEffect, useCallback, useState } from 'react'

export default function InfinityDrawer({ isOpen, onClose, children }) {
    const [animState, setAnimState] = useState('')
    // e.g. '' or 'flipOpen' or 'flipClose'
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
            // If we’re OPENING the drawer, set animation to flipOpen
            setAnimState('flipOpen')

            lastFocusedElementRef.current = document.activeElement
            if (drawerRef.current) drawerRef.current.focus()
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            // If we’re CLOSING the drawer, run flipClose
            setAnimState('flipClose')
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

    function handleAnimationEnd() {
        // If animState === 'flipClose', you could unmount or do more logic if needed
    }

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
                onClick={onClose}
                aria-hidden='true'
            />

            {/* 3D Flip Panel */}
            <div
                role='dialog'
                aria-modal='true'
                aria-hidden={!isOpen}
                tabIndex={-1}
                ref={drawerRef}
                onAnimationEnd={handleAnimationEnd}
                className={`
          fixed top-0 left-0 h-full z-50
          bg-brandGray-800 text-white
          shadow-lg
          outline-none
          w-full  /* Covers entire screen: no leftover white space */
          flex flex-col
          ${animState === 'flipOpen' ? 'animate-flipOpen' : ''}
          ${animState === 'flipClose' ? 'animate-flipClose' : ''}
          ${!isOpen && animState !== 'flipClose' ? 'hidden' : ''}
        `}
                style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'left center', // hinge
                    backfaceVisibility: 'hidden',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 text-white text-2xl bg-transparent border-none'
                >
                    ×
                </button>

                <div className='p-6 overflow-y-auto flex-1'>{children}</div>
            </div>
        </>
    )
}
