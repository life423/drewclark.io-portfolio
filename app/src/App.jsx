import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import useNavigationState from './hooks/useNavigationState';
import ErrorBoundary from './components/ErrorBoundary';
import { FocusProvider } from './contexts/FocusContext';
import { ANIMATION } from './styles/constants';
import logger from './utils/logger';
import { config } from './config';

// Lazy-loaded components
const Layout = lazy(() => import('./components/layout/Layout'));
const Hero = lazy(() => import('./components/hero/Hero'));

// Lazy load ProjectsContainer for better code splitting
const ProjectsContainer = lazy(() => import(/* webpackChunkName: "projects" */ './components/projects/ProjectsContainer'));

// Optimized loading fallback component with precomputed dimensions to prevent layout shifts
const LoadingFallback = () => (
    <div className="p-8 flex justify-center items-center" style={{ minHeight: "200px" }}>
        <div className="animate-pulse text-center" aria-busy="true" aria-live="polite">
            <div className="h-6 w-32 bg-brandGray-700 rounded mb-3 mx-auto" style={{ height: "24px", width: "128px" }}></div>
            <div className="h-4 w-48 bg-brandGray-700 rounded mx-auto" style={{ height: "16px", width: "192px" }}></div>
        </div>
    </div>
);

// Error logging function for ErrorBoundary
const logError = (error, errorInfo) => {
    logger.error('App Error', 'AppRoot', error, errorInfo);
};

// Main content component (memoized to prevent unnecessary re-renders)
// Code split with separate chunks for above-the-fold and below-the-fold content
const MainContent = React.memo(() => {
    return (
        <main className='flex flex-col min-h-screen'>
            <ErrorBoundary onError={logError}>
                <Suspense fallback={<LoadingFallback />}>
                    <Hero />
                </Suspense>
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
                    {/* Use an IntersectionObserver-based lazy loading to defer loading until needed */}
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
    
    // Set up debug environment for development and deployment debugging
    useEffect(() => {
        // Use a small delay to ensure this runs after critical rendering is complete
        const debugSetupTimer = setTimeout(() => {
            // Dynamically import debugUtils to reduce initial bundle
            import('./utils/debug-utils').then(module => {
                const debugUtils = module.default;
                
                // Log environment information when app starts
                const envInfo = debugUtils.logEnvironmentInfo('App', { 
                    version: process.env.VERSION || 'dev',
                    initialLoadTime: new Date().toISOString()
                });
                
                appLogger.debug('Environment details:', envInfo);
                
                // Set up debug keyboard shortcut (Ctrl+Shift+D)
                debugUtils.setupDebugShortcut();
                
                // Show debug panel in development or if URL contains debug parameter
                const urlParams = new URLSearchParams(window.location.search);
                const showDebug = urlParams.has('debug') || 
                                config.environment.envType === 'development';
                
                if (showDebug) {
                    debugUtils.createDebugPanel({ 
                        autoHide: config.environment.isProduction,
                        detailed: urlParams.get('debug') === 'detailed'
                    });
                }
            });
        }, 200); // Small delay to prioritize critical content rendering first
        
        return () => clearTimeout(debugSetupTimer);
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
                <Suspense fallback={<LoadingFallback />}>
                    <Layout {...enhancedNavigationState}>
                        <MainContent />
                    </Layout>
                </Suspense>
            </FocusProvider>
        </ErrorBoundary>
    );
}
