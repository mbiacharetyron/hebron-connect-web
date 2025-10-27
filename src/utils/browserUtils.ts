// Utility functions for browser login tracking

/**
 * Generate or retrieve a unique device ID for browser login tracking
 * Stores in localStorage for persistence across sessions
 */
export const getBrowserDeviceId = (): string => {
  const STORAGE_KEY = 'hc_browser_device_id';
  
  // Check if device ID already exists
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate a new unique device ID
    deviceId = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};

/**
 * Get human-readable browser and OS information
 */
export const getBrowserInfo = (): { deviceName: string; deviceType: string } => {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return {
    deviceName: `${browser} on ${os}`,
    deviceType: 'web',
  };
};

/**
 * Clear browser device ID (use when user logs out)
 */
export const clearBrowserDeviceId = (): void => {
  localStorage.removeItem('hc_browser_device_id');
};

