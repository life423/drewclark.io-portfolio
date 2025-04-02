import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import useNavigationState from './hooks/useNavigationState';
import Layout from './components/layout/Layout';
import Hero from './components/hero/Hero';
import ErrorBoundary from './components/ErrorBoundary';
import { FocusProvider } from './contexts/FocusContext';
import { ANIMATION } from './styles/constants';
import logger from './utils/logger';

// Lazy load ProjectsContainer for better code splitting
const ProjectsContainer = lazy(() => import('./components/projects/ProjectsContainer'));

// Loading fallback component
const LoadingFallback = () => (
    <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse text-center">
            <div className="h-6 w-32 bg-brandGray-700 rounded mb-3 mx-auto"></div>
            <div className="h-4 w-48 bg-brandGray-700 rounded mx-auto"></div>
        </div>
    </div>
);

// Error logging function for ErrorBoundary
const logError = (error, errorInfo) => {
    logger.error('App Error', 'AppRoot', error, errorInfo);
};

// Main content component (memoized to prevent unnecessary re-renders)
const MainContent = React.memo(() => {
    return (
        <main className='flex flex-col min-h-screen'>
            <ErrorBoundary onError={logError}>
                <Hero />
            </ErrorBoundary>
            
            <div id="projects" className='bg-brandGray-900'>
                <ErrorBoundary 
                    onError={logError}
                    fallback={
                        <div className="p-8 text-center text-brandOrange-300">
                            <h2 className="text-xl mb-2">Project section couldn't load</h2>
                            <p>Please refresh the page to try again.</p>
                        </div>
                    }
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <ProjectsContainer />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </main>
    );
});

// Add display name for debugging
MainContent.displayName = 'MainContent';

export default function App() {
    // Initialize module logger
    const appLogger = useMemo(() => logger.getLogger('App'), []);
    
    // Get navigation state
    const navigationState = useNavigationState();
    const { drawerOpen } = navigationState;

    // Loading state
    const [initialLoading, setInitialLoading] = useState(true);

    // Handle initial loading animation
    useEffect(() => {
        appLogger.debug('App mounting, setting initial loading timer');
        
        const timer = setTimeout(() => {
            setInitialLoading(false);
            appLogger.debug('Initial loading complete');
        }, ANIMATION.EXTRA_LONG);

        return () => {
            clearTimeout(timer);
            appLogger.debug('App unmounting, cleared timer');
        };
    }, [appLogger]);

    // Calculate whether to show progress indicators based on app state
    const progressBarVisible = useMemo(
        () => !initialLoading && !drawerOpen,
        [initialLoading, drawerOpen]
    );

    // Enhanced navigation state with progress bar visibility (memoized to prevent unnecessary re-renders)
    const enhancedNavigationState = useMemo(
        () => ({
            ...navigationState,
            progressBarVisible
        }),
        [navigationState, progressBarVisible]
    );

    return (
        <ErrorBoundary onError={logError}>
            <FocusProvider>
                <Layout {...enhancedNavigationState}>
                    <MainContent />
                </Layout>
            </FocusProvider>
        </ErrorBoundary>
    );
}
