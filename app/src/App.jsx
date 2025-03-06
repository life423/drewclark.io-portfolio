import React from 'react'
import useNavigationState from './hooks/useNavigationState'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ProgressBar from './components/progress/ProgressBar'

export default function App() {
    const { drawerOpen, openDrawer, closeDrawer, toggleDrawer } = useNavigationState()

    return (
        <>
            {!drawerOpen && <ProgressBar />}
            <Layout
                drawerOpen={drawerOpen}
                openDrawer={openDrawer}
                closeDrawer={closeDrawer}
                toggleDrawer={toggleDrawer}
            >
                <main className="flex flex-col min-h-screen">
                    <Hero />
                    <About />
                    <Projects />
                    <Contact />
                </main>
            </Layout>
        </>
    )
}
