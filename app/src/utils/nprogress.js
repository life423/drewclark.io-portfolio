import NProgress from 'nprogress';
import '../styles/nprogress.css';

// Configure NProgress with simple settings
NProgress.configure({
  showSpinner: false
});

// Simple function to start progress
export const startProgress = () => {
  NProgress.start();
};

// Simple function to complete progress
export const completeProgress = () => {
  NProgress.done();
};

// Initialize progress for page load
export const initPageLoadProgress = () => {
  // Start immediately
  NProgress.start();
  
  // Complete after a delay
  setTimeout(() => {
    NProgress.done();
  }, 1000);
};

export default NProgress;
