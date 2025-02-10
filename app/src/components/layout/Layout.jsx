// FILE: app/src/components/layout/Layout.jsx
import React from 'react'
import NavBar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import BackgroundOverlay from './BackgroundOverlay'

export default function Layout({
    drawerOpen,
    openDrawer,
    closeDrawer,
    children,
}) {
    return (
        <div className='relative min-h-screen flex flex-col overflow-x-hidden'>
            {/* Background and Overlay */}

            {/* Navigation Area */}
            <header>
                <NavBar
                    drawerOpen={drawerOpen}
                    setDrawerOpen={openDrawer}
                    closeDrawer={closeDrawer}
                />
            </header>

            {/* Main Content */}
            <main
                id='content'
                className='flex-grow transition-transform duration-300'
            >
                <BackgroundOverlay />
                {children}
            </main>

            {/* Footer always at the bottom */}
            <Footer />
        </div>
    )
}
