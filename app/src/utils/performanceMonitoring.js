/**
 * Performance Monitoring Utility
 * 
 * This utility provides functions for tracking and reporting performance metrics
 * in the application, including component render times, API call durations,
 * and key user interactions.
 */

import logger from './logger';

// Create a module-specific logger
const log = logger.getLogger('Performance');

// Constants
const METRIC_TYPES = {
  COMPONENT_RENDER: 'component_render',
  API_CALL: 'api_call',
  INTERACTION: 'user_interaction',
  RESOURCE_LOAD: 'resource_load',
  CUSTOM: 'custom'
};

// Storage for metrics
const metrics = {
  componentRenders: {},
  apiCalls: [],
  interactions: [],
  resources: {},
  custom: {}
};

// Track if monitoring is enabled
let isEnabled = process.env.NODE_ENV === 'production' || localStorage.getItem('enablePerformanceMonitoring') === 'true';

/**
 * Enable or disable performance monitoring
 * @param {boolean} enable - Whether to enable monitoring
 */
function setEnabled(enable) {
  isEnabled = enable;
  if (enable) {
    localStorage.setItem('enablePerformanceMonitoring', 'true');
    log.info('Performance monitoring enabled');
  } else {
    localStorage.removeItem('enablePerformanceMonitoring');
    log.info('Performance monitoring disabled');
  }
}

/**
 * Start timing a performance metric
 * @param {string} name - Name of the metric
 * @param {string} type - Type of metric from METRIC_TYPES
 * @param {Object} [metadata] - Additional metadata about the metric
 * @returns {Function} Function to call when the operation completes
 */
function startMeasure(name, type, metadata = {}) {
  if (!isEnabled) return () => {};
  
  const startTime = performance.now();
  const measureId = `${type}_${name}_${Date.now()}`;
  
  // Return a function to call when the operation completes
  return (additionalMetadata = {}) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric(name, type, duration, {
      ...metadata,
      ...additionalMetadata,
      timestamp: new Date().toISOString(),
      measureId
    });
    
    return duration;
  };
}

/**
 * Record a performance metric
 * @param {string} name - Name of the metric
 * @param {string} type - Type of metric from METRIC_TYPES
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata about the metric
 */
function recordMetric(name, type, duration, metadata = {}) {
  if (!isEnabled) return;
  
  const metric = {
    name,
    duration,
    timestamp: metadata.timestamp || new Date().toISOString(),
    metadata
  };
  
  // Store metric based on type
  switch (type) {
    case METRIC_TYPES.COMPONENT_RENDER:
      if (!metrics.componentRenders[name]) {
        metrics.componentRenders[name] = {
          count: 0,
          totalDuration: 0,
          samples: []
        };
      }
      
      metrics.componentRenders[name].count++;
      metrics.componentRenders[name].totalDuration += duration;
      
      // Keep only the last 10 samples
      metrics.componentRenders[name].samples.push({
        duration, 
        timestamp: metadata.timestamp
      });
      
      if (metrics.componentRenders[name].samples.length > 10) {
        metrics.componentRenders[name].samples.shift();
      }
      
      break;
      
    case METRIC_TYPES.API_CALL:
      metrics.apiCalls.push(metric);
      
      // Limit array size to prevent memory issues
      if (metrics.apiCalls.length > 100) {
        metrics.apiCalls.shift();
      }
      
      // Log slow API calls
      if (duration > 1000) {
        log.warn(`Slow API call: ${name} took ${duration.toFixed(2)}ms`, metadata);
      }
      
      break;
      
    case METRIC_TYPES.INTERACTION:
      metrics.interactions.push(metric);
      
      // Limit array size to prevent memory issues
      if (metrics.interactions.length > 50) {
        metrics.interactions.shift();
      }
      
      break;
      
    case METRIC_TYPES.RESOURCE_LOAD:
      if (!metrics.resources[name]) {
        metrics.resources[name] = [];
      }
      
      metrics.resources[name].push({
        duration,
        timestamp: metadata.timestamp
      });
      
      // Keep only the last 5 samples
      if (metrics.resources[name].length > 5) {
        metrics.resources[name].shift();
      }
      
      break;
      
    case METRIC_TYPES.CUSTOM:
    default:
      if (!metrics.custom[name]) {
        metrics.custom[name] = [];
      }
      
      metrics.custom[name].push({
        duration,
        metadata
      });
      
      // Keep only the last 10 samples
      if (metrics.custom[name].length > 10) {
        metrics.custom[name].shift();
      }
  }
  
  // Report metric if necessary
  if (process.env.NODE_ENV === 'production' && window.performanceReporter) {
    window.performanceReporter.report(type, name, duration, metadata);
  }
  
  // Log metrics in development or when debugging is enabled
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('debugPerformance') === 'true') {
    log.debug(`${type}: ${name} - ${duration.toFixed(2)}ms`);
  }
}

/**
 * Get performance metrics summary
 * @returns {Object} Summary of collected metrics
 */
function getMetricsSummary() {
  if (!isEnabled) return null;
  
  const summary = {
    components: {},
    apiCalls: {
      total: metrics.apiCalls.length,
      avgDuration: 0,
      slowest: null
    },
    interactions: {
      total: metrics.interactions.length,
      types: {}
    }
  };
  
  // Component render metrics
  Object.keys(metrics.componentRenders).forEach(component => {
    const data = metrics.componentRenders[component];
    summary.components[component] = {
      count: data.count,
      avgDuration: data.totalDuration / data.count,
      lastSample: data.samples[data.samples.length - 1]?.duration || 0
    };
  });
  
  // API call metrics
  if (metrics.apiCalls.length > 0) {
    let totalDuration = 0;
    let slowestCall = { duration: 0 };
    
    metrics.apiCalls.forEach(call => {
      totalDuration += call.duration;
      if (call.duration > slowestCall.duration) {
        slowestCall = call;
      }
    });
    
    summary.apiCalls.avgDuration = totalDuration / metrics.apiCalls.length;
    summary.apiCalls.slowest = slowestCall;
  }
  
  // Interaction metrics
  metrics.interactions.forEach(interaction => {
    const type = interaction.metadata.interactionType || 'unknown';
    
    if (!summary.interactions.types[type]) {
      summary.interactions.types[type] = {
        count: 0,
        avgDuration: 0,
        totalDuration: 0
      };
    }
    
    summary.interactions.types[type].count++;
    summary.interactions.types[type].totalDuration += interaction.duration;
    summary.interactions.types[type].avgDuration = 
      summary.interactions.types[type].totalDuration / summary.interactions.types[type].count;
  });
  
  return summary;
}

/**
 * Clear all collected metrics
 */
function clearMetrics() {
  metrics.componentRenders = {};
  metrics.apiCalls = [];
  metrics.interactions = [];
  metrics.resources = {};
  metrics.custom = {};
  
  log.info('Performance metrics cleared');
}

/**
 * Monitor a React component's render time
 * @param {string} componentName - Name of the component
 * @param {Function} renderFunction - The render function to monitor
 * @returns {JSX.Element} The rendered component
 */
function monitorComponentRender(componentName, renderFunction) {
  if (!isEnabled) return renderFunction();
  
  const start = performance.now();
  const result = renderFunction();
  const duration = performance.now() - start;
  
  recordMetric(componentName, METRIC_TYPES.COMPONENT_RENDER, duration);
  
  return result;
}

/**
 * Create a higher-order component that monitors render performance
 * @param {React.Component} Component - Component to wrap
 * @param {string} [name] - Optional name (defaults to Component.displayName or Component.name)
 * @returns {React.Component} Wrapped component with performance monitoring
 */
function withPerformanceMonitoring(Component, name) {
  if (!isEnabled) return Component;
  
  const componentName = name || Component.displayName || Component.name || 'UnknownComponent';
  
  // Create a wrapped component
  const WrappedComponent = (props) => {
    const endMeasure = startMeasure(componentName, METRIC_TYPES.COMPONENT_RENDER);
    const result = Component(props);
    
    // Use requestIdleCallback to avoid blocking rendering
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => endMeasure());
    } else {
      setTimeout(() => endMeasure(), 0);
    }
    
    return result;
  };
  
  WrappedComponent.displayName = `WithPerformance(${componentName})`;
  return WrappedComponent;
}

/**
 * Track a single API call
 * @param {string} endpoint - API endpoint
 * @param {Function} apiCallFn - Function that returns a Promise for the API call
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise} Promise that resolves to the API call result
 */
async function trackApiCall(endpoint, apiCallFn, metadata = {}) {
  if (!isEnabled) return apiCallFn();
  
  const endMeasure = startMeasure(endpoint, METRIC_TYPES.API_CALL, metadata);
  
  try {
    const result = await apiCallFn();
    endMeasure({ success: true, responseSize: JSON.stringify(result).length });
    return result;
  } catch (error) {
    endMeasure({ success: false, error: error.message });
    throw error;
  }
}

/**
 * Track a user interaction
 * @param {string} interactionType - Type of interaction (click, scroll, etc.)
 * @param {string} elementId - ID of the element interacted with
 * @param {Function} handler - Function that handles the interaction
 * @param {Object} [metadata] - Additional metadata
 * @returns {Function} Wrapped handler function
 */
function trackInteraction(interactionType, elementId, handler, metadata = {}) {
  if (!isEnabled) return handler;
  
  return (...args) => {
    const endMeasure = startMeasure(
      elementId, 
      METRIC_TYPES.INTERACTION,
      { interactionType, ...metadata }
    );
    
    try {
      const result = handler(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            endMeasure({ success: true });
            return value;
          },
          (error) => {
            endMeasure({ success: false, error: error.message });
            throw error;
          }
        );
      }
      
      endMeasure({ success: true });
      return result;
    } catch (error) {
      endMeasure({ success: false, error: error.message });
      throw error;
    }
  };
}

/**
 * Track core web vitals using the web-vitals library if available
 */
function trackCoreWebVitals() {
  if (!isEnabled || typeof window === 'undefined') return;
  
  // Use web-vitals library if available
  if (window.webVitals) {
    const { getCLS, getFID, getLCP, getFCP, getTTFB } = window.webVitals;
    
    getCLS((metric) => {
      recordMetric('CLS', METRIC_TYPES.CUSTOM, metric.value * 1000, { 
        metricName: 'Cumulative Layout Shift',
        rawValue: metric.value
      });
    });
    
    getFID((metric) => {
      recordMetric('FID', METRIC_TYPES.CUSTOM, metric.value, { 
        metricName: 'First Input Delay' 
      });
    });
    
    getLCP((metric) => {
      recordMetric('LCP', METRIC_TYPES.CUSTOM, metric.value, { 
        metricName: 'Largest Contentful Paint' 
      });
    });
    
    getFCP((metric) => {
      recordMetric('FCP', METRIC_TYPES.CUSTOM, metric.value, { 
        metricName: 'First Contentful Paint' 
      });
    });
    
    getTTFB((metric) => {
      recordMetric('TTFB', METRIC_TYPES.CUSTOM, metric.value, { 
        metricName: 'Time to First Byte' 
      });
    });
  } else {
    // Fallback to Performance API
    if (window.performance && window.performance.getEntriesByType) {
      // Track navigation timing
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        recordMetric('PageLoad', METRIC_TYPES.CUSTOM, navEntry.loadEventEnd - navEntry.startTime, {
          metricName: 'Total Page Load Time',
          navigationTiming: {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            request: navEntry.responseStart - navEntry.requestStart,
            response: navEntry.responseEnd - navEntry.responseStart,
            dom: navEntry.domComplete - navEntry.domInteractive,
            domInteractive: navEntry.domInteractive - navEntry.fetchStart,
            loadEvent: navEntry.loadEventEnd - navEntry.loadEventStart
          }
        });
      }
    }
  }
}

// Automatically track web vitals when imported in production
if (process.env.NODE_ENV === 'production') {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => trackCoreWebVitals(), 2000);
    });
  }
}

export default {
  METRIC_TYPES,
  startMeasure,
  recordMetric,
  getMetricsSummary,
  clearMetrics,
  trackApiCall,
  trackInteraction,
  monitorComponentRender,
  withPerformanceMonitoring,
  setEnabled,
  isEnabled: () => isEnabled,
  trackCoreWebVitals
};
