import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { LuMenu } from 'react-icons/lu'
import useScrollPosition from '../../hooks/useScrollPosition'
import HorizontalProgressBar from '../progress/HorizontalProgressBar'
import { getInterpolatedColor } from '../../components/utils/colorInterpolate'
import EmailContactModal from '../drawer/EmailContactModal'

export default function Navbar({ drawerOpen, toggleDrawer, progressBarVisible = true }) {
  // Desktop 'Contact' link opens the same modal the mobile drawer uses
  const [isContactOpen, setIsContactOpen] = useState(false)
  const closeContact = useCallback(() => setIsContactOpen(false), [])

  const { y: scrollY, percent: scrollPercent, forceRecalculation } = useScrollPosition()
  const isScrolled = scrollY > 50
  const navbarRef = useRef(null)

  // Reserve the natural expanded header height before paint. Observe width,
  // font and safe-area changes; keep the reservation stable as the bar compacts
  // on scroll so changing its height cannot move the content underneath it.
  useLayoutEffect(() => {
    if (isScrolled || !navbarRef.current) return
    const navbar = navbarRef.current
    const updateHeight = () => {
      document.documentElement.style.setProperty('--site-nav-rest-height', `${navbar.offsetHeight}px`)
    }
    updateHeight()
    const observer = new window.ResizeObserver(updateHeight)
    observer.observe(navbar)
    return () => observer.disconnect()
  }, [isScrolled])

  function handleMenuClick() {
    toggleDrawer()
    setTimeout(() => {
      forceRecalculation()
    }, 310)
  }

  useEffect(() => {
    forceRecalculation()
    const handleOrientationChange = () => {
      setTimeout(() => {
        forceRecalculation()
      }, 100)
    }
    window.addEventListener('orientationchange', handleOrientationChange)
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [forceRecalculation])

  return (
    <nav
      ref={navbarRef}
      className={clsx(
        'fixed top-0 w-full z-50',
        'transition-all duration-300 ease-in-out',
        isScrolled
          ? 'backdrop-blur-md bg-brandGray-800/90 shadow-nav'
          : 'backdrop-blur-sm bg-gradient-to-b from-brandGray-900/70 to-transparent',
        drawerOpen ? '-translate-y-full' : 'translate-y-0'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className={clsx(
          'flex items-center justify-between w-full',
          isScrolled ? 'px-4 py-2' : 'px-6 py-5'
        )}
      >
        <div
          className={clsx(
            'font-extralight uppercase tracking-wider transition-all duration-300',
            isScrolled ? 'text-xl' : 'text-2xl'
          )}
        >
          <a href='#' className='relative group inline-block'>
            <span
              className={clsx(
                'bg-clip-text text-transparent relative z-10 inline-block',
                'transition-all duration-300 ease-out',
                isScrolled
                  ? 'bg-gradient-to-r from-brandGreen-400 to-brandBlue-500'
                  : 'bg-gradient-to-r from-brandGreen-300 to-brandBlue-400',
                'hover:text-shadow-sm'
              )}
            >
              DC
            </span>
            <span
              className='absolute -bottom-1 left-0 w-0 h-0.5 
              bg-gradient-to-r from-brandGreen-400 to-brandBlue-400
              group-hover:animate-nav-underline'
            ></span>
          </a>
        </div>
        <button
          className={clsx(
            'md:hidden relative flex min-h-11 min-w-11 items-center justify-center',
            'rounded-full group',
            'border hover:shadow-md',
            'active:shadow-inner',
            'transition-all duration-200',
            'z-[100]',
            'pointer-events-auto',
            isScrolled
              ? 'px-2 py-1.5 bg-gradient-to-b from-brandGray-700/90 to-brandGray-800 border-brandGray-600/40'
              : 'px-3 py-2 bg-gradient-to-b from-brandGray-700/60 to-brandGray-800/60 border-brandGray-600/20'
          )}
          style={{
            boxShadow: isScrolled
              ? '0 1px 3px rgba(0, 0, 0, 0.12)'
              : '0 2px 5px rgba(0, 0, 0, 0.08)',
          }}
          aria-label='Open Menu'
          onClick={handleMenuClick}
        >
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
        <ul
          className={clsx(
            'hidden md:flex font-medium',
            'transition-all duration-300',
            isScrolled ? 'space-x-6' : 'space-x-8'
          )}
        >
          {[
            { label: 'Home', href: '#' },
            { label: 'Blog', href: 'https://blog.drewclark.io' },
            { label: 'GitHub', href: 'https://github.com/life423' },
          ].map(({ label, href }) => (
            <li
              key={label}
              className={clsx(
                'nav-link-hover relative',
                'transition-all duration-300 ease-out',
                isScrolled
                  ? 'text-brandGreen-400 text-sm'
                  : 'text-brandGreen-300 text-base'
              )}
            >
              <a
                href={href}
                target={label === 'Home' ? '_self' : '_blank'}
                rel={label === 'Home' ? '' : 'noopener noreferrer'}
                className={clsx(
                  'relative block transition-all duration-300 ease-out',
                  'hover:text-brandGreen-300 group',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brandGreen-300'
                )}
              >
                {label}
                <span
                  className='absolute bottom-0 left-0 w-0 h-0.5 
                  bg-gradient-to-r from-brandGreen-400 to-brandBlue-400
                  group-hover:animate-nav-underline'
                ></span>
              </a>
            </li>
          ))}
          <li
            className={clsx(
              'nav-link-hover relative overflow-hidden',
              'transition-all duration-300 ease-out',
              isScrolled
                ? 'text-brandGreen-400 text-sm'
                : 'text-brandGreen-300 text-base'
            )}
          >
            <button
              type='button'
              onClick={() => setIsContactOpen(true)}
              className={clsx(
                'relative block transition-all duration-300 ease-out',
                'hover:text-brandGreen-300 group'
              )}
            >
              Contact
              <span
                className='absolute bottom-0 left-0 w-0 h-0.5 
                bg-gradient-to-r from-brandGreen-400 to-brandBlue-400
                group-hover:animate-nav-underline'
              ></span>
            </button>
          </li>
        </ul>
      </div>
      <HorizontalProgressBar
        visible={progressBarVisible}
        progress={scrollPercent}
        getInterpolatedColor={getInterpolatedColor}
      />
      {/* Portaled to <body>: the nav's transform and backdrop-filter would otherwise trap the modal's fixed positioning */}
      {createPortal(
        <EmailContactModal isOpen={isContactOpen} onClose={closeContact} />,
        document.body
      )}
    </nav>
  )
}
