// FILE: app/src/components/navbar/Navbar.jsx
import React from 'react'
import { LuMenu } from 'react-icons/lu'
import clsx from 'clsx'
import useScrollPosition from '../../hooks/useScrollPosition'
import Drawer from '../drawer/Drawer'

export default function NavBar({ drawerOpen, openDrawer, closeDrawer }) {
    const scrollY = useScrollPosition()
    const isScrolled = scrollY > 50

    const bgClasses = clsx({
        'bg-brandGray-800/60': isScrolled,
        'bg-brandGray-800/90 backdrop-blur-md': !isScrolled,
    })

    return (
        <nav
            className={clsx(
                'fixed top-0 w-full h-16 px-4',
                'flex items-center justify-between',
                'transition-colors duration-300',
                'z-50',
                bgClasses
            )}
        >
            <div
                className={clsx(
                    'text-2xl',
                    'font-extralight',
                    'uppercase',
                    'tracking-wide',
                    'bg-clip-text',
                    'text-transparent',
                    'bg-gradient-to-r',
                    'from-brandGreen-300',
                    'to-brandBlue-400'
                )}
            >
                DC
            </div>

            <button
                className='md:hidden hover:text-gray-200 transition'
                aria-label='Open Menu'
                onClick={openDrawer}
            >
                <LuMenu className='h-10 w-10 text-brandGreen-300 stroke-current' />
            </button>

            <ul className='hidden md:flex space-x-6 text-white'>
                <li>Home</li>
                <li>Projects</li>
                <li>Contact</li>
            </ul>

            <Drawer isOpen={drawerOpen} onClose={closeDrawer} />
        </nav>
    )
}
