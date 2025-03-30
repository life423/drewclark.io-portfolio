import React, { useState, useEffect, useMemo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProjectsContainer from './components/projects/ProjectsContainer'
import { FocusProvider } from './contexts/FocusContext'
import { ANIMATION } from './styles/constants'

// Main content component
function MainContent() {
    return (
        <main className='flex flex-col min-h-screen'>
            <Hero />
            <div id="projects" className='bg-brandGray-900'>
                <ProjectsContainer />
            </div>
        </main>
    )
}

export default function App() {
    const navigationState = useNavigationState()
    const { drawerOpen } = navigationState

    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false)
        }, ANIMATION.EXTRA_LONG)

        return () => clearTimeout(timer)
    }, [])

    // Calculate whether to show progress indicators based on app state
    const progressBarVisible = useMemo(
        () => !initialLoading && !drawerOpen,
        [initialLoading, drawerOpen]
    )

    // Enhanced navigation state with progress bar visibility
    const enhancedNavigationState = {
        ...navigationState,
        progressBarVisible
    }

    return (
        <FocusProvider>
            <Layout {...enhancedNavigationState}>
                <MainContent />
            </Layout>
        </FocusProvider>
    )
}
