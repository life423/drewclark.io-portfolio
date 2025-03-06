// app/src/hooks/useNavigationState.js
import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook to manage navigation state, particularly the drawer open/close state
 * With enhanced debugging and event handling
 */
export default function useNavigationState() {
    // Initialize drawer state
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Track state changes with useEffect for debugging
    useEffect(() => {
        console.log(`Navigation state changed - Drawer is now: ${drawerOpen ? 'OPEN' : 'CLOSED'}`);
    }, [drawerOpen]);

    // Enhanced open/close handlers with logging
    const openDrawer = useCallback(() => {
        console.log('openDrawer called - Setting drawer state to OPEN');
        setDrawerOpen(true);
    }, []);
    
    const closeDrawer = useCallback(() => {
        console.log('closeDrawer called - Setting drawer state to CLOSED');
        setDrawerOpen(false);
    }, []);

    // Add toggle functionality as a convenience
    const toggleDrawer = useCallback(() => {
        console.log(`toggleDrawer called - Flipping drawer state from ${drawerOpen ? 'OPEN to CLOSED' : 'CLOSED to OPEN'}`);
        setDrawerOpen(prevState => !prevState);
    }, [drawerOpen]);

    // Add escape key handler for the entire app
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && drawerOpen) {
                console.log('ESC key pressed while drawer open - closing drawer');
                closeDrawer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [drawerOpen, closeDrawer]);

    return {
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
    }
}
