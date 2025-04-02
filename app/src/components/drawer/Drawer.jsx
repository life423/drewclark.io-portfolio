/**
 * Enhanced mobile navigation drawer component
 * Optimized for cross-platform compatibility including iOS, Android, and Edge
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo, useState, lazy, Suspense } from 'react'
import { LuX, LuGamepad2 } from 'react-icons/lu'
import clsx from 'clsx'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

/**
 * Enhanced mobile navigation drawer component
 * Optimized for cross-platform compatibility including iOS, Android, and Edge
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo, useState, lazy, Suspense } from 'react'
import { LuX, LuGamepad2 } from 'react-icons/lu'
import clsx from 'clsx'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

/**
 * Enhanced mobile navigation drawer component
 * Optimized for cross-platform compatibility including iOS, Android, and Edge
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo, useState, lazy, Suspense } from 'react'
import { LuX, LuGamepad2 } from 'react-icons/lu'
import clsx from 'clsx'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

// Lazy load the Connect4Game component to avoid impacting initial load time
const Connect4Game = lazy(() => import('../games/connect4/Connect4Game'))

// Navigation links without icons for now
const navigationLinks = [
    { id: 'home', label: 'Home', href: '#' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'contact', label: 'Contact', href: '#contact' }
]

// Memoize the Drawer for performance
const Drawer = memo(function Drawer({ isOpen, onClose }) {
    const drawerRef = useRef(null)
    const closeButtonRef = useRef(null)
    const [showGame, setShowGame] = useState(false)

    // Use our enhanced hook to lock body scroll - this replaces the manual scroll locking
    useLockBodyScroll(isOpen)

    // Handle escape key press to close drawer
    const handleKeyDown = useCallback(
        e => {
            if (e.key === 'Escape') onClose()
        },
        [onClose]
    )

    // Manage focus and keyboard events - no longer handling scroll directly
    useEffect(() => {
        if (isOpen) {
            // Add keyboard listener
            document.addEventListener('keydown', handleKeyDown)

            // Focus the close button when drawer opens (for accessibility)
            if (closeButtonRef.current) {
                setTimeout(() => {
                    closeButtonRef.current.focus()
                }, 100)
            }
        } else {
            // Remove keyboard listener
            document.removeEventListener('keydown', handleKeyDown)
        }

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    // Return null when closed for better performance
    // But only do this after animation completes
    const [shouldRender, setShouldRender] = useState(isOpen)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
        } else {
            // Wait for animation to complete before not rendering
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 300) // Same as transition duration
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // Control the transform state for smooth sliding animation
    const [drawerPosition, setDrawerPosition] = useState(isOpen ? 'translate-x-0' : '-translate-x-full')

    useEffect(() => {
        if (isOpen) {
            // Render off-screen first
            setDrawerPosition('-translate-x-full')
            // Small delay to allow browser to register initial state
            const timer = setTimeout(() => {
                setDrawerPosition('translate-x-0')
            }, 10)
            return () => clearTimeout(timer)
        } else {
            // Animate closing immediately
            setDrawerPosition('-translate-x-full')
        }
    }, [isOpen])

    if (!shouldRender) return null

    return (
        <>
            {/* Dark overlay with accessibility attributes */}
            <div
                className={clsx(
                    'fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm transition-opacity duration-300',
                    isOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
                aria-hidden='true'
            />

            {/* Sliding Drawer with improved accessibility */}
            <div
                ref={drawerRef}
                role='dialog'
                aria-modal='true'
                aria-labelledby='drawer-title'
                aria-hidden={!isOpen}
                tabIndex={-1}
                className={clsx(
                    'fixed inset-y-0 left-0 z-[999]',
                    'w-[85vw] max-w-xs', // Mobile-first width
                    'flex flex-col',
                    'bg-gradient-to-b from-brandGray-900 to-brandGray-800',
                    'transition-transform duration-300 ease-in-out', // Changed to ease-in-out for balanced animation
                    'border-r border-brandGray-700/50',
                    drawerPosition // Use the controlled transform state
                )}
                style={{
                    willChange: 'transform',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
            >
                {/* Hidden title for screen readers */}
                <h2 id='drawer-title' className='sr-only'>
                    Navigation Menu
                </h2>

                {/* Drawer Header with Brand and Close Button */}
                <div className='flex items-center justify-between p-4 border-b border-brandGray-700/30'>
                    <div className='text-2xl font-extralight uppercase tracking-wider'>
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 to-brandBlue-400'>
                            DC
                        </span>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label='Close Menu'
                        className='p-2 text-brandGreen-300 hover:text-brandGreen-200 transition-colors
                                  focus:outline-none focus:ring-2 focus:ring-brandGreen-400 rounded-md'
                    >
                        <LuX className='h-6 w-6' />
                    </button>
                </div>

                {/* Welcome message */}
                <div className='px-6 py-4 text-brandGray-100/80 text-sm'>
                    <p>
                        
                        <span className='text-brandGreen-300'>Drew Clark</span>
                    </p>
                    <p className='mt-1 text-xs text-brandGray-300'>
                        Software Engineer
                    </p>
                </div>

                {/* Scrollable Navigation content */}
                <div className='flex-1 overflow-y-auto overscroll-contain'>
                    <nav aria-label='Mobile navigation' className='px-4 pb-20'>
                        <ul className='flex flex-col space-y-3 mt-4'>
                            {navigationLinks.map((item, index) => (
                                <li
                                    key={item.id}
                                    className='opacity-0'
                                    style={{
                                        animation: isOpen
                                            ? 'fadeIn 0.3s ease-out forwards'
                                            : 'none',
                                        animationDelay: isOpen
                                            ? `${index * 80 + 50}ms`
                                            : '0ms'
                                    }}
                                >
                                    <a
                                        href={item.href}
                                        onClick={onClose}
                                        className='flex items-center px-4 py-3 text-white hover:bg-brandGray-700/40
                                                hover:text-brandGreen-300 transition-colors rounded-md'
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Connect 4 Game Section */}
                    <div className="mt-6 px-4">
                        <button 
                            onClick={() => setShowGame(!showGame)}
                            className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-brandGray-700/40 hover:text-brandGreen-300 transition-colors rounded-md"
                            aria-expanded={showGame}
                        >
                            <span className="flex items-center gap-2">
                                <LuGamepad2 className="w-5 h-5 text-brandGreen-400" />
                                <span>Connect 4 Challenge</span>
                            </span>
                            <span className={`transform transition-transform duration-300 ${showGame ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        
                        {showGame && (
                            <div className="mt-3 pb-4 animate-fade-in">
                                <Suspense fallback={
                                    <div className="p-4 text-center text-sm text-brandGray-300 bg-brandGray-800 rounded-lg border border-brandGray-700">
                                        <div className="flex justify-center items-center h-12 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-brandGreen-500 animate-pulse mr-1" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-brandGreen-500 animate-pulse mx-1" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-brandGreen-500 animate-pulse ml-1" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <span>Loading AI-powered game...</span>
                                    </div>
                                }>
                                    <Connect4Game />
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Call to action */}
                <div className='sticky bottom-0 px-4 py-4 border-t border-brandGray-700/30 bg-gradient-to-b from-brandGray-800 to-brandGray-900'>
                    <a
                        href='#contact'
                        onClick={onClose}
                        className='block w-full py-2 px-4 bg-brandGreen-500 hover:bg-brandGreen-600
                                 text-white text-center rounded-md transition-colors'
                        style={{
                            paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))'
                        }}
                    >
                        Get in touch
                    </a>
                </div>
            </div>
        </>
    )
})

export default Drawer
