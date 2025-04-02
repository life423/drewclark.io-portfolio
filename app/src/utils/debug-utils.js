/**
 * Debug utilities for diagnosing deployment issues
 * 
 * This module provides functions for debugging environment discrepancies
 * between local and deployed environments, focusing on:
 * - Environment detection
 * - API connectivity checking
 * - DOM structure verification
 * - Feature detection
 */

import { config } from '../config';

// DOM element ID for the debug panel
const DEBUG_PANEL_ID = 'env-debug-panel';

/**
 * Creates a visual debug panel that displays environment info
 * This helps diagnose issues by making environment information visible
 */
export function createDebugPanel(options = {}) {
  const { 
    autoHide = true,     // Auto-hide after 60 seconds in production
    position = 'bottom-right',
    detailed = false
  } = options;
  
  // Only show in development or when forced
  if (config.environment.isProduction && !options.force) {
    console.log('Debug panel disabled in production. Set force:true to override.');
    return;
  }
  
  // Don't create multiple panels
  if (document.getElementById(DEBUG_PANEL_ID)) {
    console.log('Debug panel already exists.');
    return;
  }
  
  // Create the panel element
  const panel = document.createElement('div');
  panel.id = DEBUG_PANEL_ID;
  
  // Style the panel
  Object.assign(panel.style, {
    position: 'fixed',
    zIndex: '9999',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '10px',
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'auto',
    backdropFilter: 'blur(5px)'
  });
  
  // Set position
  if (position === 'top-right') {
    Object.assign(panel.style, { top: '10px', right: '10px' });
  } else if (position === 'top-left') {
    Object.assign(panel.style, { top: '10px', left: '10px' });
  } else if (position === 'bottom-left') {
    Object.assign(panel.style, { bottom: '10px', left: '10px' });
  } else {
    // Default: bottom-right
    Object.assign(panel.style, { bottom: '10px', right: '10px' });
  }
  
  // Get environment info
  const diagnostics = config.getDiagnostics();
  
  // Create content
  let content = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <strong>Env Debug</strong>
      <span style="cursor:pointer;" onclick="document.getElementById('${DEBUG_PANEL_ID}').remove()">✕</span>
    </div>
    <div style="margin-bottom:5px;">
      <strong>Environment:</strong> ${diagnostics.env.envType}
    </div>
    <div style="margin-bottom:5px;">
      <strong>Production:</strong> ${diagnostics.env.isProduction}
    </div>
    <div style="margin-bottom:5px;">
      <strong>Docker:</strong> ${diagnostics.env.isDocker}
    </div>
    <div style="margin-bottom:5px;">
      <strong>Deployed:</strong> ${diagnostics.env.isDeployedSite}
    </div>
  `;
  
  // Add detailed info if requested
  if (detailed) {
    content += `
      <hr style="border:0; border-top:1px solid #333; margin:5px 0;" />
      <div style="margin-bottom:5px;">
        <strong>URL:</strong> ${diagnostics.url}
      </div>
      <div style="margin-bottom:5px;">
        <strong>Screen:</strong> ${diagnostics.screenSize}
      </div>
      <div style="margin-bottom:5px;">
        <strong>Time:</strong> ${new Date().toLocaleTimeString()}
      </div>
      <div style="margin-bottom:5px;">
        <strong>User-Agent:</strong><br>${diagnostics.userAgent}
      </div>
      <hr style="border:0; border-top:1px solid #333; margin:5px 0;" />
      <div style="margin-bottom:5px;">
        <button 
          style="background:#222; color:#0f0; border:1px solid #444; padding:3px 8px; border-radius:4px; cursor:pointer; margin-right:5px;"
          onclick="window.runAPITest ? window.runAPITest() : alert('API test not available')"
        >
          Test API
        </button>
        <button 
          style="background:#222; color:#0f0; border:1px solid #444; padding:3px 8px; border-radius:4px; cursor:pointer;"
          onclick="document.getElementById('${DEBUG_PANEL_ID}').remove()"
        >
          Close
        </button>
      </div>
    `;
  }
  
  panel.innerHTML = content;
  
  // Add to document
  document.body.appendChild(panel);
  
  // Auto-hide in production
  if (autoHide && config.environment.isProduction) {
    setTimeout(() => {
      const panel = document.getElementById(DEBUG_PANEL_ID);
      if (panel) panel.remove();
    }, 60000); // 60 seconds
  }
  
  // Add API test function to window
  window.runAPITest = async () => {
    try {
      const panel = document.getElementById(DEBUG_PANEL_ID);
      if (panel) {
        panel.innerHTML += `<div style="color:yellow;">Testing API connection...</div>`;
      }
      
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (panel) {
        panel.innerHTML += `<div style="color:${response.ok ? '#0f0' : '#f00'};">
          Status: ${response.status} ${response.ok ? '✓' : '✗'}<br>
          Response: ${JSON.stringify(data)}
        </div>`;
      }
    } catch (error) {
      const panel = document.getElementById(DEBUG_PANEL_ID);
      if (panel) {
        panel.innerHTML += `<div style="color:#f00;">
          API Error: ${error.message}
        </div>`;
      }
    }
  };
  
  return panel;
}

/**
 * Log environment and component information to console
 * Useful for debugging without visual UI elements
 * 
 * @param {string} componentName - Name of the component logging info
 * @param {Object} extraData - Additional data to log
 */
export function logEnvironmentInfo(componentName, extraData = {}) {
  const diagnostics = config.getDiagnostics();
  
  console.group(`[${componentName}] Environment Info`);
  console.log('Environment:', diagnostics.env);
  console.log('URL:', diagnostics.url);
  console.log('Screen Size:', diagnostics.screenSize);
  console.log('Local Storage:', diagnostics.localStorage);
  
  if (Object.keys(extraData).length > 0) {
    console.log('Component Data:', extraData);
  }
  
  console.groupEnd();
  
  return diagnostics;
}

/**
 * Test API connectivity and log results
 * Useful for debugging API connection issues
 * 
 * @returns {Promise<Object>} Test results
 */
export async function testAPIConnectivity() {
  console.group('API Connectivity Test');
  
  try {
    console.log('Testing API connection...');
    const startTime = performance.now();
    
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    const data = await response.json();
    
    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      duration,
      timestamp: new Date().toISOString()
    };
    
    console.log(`API ${response.ok ? 'Connected' : 'Error'} (${duration}ms):`, result);
    console.groupEnd();
    
    return result;
  } catch (error) {
    const result = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    console.error('API Connection Failed:', result);
    console.groupEnd();
    
    return result;
  }
}

/**
 * Debug keyboard shortcut to toggle the debug panel
 * Press Ctrl+Shift+D to toggle
 */
export function setupDebugShortcut() {
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      const existingPanel = document.getElementById(DEBUG_PANEL_ID);
      
      if (existingPanel) {
        existingPanel.remove();
      } else {
        createDebugPanel({ detailed: true, force: true });
      }
      
      event.preventDefault();
    }
  });
}

// Export a default object with all utilities
export default {
  createDebugPanel,
  logEnvironmentInfo,
  testAPIConnectivity,
  setupDebugShortcut
};
