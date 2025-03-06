// FILE: app/src/components/drawer/DrawerContent.jsx
import React, { Children } from 'react'
import clsx from 'clsx'
import { LuX } from 'react-icons/lu'

function DrawerContent({ isOpen, onClose, children, drawerRef }) {
    return (
        <div
            role='dialog'
            aria-modal='true'
            aria-hidden={!isOpen}
            ref={drawerRef}
            tabIndex={-1}
            className={clsx(
                'fixed top-0 left-0 h-screen w-[70%] max-w-sm z-70 flex flex-col transition-transform duration-300 backdrop-blur-md bg-gradient-to-br from-brandBlue-900/95 to-brandGray-900/95 border-gradient-to-r from-neonOrange-500 to-brandBlue-500 outline-none',
                { 'translate-x-0': isOpen, '-translate-x-full': !isOpen }
            )}
        >
            <button
                onClick={e => {
                    e.stopPropagation()
                    console.log('Close button clicked')
                    onClose()
                }}
                aria-label='Close Menu'
                className='ml-auto mt-4 mr-4 outline-none focus:outline-none'
            >
                <LuX className='h-10 w-10 text-neonOrange-400 hover:text-neonOrange-300 transition-colors' />
            </button>

            <ul className='flex flex-col items-center justify-center flex-1 space-y-6'>
                {['Home', 'Projects', 'Contact'].map((item, idx) => (
                    <li
                        key={item}
                        className={clsx(
                            'opacity-0 translate-y-4 transition-all duration-300 text-brandGreen-500 cursor-pointer nav-link-hover text-lg font-medium',
                            { 'opacity-100 translate-y-0': isOpen },
                            `delay-[${idx * 75}ms]`,
                            isOpen && 'animate-drawer-link-pop'
                        )}
                        style={{
                            animationDelay: `${300 + idx * 100}ms`
                        }}
                    >
                        {item}
                    </li>
                ))}
            </ul>

            {Children.map(children, (child, index) => (
                <div
                    key={index}
                    className={clsx(
                        'transition-all duration-300 transform-gpu',
                        {
                            'opacity-100 translate-y-0': isOpen,
                            'opacity-0 translate-y-2': !isOpen,
                        }
                    )}
                    style={{
                        transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}

export default DrawerContent
