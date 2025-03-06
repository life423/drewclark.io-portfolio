/**
 * Optimized mobile navigation drawer component
 * Improved with React.memo, proper focus management, and animation optimizations
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo } from 'react'
import { LuX } from 'react-icons/lu'
import clsx from 'clsx'

const navigationLinks = [
    { id: 'home', label: 'Home', href: '#' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'contact', label: 'Contact', href: '#contact' }
]

// Memoize the Drawer for performance
const Drawer = memo(function Drawer({ isOpen, onClose }) {
    const drawerRef = useRef(null)
    const closeButtonRef = useRef(null)
    
    // Handle escape key press to close drawer
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])
    
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
    // This helps with initial page load performance
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
                aria-labelledby="drawer-title"
                aria-hidden={!isOpen}
                tabIndex={-1}
                className={clsx(
                    'fixed top-0 left-0 h-screen w-[75%] max-w-sm z-[999] flex flex-col',
                    'bg-brandGray-800/80 backdrop-blur-md',
                    'transition-transform duration-300 ease-in-out',
                    isOpen
                        ? 'translate-x-0 delay-75'
                        : '-translate-x-full delay-0'
                )}
            >
                {/* Hidden title for screen readers */}
                <h2 id="drawer-title" className="sr-only">Navigation Menu</h2>
                
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 p-2 outline-none focus:outline-none focus:ring-2 focus:ring-brandGreen-400'
                >
                    <LuX className='h-8 w-8 text-brandGreen-300 transition-colors hover:text-brandGreen-200' />
                </button>

                <nav aria-label="Mobile navigation">
                    <ul className='flex flex-col items-center justify-center flex-1 space-y-6 text-white font-medium'>
                        {navigationLinks.map((item, index) => (
                            <li
                                key={item.id}
                                className={clsx(
                                    'cursor-pointer hover:text-brandGreen-300 transition-all duration-300',
                                    !isOpen && 'opacity-0 pointer-events-none', // if closed, hide link 
                                    isOpen && 'animate-drawer-link-pop' // apply custom animation
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
                                    className="px-3 py-2 block w-full text-center"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    )
})

export default Drawer
