/**
 * Enhanced mobile navigation drawer component
 * Optimized for cross-platform compatibility including iOS, Android, and Edge
 * Follows accessibility best practices for modal dialogs
 */
import React, { useEffect, useRef, useCallback, memo, useState } from 'react'
import { LuX, LuMail } from 'react-icons/lu'
import clsx from 'clsx'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import EmailContactModal from './EmailContactModal'

// Suggested questions for AI assistant (removed navigationLinks as requested)

// Suggested questions for AI assistant
const suggestedQuestions = [
    { id: 'site-built', icon: '🔎', question: 'How was this site built?' },
    { id: 'ai-project', icon: '🪴', question: 'What project uses AI?' },
    { id: 'coolest-design', icon: '👾', question: 'Which project has the coolest design?' }
]

// Memoize the Drawer for performance
const Drawer = memo(function Drawer({ isOpen, onClose }) {
    const drawerRef = useRef(null)
    const closeButtonRef = useRef(null)
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)

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
                inert={true}
            />

            {/* Sliding Drawer with improved accessibility */}
            <div
                ref={drawerRef}
                role='dialog'
                aria-modal='true'
                aria-labelledby='drawer-title'
                inert={!isOpen}
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

                    {/* Main Drawer Content - Ask the Portfolio */}
                <div className='flex-1 overflow-y-auto overscroll-contain'>
                    <div className='mt-2 px-4 pb-20'>
                        <div 
                            className='p-3 rounded-lg border border-brandGray-700/50 bg-brandGray-800/30'
                            style={{
                                animation: isOpen ? 'fadeIn 0.4s ease-out forwards' : 'none',
                                animationDelay: isOpen ? '280ms' : '0ms',
                                opacity: 0
                            }}
                        >
                            <h3 className='text-sm font-medium text-brandGreen-300 flex items-center mb-3'>
                                <span className='mr-2 text-lg'>💬</span>
                                Ask the Portfolio
                            </h3>
                            
                            <p className='text-xs text-brandGray-300 mb-3'>
                                Get quick answers about my projects and skills
                            </p>
                            
                            <ul className='space-y-2'>
                                {suggestedQuestions.map((item, index) => (
                                    <li key={item.id}>
                                        <button
                                            className='block w-full text-left px-3 py-2 text-sm text-white bg-brandGray-700/50 hover:bg-brandGray-700 
                                                      rounded-md transition-colors border border-brandGray-600/30'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Store the question in sessionStorage for UnifiedProjectChat to pick up
                                                sessionStorage.setItem('drawer_question', item.question);
                                                sessionStorage.setItem('drawer_question_timestamp', Date.now().toString());
                                                
                                                // Close the drawer
                                                onClose();
                                                
                                                // Wait for drawer close animation, then scroll
                                                setTimeout(() => {
                                                    const projectsSection = document.querySelector('#projects');
                                                    if (projectsSection) {
                                                        projectsSection.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }, 350); // Slightly longer than the drawer transition
                                            }}
                                        >
                                            <span className='mr-2'>{item.icon}</span>
                                            {item.question}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className='mt-3'>
                                <a
                                    href='#projects'
                                    className='flex items-center justify-center text-xs text-brandGreen-400 hover:text-brandGreen-300'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                    }}
                                >
                                    <span>Or ask your own question in the chat below</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Call to action */}
                <div className='sticky bottom-0 px-4 py-4 border-t border-brandGray-700/30 bg-gradient-to-b from-brandGray-800 to-brandGray-900'>
                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        className='block w-full py-2 px-4 bg-brandGreen-500 hover:bg-brandGreen-600
                                 text-white text-center rounded-md transition-colors flex items-center justify-center'
                        style={{
                            paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))'
                        }}
                    >
                        <LuMail className="w-4 h-4 mr-2" />
                        Get in touch
                    </button>
                </div>
                
                {/* Email Contact Modal */}
                <EmailContactModal 
                    isOpen={isContactModalOpen} 
                    onClose={() => {
                        setIsContactModalOpen(false);
                        // Optional - can also close drawer when modal is closed
                        // onClose();
                    }} 
                />
            </div>
        </>
    )
})

export default Drawer
