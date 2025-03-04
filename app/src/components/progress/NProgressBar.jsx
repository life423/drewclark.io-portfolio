import React, { useEffect, useState } from 'react'
import NProgress from 'nprogress'
import '../../styles/nprogress.css'

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
  trickleSpeed: 100,
  parent: 'body'
})

export default function NProgressBar() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Start the progress bar when the component mounts
    NProgress.start()

    // Simulate a loading process
    const incrementLoader = () => {
      NProgress.inc(0.2) // Increment by 20%
    }

    // Set up intervals to increment the progress
    const incrementInterval = setInterval(incrementLoader, 300)

    // Complete the progress bar after a delay
    const timer = setTimeout(() => {
      clearInterval(incrementInterval)
      NProgress.done()
      setLoading(false)
    }, 1500)

    // Clean up
    return () => {
      clearTimeout(timer)
      clearInterval(incrementInterval)
      NProgress.done()
    }
  }, [])

  // This component doesn't render anything visible itself
  // NProgress adds its own elements to the DOM
  return null
}
