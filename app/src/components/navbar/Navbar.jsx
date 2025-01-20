// app/src/components/navbar/NavBar.jsx
import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import useScrollPosition from '../../hooks/useScrollPosition'
import InfinityDrawer from './InfinityDrawer'

export default function NavBar({ drawerOpen, setDrawerOpen, closeDrawer }) {
    const scrollY = useScrollPosition()
    const isScrolled = scrollY > 50

    const bgClasses = (() => {
        if (isScrolled && !drawerOpen) {
            // Scrolled & Drawer closed -> dark + strong blur
            return 'bg-brandGray-800/70 backdrop-blur-md'
        } else if (isScrolled && drawerOpen) {
            // Scrolled & Drawer open -> maybe fully transparent so the overlay is visible
            return 'bg-transparent'
        } else {
            // Not scrolled (drawerOpen or not)
            return 'bg-transparent'
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
            <div className='text-xl font-bold text-white'>MyBrand</div>

            {/* Hamburger button to open the drawer */}
            <button
                className='md:hidden text-white hover:text-gray-200 transition'
                aria-label='Open Menu'
                onClick={() => setDrawerOpen(true)}
            >
                <Bars3Icon className='h-6 w-6' />
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
