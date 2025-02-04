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
            return 'bg-brandGray-800/70 backdrop-blur-md'
        } else if (isScrolled && drawerOpen) {
            // Scrolled & Drawer open -> transparent so overlay is visible
            return 'bg-brandGray-700/50'
        } else {
            // Not scrolled
            return 'bg-brandGray-700/50'
        }
    })()

    return (
        <nav
            className={`
                fixed top-0 w-full h-16 px-4 flex items-center justify-between
                transition-colors duration-300
                z-50
                ${bgClasses}
            `}
        >
            {/* DC Logo: Thinner + Subtle Analogous Gradient */}
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

            {/* Larger Hamburger Icon for Mobile */}
            <button
                className='md:hidden text-white hover:text-gray-200 transition'
                aria-label='Open Menu'
                onClick={() => setDrawerOpen(true)}
            >
                <Bars3Icon className='h-8 w-8' />
            </button>

            {/* Desktop Nav (hidden on mobile) */}
            <ul className='hidden md:flex space-x-6 text-white'>
                <li>Home</li>
                <li>Projects</li>
                <li>Contact</li>
            </ul>

            {/* InfinityDrawer for mobile */}
            <InfinityDrawer isOpen={drawerOpen} onClose={closeDrawer}>
                <ul className='space-y-2'>
                    <li>
                        <a href='#home' onClick={() => setDrawerOpen(false)}>
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            href='#projects'
                            onClick={() => setDrawerOpen(false)}
                        >
                            Projects
                        </a>
                    </li>
                    <li>
                        <a href='#contact' onClick={() => setDrawerOpen(false)}>
                            Contact
                        </a>
                    </li>
                </ul>
            </InfinityDrawer>
        </nav>
    )
}
