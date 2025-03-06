// FILE: app/src/components/navbar/Navbar.jsx
import React from 'react'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'

export default function NavBar({ drawerOpen, toggleDrawer }) {
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 50
  
  function handleMenuClick() {
    toggleDrawer()
  }

  return (
    <nav
      className={clsx(
        'fixed top-0 w-full h-16 px-4 flex items-center justify-between z-50',
        'transition-all duration-300 ease-in-out',
        isScrolled
          ? 'bg-brandGray-800/80 backdrop-blur-md'
          : 'bg-brandGray-900/60 backdrop-blur',
        drawerOpen ? '-translate-y-[64px]' : 'translate-y-0'
      )}
    >
      {/* LOGO */}
      <div className="text-2xl font-extralight uppercase tracking-wider">
        {/* Gradient text for brand accent */}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 to-brandBlue-400">
          DC
        </span>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="md:hidden nav-link-hover"
        aria-label="Open Menu"
        onClick={handleMenuClick}
      >
        <LuMenu className="h-8 w-8 text-brandGreen-500" />
      </button>

      {/* Desktop Nav */}
      <ul className="hidden md:flex space-x-8 font-medium">
        <li className="cursor-pointer text-brandGreen-500 nav-link-hover">Home</li>
        <li className="cursor-pointer text-brandGreen-500 nav-link-hover">Projects</li>
        <li className="cursor-pointer text-brandGreen-500 nav-link-hover">Contact</li>
      </ul>

    </nav>
  )
}
