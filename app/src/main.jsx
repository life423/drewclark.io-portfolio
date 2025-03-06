import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// import NProgress from 'nprogress'
import './styles/nprogress.css'
import App from './App'

// Configure NProgress with minimal settings
// NProgress.configure({
//   showSpinner: false,
//   speed: 400
// })

// Start NProgress as soon as you begin to load
// NProgress.start()

// Complete the progress after a reasonable timeout
// setTimeout(() => {
//   NProgress.done()
// }, 1500)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
