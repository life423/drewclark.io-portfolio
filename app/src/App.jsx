// FILE: app/src/App.jsx
import React from 'react'
import useNavigationState from './hooks/useNavigationState'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import useScrollPosition from './hooks/useScrollPosition'
import Footer from './components/footer/Footer'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const { drawerOpen, openDrawer, closeDrawer } = useNavigationState()
    const scrollY = useScrollPosition()
    const overlayOpacity = scrollY === 0 ? 'opacity-80' : 'opacity-60'

    return (
        // Root container: flex column with min-h-screen ensures full viewport height
        <div className='relative min-h-screen flex flex-col overflow-x-hidden'>
            {/* Background Image */}
            <div
                className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url(${sprout})` }}
            />

            {/* Overlay */}
            <div
                className={`
          pointer-events-none
          fixed inset-0
          -z-5
          bg-gradient-to-br
          from-brandGray-900/60
          via-brandGreen-700/30
          to-brandGray-800/60
          transition-opacity duration-300
          ${overlayOpacity}
        `}
            />

            {/* Navigation Bar */}
            <NavBar
                drawerOpen={drawerOpen}
                setDrawerOpen={openDrawer}
                closeDrawer={closeDrawer}
            />

            {/* Optionally, the progress bar */}
            {!drawerOpen && <ProgressBar />}

            {/* Main content area: flex-grow ensures this section fills available vertical space */}
            <main
                id='content'
                className={`flex-grow transition-transform duration-300 ${
                    drawerOpen ? 'translate-x-[70%]' : ''
                }`}
            >
                {/* Insert your page content here */}
            </main>

            {/* Footer always at the bottom */}
            <Footer />
        </div>
    )
}
