// FILE: app/src/components/drawer/Drawer.jsx
import React, { useEffect, useRef } from 'react'
import { LuX } from 'react-icons/lu'
import clsx from 'clsx'

export default function Drawer({ isOpen, onClose }) {
    const drawerRef = useRef(null)

    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', onKey)
            document.body.style.overflow = 'hidden'
        } else {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    return (
        <>
            {/* Dark overlay */}
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

            {/* Sliding Drawer */}
            <div
                ref={drawerRef}
                role='dialog'
                aria-modal='true'
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
                <button
                    onClick={onClose}
                    aria-label='Close Menu'
                    className='ml-auto mt-4 mr-4 p-2 outline-none focus:outline-none'
                >
                    <LuX className='h-8 w-8 text-brandGreen-300 transition-colors hover:text-brandGreen-200' />
                </button>

                <ul className='flex flex-col items-center justify-center flex-1 space-y-6 text-white font-medium'>
                    {['Home', 'Projects', 'Contact'].map((item, index) => (
                        <li
                            key={item}
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
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}
