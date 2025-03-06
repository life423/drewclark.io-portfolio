/**
 * Main App component optimized for performance
 * Uses React.memo for key components and useMemo for values
 * Separates navigation state to prevent unnecessary re-renders
 */
import React, { useState, useEffect, useMemo, memo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProgressBar from './components/progress/ProgressBar'

// Memoize the main content to prevent re-renders when only navigation state changes
const MainContent = memo(function MainContent() {
    return (
        <main className="flex flex-col min-h-screen">
            <Hero />
        </main>
    )
})

export default function App() {
    // Navigation state
    const navigationState = useNavigationState()
    const { drawerOpen } = navigationState
    
    // State for tracking initial page load
    const [initialLoading, setInitialLoading] = useState(true)
    
    // Set loading to false after a short delay to match NProgress timing
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false)
        }, 1600) // slightly longer than the NProgress timer in main.jsx
        
        return () => clearTimeout(timer)
    }, [])
    
    // Compute the visibility of the progress bar once
    const progressBarVisible = useMemo(() => 
        !initialLoading && !drawerOpen,
    [initialLoading, drawerOpen])
    
    return (
        <>
            {/* Scroll progress bar that appears after initial load */}
            <ProgressBar visible={progressBarVisible} />
            
            <Layout {...navigationState}>
                <MainContent />
            </Layout>
        </>
    )
}
