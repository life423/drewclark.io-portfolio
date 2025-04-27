<<<<<<< HEAD
// FILE: app/src/components/navbar/Navbar.jsx
import React, { useEffect } from 'react'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'
import HorizontalProgressBar from '../progress/HorizontalProgressBar'
import { getInterpolatedColor } from '../../components/utils/colorInterpolate'


export default function Navbar({ drawerOpen, toggleDrawer, progressBarVisible = true }) {
  const { y: scrollY, percent: scrollPercent, forceRecalculation } = useScrollPosition()
  const isScrolled = scrollY > 50
  
  // Force recalculation when the drawer is toggled
  function handleMenuClick() {
    toggleDrawer()
    
    // Force scroll recalculation after the drawer animation completes
    setTimeout(() => {
      forceRecalculation()
    }, 310) // Drawer transition is 300ms + small buffer
  }
  
  // Force a recalculation on the first render
  // This ensures the progress bar is correctly positioned on initial load
  useEffect(() => {
    forceRecalculation()
    
    // Force recalculation on orientation changes specifically for mobile devices
    const handleOrientationChange = () => {
      setTimeout(() => {
        forceRecalculation()
      }, 100) // Small delay to let the browser finish orientation change
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [forceRecalculation])

  return (
      <nav
          className={clsx(
              'fixed top-0 w-full z-50',
              'transition-all duration-300 ease-in-out',
              isScrolled
                  ? 'backdrop-blur-md bg-brandGray-800/90 shadow-nav'
                  : 'backdrop-blur-sm bg-gradient-to-b from-brandGray-900/70 to-transparent',
              drawerOpen ? '-translate-y-[64px]' : 'translate-y-0'
          )}
      >
          <div
              className={clsx(
                  'flex items-center justify-between w-full',
                  isScrolled ? 'h-14 px-4 py-2' : 'h-18 px-6 py-5'
              )}
          >
          {/* Dynamic Logo with hover effect - animation removed */}
          <div
              className={clsx(
                  'font-extralight uppercase tracking-wider transition-all duration-300',
                  isScrolled ? 'text-xl' : 'text-2xl'
                  // Animation removed as requested
              )}
          >
              {/* Gradient text that responds to scroll position */}
              <a href='#' className='relative group inline-block'>
                  <span
                      className={clsx(
                          'bg-clip-text text-transparent relative z-10 inline-block',
                          'transition-all duration-300 ease-out',
                          isScrolled
                              ? 'bg-gradient-to-r from-brandGreen-400 to-brandBlue-500'
                              : 'bg-gradient-to-r from-brandGreen-300 to-brandBlue-400',
                          'hover:text-shadow-sm' // Subtle glow on hover
                      )}
                  >
                      DC
                  </span>

                  {/* Hover indicator with faster animation */}
                  <span
                      className='absolute -bottom-1 left-0 w-0 h-0.5 
                         bg-gradient-to-r from-brandGreen-400 to-brandBlue-400
                         group-hover:animate-nav-underline'
                  ></span>
              </a>
          </div>

          {/* Context-aware menu button that adapts to scroll position */}
          <button
              className={clsx(
                  'md:hidden relative flex items-center justify-center',
                  'rounded-full group',
                  'border hover:shadow-md',
                  'active:shadow-inner',
                  'transition-all duration-200',
                  'z-[100]', // Add explicit high z-index
                  'pointer-events-auto', // Ensure it captures clicks
                  isScrolled
                      ? 'min-w-[40px] min-h-[40px] px-2 py-1.5 bg-gradient-to-b from-brandGray-700/90 to-brandGray-800 border-brandGray-600/40'
                      : 'min-w-[44px] min-h-[44px] px-3 py-2 bg-gradient-to-b from-brandGray-700/60 to-brandGray-800/60 border-brandGray-600/20'
              )}
              style={{
                  transform: `scale(${isScrolled ? '0.95' : '1'})`,
                  boxShadow: isScrolled
                      ? '0 1px 3px rgba(0, 0, 0, 0.12)'
                      : '0 2px 5px rgba(0, 0, 0, 0.08)',
                  zIndex: 100, // Redundant but ensures it works in all browsers
              }}
              aria-label='Open Menu'
              onClick={handleMenuClick}
          >
              {/* Dynamic glow effect based on scroll */}
              <span
                  className={clsx(
                      'absolute inset-0 rounded-full pointer-events-none',
                      'transition-opacity duration-300',
                      'bg-brandGreen-500/10 animate-pulse-slow',
                      isScrolled
                          ? 'opacity-0 group-hover:opacity-80'
                          : 'opacity-0 group-hover:opacity-100'
                  )}
              ></span>

              {/* Icon that adapts to scroll position */}
              <LuMenu
                  className={clsx(
                      'transition-all duration-200',
                      isScrolled
                          ? 'h-5 w-5 text-brandGreen-400 group-hover:text-brandGreen-300'
                          : 'h-6 w-6 text-brandGreen-300 group-hover:text-brandGreen-200'
                  )}
              />
              <span className='sr-only'>Menu</span>
          </button>

          {/* Context-aware Desktop Nav */}
          <ul
              className={clsx(
                  'hidden md:flex font-medium',
                  'transition-all duration-300',
                  isScrolled ? 'space-x-6' : 'space-x-8'
              )}
          >
              {['Home', 'GitHub'].map((item, index) => (
                  <li
                      key={item}
                      className={clsx(
                          'nav-link-hover relative overflow-hidden',
                          'transition-all duration-300 ease-out',
                          // Slightly smaller text and different color when scrolled
                          isScrolled
                              ? 'text-brandGreen-400 text-sm'
                              : 'text-brandGreen-300 text-base'
                      )}
                  >
                      <a
                          href={
                              index === 0 ? '#' : 'https://github.com/life423'
                          }
                          target={index === 0 ? '_self' : '_blank'}
                          rel={index === 0 ? '' : 'noopener noreferrer'}
                          className={clsx(
                              'relative block transition-all duration-300 ease-out',
                              'hover:text-brandGreen-300 group'
                          )}
                      >
                          {item}
                          {/* Animated underline effect */}
                          <span
                              className='absolute bottom-0 left-0 w-0 h-0.5 
                             bg-gradient-to-r from-brandGreen-400 to-brandBlue-400
                             group-hover:animate-nav-underline'
                          ></span>
                      </a>
                  </li>
              ))}
          </ul>

          </div>

          {/* Full-width progress bar at bottom of nav */}
          <HorizontalProgressBar
              visible={progressBarVisible}
              progress={scrollPercent}
              getInterpolatedColor={getInterpolatedColor}
          />
      </nav>
  )
=======
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
>>>>>>> ef0428e (Refactored App component to functional component, added NavBar and ProgressBar components. Created useScrollPosition hook for scroll tracking. Updated Tailwind config with new color scheme.)
}
