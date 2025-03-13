import React, { useState, useEffect, useMemo, memo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProjectsContainer from './components/projects/ProjectsContainer'
<<<<<<< HEAD

// Memoized main content component for better performance
=======
// import ProgressBar from './components/progress/ProgressBar'

>>>>>>> life423/main
const MainContent = memo(function MainContent() {
    return (
        <main className='flex flex-col min-h-screen'>
            <Hero />
            <div id="projects" className='bg-brandGray-900'>
                <ProjectsContainer />
            </div>
<<<<<<< HEAD
=======
            {/* Containerized version - API is now integrated into the main Node server */}
>>>>>>> life423/main
        </main>
    )
})

export default function App() {
    const navigationState = useNavigationState()
    const { drawerOpen } = navigationState

    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false)
        }, 1600)

        return () => clearTimeout(timer)
    }, [])

<<<<<<< HEAD
    // Calculate whether to show progress indicators based on app state
=======
    // We'll pass this visibility state to the Navbar via navigationState
>>>>>>> life423/main
    const progressBarVisible = useMemo(
        () => !initialLoading && !drawerOpen,
        [initialLoading, drawerOpen]
    )

<<<<<<< HEAD
    // Enhanced navigation state with progress bar visibility
    const enhancedNavigationState = {
=======
    // Pass progressBarVisible to navigationState so Navbar can access it
    const navStateWithProgress = {
>>>>>>> life423/main
        ...navigationState,
        progressBarVisible
    }

    return (
<<<<<<< HEAD
        <Layout {...enhancedNavigationState}>
            <MainContent />
        </Layout>
=======
        <>
            <Layout {...navStateWithProgress}>
                <MainContent />
            </Layout>
        </>
>>>>>>> life423/main
    )
}
