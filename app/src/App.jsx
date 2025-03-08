import React, { useState, useEffect, useMemo, memo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProjectsContainer from './components/projects/ProjectsContainer'
// import ProgressBar from './components/progress/ProgressBar'

const MainContent = memo(function MainContent() {
    return (
        <main className='flex flex-col min-h-screen'>
            <Hero />
            <div id="projects" className='bg-brandGray-900'>
                <ProjectsContainer />
            </div>
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

    // We'll pass this visibility state to the Navbar via navigationState
    const progressBarVisible = useMemo(
        () => !initialLoading && !drawerOpen,
        [initialLoading, drawerOpen]
    )

    // Pass progressBarVisible to navigationState so Navbar can access it
    const navStateWithProgress = {
        ...navigationState,
        progressBarVisible
    }

    return (
        <>
            <Layout {...navStateWithProgress}>
                <MainContent />
            </Layout>
        </>
    )
}
