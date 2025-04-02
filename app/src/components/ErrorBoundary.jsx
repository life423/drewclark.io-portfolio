import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';

/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
    
    // Create a module-specific logger
    this.logger = logger.getLogger('ErrorBoundary');
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service
    this.logger.error(`Error caught: ${error.message}`, null, error, errorInfo);
    this.setState({ errorInfo });
    
    // Report to an error tracking service if available
    if (process.env.NODE_ENV === 'production' && window.errorReporter) {
      window.errorReporter.captureException(error, { extra: errorInfo });
    }
    
    // Execute the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, errorInfo) 
          : fallback;
      }
      
      // Default error UI
      return (
        <div className="error-boundary p-4 m-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-2">
            We're sorry, but an error occurred. Try refreshing the page.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-2">
              <details className="text-sm text-gray-700">
                <summary className="cursor-pointer font-medium mb-1">
                  Error details
                </summary>
                <p className="mb-1 font-mono bg-gray-100 p-2 rounded">
                  {error?.toString()}
                </p>
                {errorInfo && (
                  <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded max-h-48">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </details>
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func
};

export default ErrorBoundary;
