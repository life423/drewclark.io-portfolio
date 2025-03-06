import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import NProgress from 'nprogress'
import '../../styles/nprogress.css'

// Configure NProgress with optimized settings for smooth animation
NProgress.configure({
  minimum: 0.1,
  easing: 'ease-in-out',
  speed: 400,
  showSpinner: false,
  trickleSpeed: 250,
  parent: 'body'
})

/**
 * Rainbow gradient progress bar that shows during initial page load.
 * Features smooth animation and color transitions.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onLoadComplete - Callback when loading is complete
 * @param {number} props.simulatedLoadTime - Time in ms to simulate loading (default: 800)
 * @param {number} props.completeDelay - Extra time in ms after completing (default: 200)
 */
export default function NProgressBar({ 
  onLoadComplete, 
  simulatedLoadTime = 800, 
  completeDelay = 200
}) {
  const [loading, setLoading] = useState(true)
  
  // Handle completion of loading
  const completeLoading = useCallback(() => {
    // Set progress to almost complete
    NProgress.set(0.9)
    
    // After a brief delay, complete the progress
    setTimeout(() => {
      NProgress.done()
      setLoading(false)
      
      // Notify parent component that loading is complete
      if (onLoadComplete) {
        setTimeout(() => onLoadComplete(), completeDelay)
      }
    }, 100)
  }, [onLoadComplete, completeDelay])
  
  // Initialize and manage progress
  useEffect(() => {
    // Start progress when component mounts
    NProgress.start()
    
    // Use faster, smoother progress increments
    const incrementSteps = [0.25, 0.4, 0.55, 0.7, 0.85]
    const stepTime = simulatedLoadTime / incrementSteps.length
    
    let currentStep = 0
    const incrementLoader = () => {
      if (currentStep < incrementSteps.length) {
        NProgress.set(incrementSteps[currentStep])
        currentStep++
      } else {
        clearInterval(incrementInterval)
        completeLoading()
      }
    }
    
    // Start incrementing at regular intervals
    const incrementInterval = setInterval(incrementLoader, stepTime)
    
    // Cleanup function
    return () => {
      clearInterval(incrementInterval)
      NProgress.done()
    }
  }, [simulatedLoadTime, completeLoading])
  
  // This component doesn't render anything visible itself
  return null
}

NProgressBar.propTypes = {
  onLoadComplete: PropTypes.func,
  simulatedLoadTime: PropTypes.number,
  completeDelay: PropTypes.number
}
