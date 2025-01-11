// src/components/NavBar.jsx
import React from 'react'
// In Navbar.jsx
import useScrollPosition from '../../hooks/useScrollPosition'

export default function NavBar() {
    const scrollY = useScrollPosition()

    // Decide if nav is scrolled enough to blur
    const SCROLL_THRESHOLD = 50
    const isScrolled = scrollY > SCROLL_THRESHOLD

    return (
        <nav
            className={`
        fixed top-0 w-full h-16 flex items-center justify-between
        px-4 transition-colors duration-300 z-50
        ${
            isScrolled
                ? 'bg-brandGray-800/70 backdrop-blur-md'
                : 'bg-brandBlue-900'
        }
      `}
        >
            {/* Left icon / brand logo */}
            <div className='text-xl font-bold text-white'>MyBrand</div>

            {/* Right side: hamburger or nav links */}
            <div className='text-white'>
                {/* For now, just a placeholder for hamburger or links */}
                Menu
            </div>
        </nav>
    )
}
