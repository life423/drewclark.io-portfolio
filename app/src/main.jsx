import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import NProgress from 'nprogress'
import './styles/nprogress.css'
import App from './App'

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
  trickleSpeed: 100
})

// Start the progress bar
NProgress.start()

// Simulate a loading process
const incrementLoader = () => {
  NProgress.inc(0.2) // Increment by 20%
}

// Set up intervals to increment the progress
const incrementInterval = setInterval(incrementLoader, 300)

// Complete the progress bar after the app is loaded
window.onload = () => {
  clearInterval(incrementInterval)
  NProgress.done()
}

// Fallback to ensure NProgress completes even if onload doesn't fire
setTimeout(() => {
  clearInterval(incrementInterval)
  NProgress.done()
}, 2000) // Reasonable timeout for fallback

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
