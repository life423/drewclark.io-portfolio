// FILE: app/src/components/layout/Layout.jsx
import React, { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from '../navbar/Navbar'
import Footer from '../footer/Footer'

// The drawer (and the contact modal inside it) only matters once someone opens it, so it
// stays out of the main bundle. It is fetched during idle time after load and mounted closed,
// so the first open still animates and is instant; opening before then loads it on demand.
const loadDrawer = () => import('../drawer/Drawer')
const Drawer = lazy(loadDrawer)

export default function Layout({
    drawerOpen,
    toggleDrawer,
    progressBarVisible,
    children,
}) {
    const [drawerReady, setDrawerReady] = useState(false)

    useEffect(() => {
        if (drawerOpen) setDrawerReady(true)
    }, [drawerOpen])

    useEffect(() => {
        let cancelled = false
        const idle = window.requestIdleCallback || (callback => setTimeout(callback, 1500))
        const cancelIdle = window.cancelIdleCallback || clearTimeout
        const handle = idle(() => {
            loadDrawer().then(() => {
                if (!cancelled) setDrawerReady(true)
            })
        })
        return () => {
            cancelled = true
            cancelIdle(handle)
        }
    }, [])

    return (
        <div className='site-rails relative min-h-screen flex flex-col overflow-x-hidden bg-brandGray-500'>
            <header>
                <Navbar
                    drawerOpen={drawerOpen}
                    toggleDrawer={toggleDrawer}
                    progressBarVisible={progressBarVisible}
                />
            </header>

            {/* The Drawer component is a sibling of the Navbar, not nested in it */}
            {drawerReady && (
                <Suspense fallback={null}>
                    <Drawer isOpen={drawerOpen} onClose={toggleDrawer} />
                </Suspense>
            )}

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
