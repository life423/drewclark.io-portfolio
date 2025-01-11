import React, { useState } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function NavBar() {
    const scrollY = useScrollPosition()
    const isScrolled = scrollY > 50
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav
            className={`
                fixed top-0 w-full h-16 px-4 flex items-center justify-between z-50
                transition-colors duration-300
                ${
                    isScrolled
                        ? 'bg-brandGray-800/70 backdrop-blur-md'
                        : 'bg-transparent'
                }
            `}
        >
            <div className='text-xl font-bold text-white'>MyBrand</div>

            <button
                className='text-white md:hidden'
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {/* Use Bars3Icon instead of MenuIcon */}
                <Bars3Icon className='h-6 w-6' />
            </button>

            <ul className='hidden md:flex space-x-6 text-white'>
                <li>Home</li>
                <li>Projects</li>
                <li>Contact</li>
            </ul>

            {menuOpen && (
                <div className='absolute top-16 right-0 w-40 bg-brandGray-800 text-white md:hidden'>
                    <ul className='flex flex-col space-y-2 p-4'>
                        <li>Home</li>
                        <li>Projects</li>
                        <li>Contact</li>
                    </ul>
                </div>
            )}
        </nav>
    )
}
