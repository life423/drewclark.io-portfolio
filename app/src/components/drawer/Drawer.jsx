/**
 * Enhanced mobile navigation drawer component
 * Improved with React.memo, proper focus management, and animation optimizations
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo } from 'react'
import { LuX } from 'react-icons/lu'
import clsx from 'clsx'

// Simpler navigation links without icons for now
const navigationLinks = [
    { id: 'home', label: 'Home', href: '#' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'contact', label: 'Contact', href: '#contact' },
]

// Memoize the Drawer for performance
const Drawer = memo(function Drawer({ isOpen, onClose }) {
    const drawerRef = useRef(null)
    const closeButtonRef = useRef(null)

    // Handle escape key press to close drawer
    const handleKeyDown = useCallback(
        e => {
            if (e.key === 'Escape') onClose()
        },
        [onClose]
    )

    // Manage body scroll and keyboard events
    useEffect(() => {
        if (isOpen) {
            // Lock scroll when drawer is open
            document.body.style.overflow = 'hidden'

            // Add keyboard listener
            document.addEventListener('keydown', handleKeyDown)

            // Focus the close button when drawer opens (for accessibility)
            if (closeButtonRef.current) {
                setTimeout(() => {
                    closeButtonRef.current.focus()
                }, 100)
            }
        } else {
            // Restore scroll when drawer is closed
            document.body.style.overflow = ''

            // Remove keyboard listener
            document.removeEventListener('keydown', handleKeyDown)
        }

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    // Performance optimization - don't render anything if drawer state is closed and was never opened
    if (!isOpen && !drawerRef.current) return null

    return (
        <>
            {/* Dark overlay with accessibility attributes */}
            <div
                className={clsx(
                    'fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
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
                    'fixed top-0 left-0 h-screen w-[75%] max-w-sm z-[999] flex flex-col',
                    'bg-gradient-to-b from-brandGray-900 to-brandGray-800 backdrop-blur-md',
                    'transition-transform duration-300 ease-in-out border-r border-brandGray-700/50',
                    isOpen
                        ? 'translate-x-0 delay-75'
                        : '-translate-x-full delay-0'
                )}
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
                        Hello, I'm{' '}
                        <span className='text-brandGreen-300'>Drew Clark</span>
                    </p>
                    <p className='mt-1 text-xs text-brandGray-300'>
                        Software Engineer
                    </p>
                </div>

                {/* Navigation content */}
                <nav
                    aria-label='Mobile navigation'
                    className='flex-1 px-4 pb-6'
                >
                    <ul className='flex flex-col space-y-3 mt-4'>
                        {navigationLinks.map((item, index) => (
                            <li
                                key={item.id}
                                className={clsx(
                                    'transition-all duration-300 rounded-md overflow-hidden',
                                    !isOpen && 'opacity-0 pointer-events-none',
                                    isOpen && 'animate-drawer-link-pop' // Using your existing animation
                                )}
                                style={{
                                    animationDelay: isOpen
                                        ? `${index * 120}ms`
                                        : '0ms',
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

                {/* Footer - Call to action */}
                <div className='mt-auto px-4 py-6 border-t border-brandGray-700/30'>
                    <a
                        href='#contact'
                        onClick={onClose}
                        className='block w-full py-2 px-4 bg-brandGreen-500 hover:bg-brandGreen-600 
                                 text-white text-center rounded-md transition-colors'
                    >
                        Get in touch
                    </a>
                </div>
            </div>
        </>
    )
})

export default Drawer
