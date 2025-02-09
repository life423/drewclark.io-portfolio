// app/src/components/navbar/NavBar.jsx

import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import useScrollPosition from '../../hooks/useScrollPosition'
import InfinityDrawer from './InfinityDrawer'

export default function NavBar({ drawerOpen, setDrawerOpen, closeDrawer }) {
    const scrollY = useScrollPosition()
    const isScrolled = scrollY > 50

    // Background logic on scroll/drawer
    const bgClasses = (() => {
        if (isScrolled && !drawerOpen) {
            // Scrolled & Drawer closed -> dark + slight blur
            return 'bg-brandGray-800/60 backdrop-blur-md'
        } else if (isScrolled && drawerOpen) {
            // Scrolled & Drawer open -> brandGray-700/50
            return 'bg-brandGray-800/70'
        } else {
            // Not scrolled
            return 'bg-brandGray-800/30'
        }
    })()

    return (
        <nav
            className={`
                fixed top-0 w-full h-16 px-4
                flex items-center justify-between
                transition-colors duration-300
                z-50
                ${bgClasses}
            `}
        >
            {/* DC Logo: Thinner + Subtle Gradient */}
            <div
                className='
                    text-2xl 
                    font-extralight
                    uppercase
                    tracking-wide
                    bg-clip-text 
                    text-transparent
                    bg-gradient-to-r
                    from-brandGreen-300
                    to-brandBlue-400
                '
            >
                DC
            </div>

           
            <button
                className='md:hidden hover:text-gray-200 transition'
                aria-label='Open Menu'
                onClick={() => setDrawerOpen(true)}
            >
                <Bars3Icon
                    className='
                        h-8 w-8
                        text-brandGreen-300
                        stroke-current
                    '
                    strokeWidth={1.5}
                />
            </button>

            {/* Desktop Nav (hidden on mobile) */}
            <ul className='hidden md:flex space-x-6 text-white'>
                <li>Home</li>
                <li>Projects</li>
                <li>Contact</li>
            </ul>

            {/* InfinityDrawer for mobile */}
            <InfinityDrawer isOpen={drawerOpen} onClose={closeDrawer}/>

        </nav>
    )
}
