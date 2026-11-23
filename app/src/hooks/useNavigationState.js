// app/src/hooks/useNavigationState.js
import { useState, useCallback, useEffect } from 'react'

export default function useNavigationState() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Toggle logic
    const openDrawer = useCallback(() => setDrawerOpen(true), [])
    const closeDrawer = useCallback(() => setDrawerOpen(false), [])
    const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), [])

    useEffect(() => {
        window.addEventListener('portfolio:explore-build', closeDrawer)
        return () => window.removeEventListener('portfolio:explore-build', closeDrawer)
    }, [closeDrawer])

    return {
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
    }
}
