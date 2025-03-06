// FILE: app/src/components/navbar/Navbar.jsx
import React, { useEffect } from 'react'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'
import TopTierDrawer from '../drawer/TopTierDrawer'

export default function NavBar({ drawerOpen, openDrawer, closeDrawer, toggleDrawer }) {
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 50

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
        className="md:hidden hover:text-gray-200 transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brandGreen-500 focus:ring-opacity-50"
        aria-label={drawerOpen ? "Close Menu" : "Open Menu"}
        aria-expanded={drawerOpen}
        aria-controls="drawer-menu"
        data-testid="menu-button"
        onClick={() => {
          console.log('Menu button clicked, toggling drawer');
          toggleDrawer();
        }}
      >
        <LuMenu className="h-8 w-8 text-brandGreen-300" />
      </button>

      {/* Desktop Nav */}
      <ul className="hidden md:flex space-x-8 text-white font-medium">
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Home</li>
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Projects</li>
        <li className="cursor-pointer hover:text-brandGreen-300 transition-colors">Contact</li>
      </ul>

      {/* Top-tier drawer for mobile navigation */}
      <TopTierDrawer 
        isOpen={drawerOpen} 
        onClose={() => {
          console.log('Drawer onClose callback triggered from Navbar');
          closeDrawer();
        }} 
      />
    </nav>
  )
}
