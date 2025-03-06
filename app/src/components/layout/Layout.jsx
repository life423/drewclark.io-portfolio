// FILE: app/src/components/layout/Layout.jsx
import React from 'react'
import Navbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import Drawer from '../drawer/Drawer'

export default function Layout({
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    children,
}) {
    return (
        <div className='relative min-h-screen flex flex-col overflow-x-hidden bg-brandGray-500'>
            <header>
                <Navbar
                    drawerOpen={drawerOpen}
                    toggleDrawer={toggleDrawer}
                />
            </header>

            {/* The Drawer component is now a sibling, not nested in Navbar */}
            <Drawer isOpen={drawerOpen} onClose={toggleDrawer} />

            <main
                id='content'
                className='flex-grow transition-transform duration-300'
            >
                {children}
            </main>

            <Footer />
        </div>
    )
}
