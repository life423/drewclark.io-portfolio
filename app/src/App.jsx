import React, { useState, useEffect, useMemo, memo } from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import ProjectsContainer from './components/projects/ProjectsContainer'
import TestAiButton from './components/utils/TestAiButton'
// import ProgressBar from './components/progress/ProgressBar'

const MainContent = memo(function MainContent() {
    return (
        <main className='flex flex-col min-h-screen'>
            <Hero />
            <div id="projects" className='bg-brandGray-900'>
                <ProjectsContainer />
            </div>
            {/* Development testing section - remove before production */}
            {process.env.NODE_ENV !== 'production' && (
                <div id="dev-test" className="px-6 py-12 bg-brandGray-900 border-t border-brandGray-700">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-brandGreen-300">AI Integration Testing</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <TestAiButton />
                            <div className="p-4 border border-brandGray-700 rounded-lg bg-brandGray-800">
                                <h3 className="text-xl font-bold text-brandGreen-300 mb-3">Developer Notes</h3>
                                <p className="text-sm text-brandGray-200 mb-3">
                                    This section allows you to test the Azure Function integration with OpenAI.
                                    Try asking questions about the portfolio or anything else to see the AI response.
                                </p>
                                <div className="text-xs text-brandGray-400">
                                    <p className="mb-1">• Uses the new <code className="bg-brandGray-700 px-1 rounded">/api/askGPT</code> endpoint</p>
                                    <p className="mb-1">• Requires an OpenAI API key to be configured</p>
                                    <p>• Remove this section before production by updating the conditional render in MainContent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
