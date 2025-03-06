import React, { useState, useEffect, useMemo, memo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProgressBar from './components/progress/ProgressBar'
import HorizontalProgressBar from './components/progress/HorizontalProgressBar'

const MainContent = memo(function MainContent() {
    return (
        <main className='flex flex-col min-h-screen'>
            <Hero />
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

    const progressBarVisible = useMemo(
        () => !initialLoading && !drawerOpen,
        [initialLoading, drawerOpen]
    )

    return (
        <>
            {}
            <ProgressBar visible={progressBarVisible} />

            {}
            <HorizontalProgressBar visible={progressBarVisible} />

            <Layout {...navigationState}>
                <MainContent />
            </Layout>
        </>
    )
}
