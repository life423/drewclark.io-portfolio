// app/src/hooks/useNavigationState.js
import { useState, useCallback } from 'react'

export default function useNavigationState() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Toggle logic
    const openDrawer = useCallback(() => setDrawerOpen(true), [])
    const closeDrawer = useCallback(() => setDrawerOpen(false), [])
    const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), [])

    return {
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
    }
}
