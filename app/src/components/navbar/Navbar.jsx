// FILE: app/src/components/navbar/Navbar.jsx
import React from 'react'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'

export default function Navbar({ drawerOpen, toggleDrawer }) {
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

      {/* Enhanced tactile menu button for mobile */}
      <button
        className="md:hidden relative flex items-center justify-center 
                 min-w-[44px] min-h-[44px] px-3 py-2 rounded-full
                 bg-gradient-to-b from-brandGray-700/90 to-brandGray-800
                 border border-brandGray-600/30
                 shadow-sm hover:shadow-md
                 hover:border-brandGreen-500/20 hover:bg-brandGray-700
                 active:scale-90 active:shadow-inner active:bg-brandGray-800
                 active:border-brandGreen-500/40
                 group
                 transition-all duration-200"
        aria-label="Open Menu"
        onClick={handleMenuClick}
      >
        {/* Pulse effect ring - now using group-hover */}
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                       bg-brandGreen-500/10 animate-pulse-slow pointer-events-none
                       transition-opacity duration-300"></span>
        
        <LuMenu className="h-6 w-6 text-brandGreen-400 group-hover:text-brandGreen-300
                         transition-colors duration-200" />
        <span className="sr-only">Menu</span>
      </button>

      {/* Desktop Nav */}
      <ul className="hidden md:flex space-x-8 font-medium">
        <li className="cursor-pointer text-brandGreen-500 nav-link-hover">
          <a href="#" className="hover:text-brandGreen-400 transition-colors">Home</a>
        </li>
        <li className="cursor-pointer text-brandGreen-500 nav-link-hover">
          <a href="https://github.com/life423" target="_blank" rel="noopener noreferrer" className="hover:text-brandGreen-400 transition-colors">GitHub</a>
        </li>
      </ul>

    </nav>
  )
}
