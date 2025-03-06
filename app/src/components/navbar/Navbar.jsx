// FILE: app/src/components/navbar/Navbar.jsx
import React from 'react'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'
import Drawer from '../drawer/Drawer'

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
        'transition-colors duration-300',
        isScrolled
          ? 'bg-brandGray-800/80 backdrop-blur-md'
          : 'bg-brandGray-900/60 backdrop-blur'
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
        className="md:hidden hover:text-gray-200 transition-colors"
        aria-label="Open Menu"
        onClick={handleMenuClick}
      >
        <LuMenu className="h-8 w-8 text-brandGreen-300" />
      </button>

      {/* Desktop Nav */}
      <ul className="hidden md:flex space-x-8 text-white font-medium">
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Home</li>
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Projects</li>
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Contact</li>
      </ul>

      {/* Drawer for mobile */}
      <Drawer isOpen={drawerOpen} onClose={() => toggleDrawer()} />
    </nav>
  )
}
