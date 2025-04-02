/**
 * Client-side environment configuration
 * 
 * This file centralizes environment-specific settings and provides
 * runtime environment detection to help diagnose deployment issues.
 */

// Detect runtime environment based on various signals
const detectEnvironment = () => {
  // Check if we're in a production build
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check for Docker container environment variable
  const isDocker = typeof window !== 'undefined' && 
    window.ENV_DOCKER_CONTAINER === 'true';
  
  // Check for hostname-based environment
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDeployedSite = hostname.includes('drewclark.io') || 
    hostname.includes('azurewebsites.net');
  
  // Determine environment type
  let envType = 'development';
  if (isProduction && (isDocker || isDeployedSite)) {
    envType = 'production';
  } else if (isProduction) {
    envType = 'production-local';
  } else if (isDocker) {
    envType = 'development-docker';
  }

  // Check for mobile or desktop
  const isMobile = typeof window !== 'undefined' && 
    window.matchMedia('(max-width: 768px)').matches;
  
  // Log environment details to help with debugging deployment issues
  console.log('Environment Configuration:', {
    envType,
    isProduction,
    isDocker,
    isDeployedSite,
    hostname,
    isMobile,
    windowDimensions: typeof window !== 'undefined' ? 
      { width: window.innerWidth, height: window.innerHeight } : 
      { width: 0, height: 0 }
  });
  
  return {
    envType,
    isProduction,
    isDocker,
    isDeployedSite,
    isMobile
  };
};

const environment = detectEnvironment();

// API configuration
const apiConfig = {
  baseUrl: environment.isDeployedSite ? 
    '/api' : // Use relative URL in production
    'http://localhost:3001/api', // Use absolute URL in development for better error messages
  
  timeout: environment.isProduction ? 15000 : 30000, // Shorter timeout in production
  
  // Feature flags - can be used to disable features in specific environments
  features: {
    enableProjectChat: true,
    enableHeroAnimation: !environment.isMobile, // Disable on mobile for performance
    enableDebugging: !environment.isProduction
  }
};

// Export the detected environment and configurations
export const config = {
  environment,
  api: apiConfig,
  
  // Function to get detailed diagnostics for debugging deployment issues
  getDiagnostics: () => {
    if (typeof window === 'undefined') {
      return 'Server-side rendering - window not available';
    }
    
    return {
      env: environment,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      cookiesEnabled: window.navigator.cookieEnabled,
      localStorage: window.localStorage ? 'available' : 'unavailable',
    };
  }
};

// Helper function to inject environment info into API requests
export const withEnvironmentInfo = (data) => {
  return {
    ...data,
    _env: {
      type: environment.envType,
      isProduction: environment.isProduction
    }
  };
};

export default config;
