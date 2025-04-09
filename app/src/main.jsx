import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import logger from './utils/logger';
import ContactMessagesAdmin from './components/admin/ContactMessagesAdmin';

// Create a module-specific logger
const log = logger.getLogger('Main');

// Register service worker for production environments
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        log.info('Service Worker registered successfully:', registration.scope);
        
        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the updated precached content has been fetched,
                  // but the previous service worker will still serve the older
                  // content until all client tabs are closed.
                  log.info('New content is available; please refresh.');
                  
                  // Optional: Show a notification to the user
                  if (window.confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                } else {
                  // At this point, everything has been precached.
                  log.info('Content is cached for offline use.');
                }
              }
            };
          }
        };
      })
      .catch(error => {
        log.error('Error during service worker registration:', error);
      });
      
    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      log.info('New service worker controller');
    });
  });
}

// Create offline notification component
const OfflineNotification = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!isOffline) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: '#f56565',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 9999
    }}>
      You are currently offline. Some features may be limited.
    </div>
  );
};

// Simple routing to determine which component to render
function Root() {
  const path = window.location.pathname;
  
  // Check if we're on the admin messages page
  if (path === '/admin-messages') {
    return (
      <>
        <ContactMessagesAdmin />
        <OfflineNotification />
      </>
    );
  }
  
  // Otherwise render the main app
  return (
    <>
      <App />
      <OfflineNotification />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
