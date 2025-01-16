// app/src/components/navbar/Navbar.jsx
import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import useScrollPosition from '../../hooks/useScrollPosition'
import InfinityDrawer from './InfinityDrawer'

export default function NavBar({ drawerOpen, setDrawerOpen }) {
    const scrollY = useScrollPosition()
    const isScrolled = scrollY > 50



    return (
        <nav
            className={`
        fixed top-0 w-full h-16 px-4 flex items-center justify-between
        transition-colors duration-300
        z-50
        ${
            isScrolled
                ? 'bg-brandGray-800/70 backdrop-blur-md'
                : 'bg-transparent'
        }
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
            <InfinityDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
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
