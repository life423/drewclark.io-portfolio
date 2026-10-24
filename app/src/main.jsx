import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import logger from './utils/logger';
// Admin inbox lives in its own chunk, so regular visitors never download it
const ContactMessagesAdmin = React.lazy(() => import('./components/admin/ContactMessagesAdmin'));

// Create a module-specific logger
const log = logger.getLogger('Main');

// The site no longer uses a service worker. Anyone who still has the old one gets it
// removed here (and public/serviceWorker.js is now a kill switch that unregisters itself).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
    .then(() => (window.caches ? window.caches.keys() : []))
    .then(keys => Promise.all(keys.map(key => window.caches.delete(key))))
    .catch(error => log.error('Service worker cleanup failed:', error));
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
  if (path === '/admin-messages' || path === '/admin') {
    return (
      <>
        <React.Suspense fallback={null}>
          <ContactMessagesAdmin />
        </React.Suspense>
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
