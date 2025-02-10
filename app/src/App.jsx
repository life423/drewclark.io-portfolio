// FILE: app/src/App.jsx
import React from 'react'
import useNavigationState from './hooks/useNavigationState'
import useScrollPosition from './hooks/useScrollPosition'
// import ProgressBar from './components/progress/ProgressBar'
import Layout from './components/layout/Layout'


export default function App() {
    const { drawerOpen, openDrawer, closeDrawer } = useNavigationState()
    const scrollY = useScrollPosition()

    return (
        <>
            {/* {!drawerOpen && <ProgressBar />} */}
            <Layout
                drawerOpen={drawerOpen}
                openDrawer={openDrawer}
                closeDrawer={closeDrawer}
            >
                {/* Insert your page content here */}
            </Layout>
        </>
    )
}
