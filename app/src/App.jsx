import React, { useState } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProgressBar from './components/progress/ProgressBar'
import NProgressBar from './components/progress/NProgressBar'

export default function App() {
    const { drawerOpen, openDrawer, closeDrawer, toggleDrawer } = useNavigationState()
    
    // State for tracking initial page load
    const [initialLoading, setInitialLoading] = useState(true)
    
    // When initial load completes, set loading to false
    const handleLoadComplete = () => {
        setInitialLoading(false)
    }

    return (
        <>
            {/* Rainbow gradient progress bar for initial load */}
            {initialLoading && (
                <NProgressBar 
                    onLoadComplete={handleLoadComplete}
                    simulatedLoadTime={700} // Faster, more responsive loading
                    completeDelay={150}    // Brief delay before transition
                />
            )}
            
            {/* Scroll progress bar that appears after initial load */}
            <ProgressBar visible={!initialLoading && !drawerOpen} />
            
            <Layout
                drawerOpen={drawerOpen}
                openDrawer={openDrawer}
                closeDrawer={closeDrawer}
                toggleDrawer={toggleDrawer}
            >
                <main className="flex flex-col min-h-screen">
                    <Hero />
                </main>
            </Layout>
        </>
    )
}
