import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Helper function to extract IP address from request
export function getClientIP(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  
  if (xForwardedFor) {
    if (Array.isArray(xForwardedFor)) {
      return xForwardedFor[0];
    }
    return xForwardedFor.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] as string ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '127.0.0.1';
}

// Helper function to parse user agent
export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }
  
  // Browser detection
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('edg')) browser = 'edge';
  else if (ua.includes('opera')) browser = 'opera';
  
  // Operating system detection
  let operatingSystem = 'unknown';
  if (ua.includes('windows')) operatingSystem = 'windows';
  else if (ua.includes('mac')) operatingSystem = 'macos';
  else if (ua.includes('linux')) operatingSystem = 'linux';
  else if (ua.includes('android')) operatingSystem = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) operatingSystem = 'ios';
  
  return { deviceType, browser, operatingSystem };
}

// Middleware to track user activity
export async function trackUserActivity(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const user = req.user as any;
      const ip = getClientIP(req);
      const userAgent = req.headers['user-agent'] || '';
      const { deviceType, browser, operatingSystem } = parseUserAgent(userAgent);
      const referrer = req.headers.referer || req.headers.referrer || '';
      
      // Update user information with tracking data
      await storage.updateUserTrackingInfo(user.id, {
        lastIpAddress: ip,
        userAgent,
        deviceType,
        browser,
        operatingSystem,
        referrer
      });
    }
  } catch (error) {
    console.error('Error tracking user activity:', error);
    // Continue execution even if tracking fails
  }
  
  next();
}

// Function to get geolocation from IP (mock implementation)
export async function getGeolocationFromIP(ip: string) {
  // In a real implementation, you would use a service like:
  // - ipapi.co
  // - ipinfo.io
  // - geoip-lite npm package
  // For now, we'll return mock data for demonstration
  
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: 'Local',
      city: 'Local Network',
      region: 'Private'
    };
  }
  
  // Mock geolocation data for demo purposes
  const mockLocations = [
    { country: 'United States', city: 'New York', region: 'NY' },
    { country: 'United Kingdom', city: 'London', region: 'England' },
    { country: 'Canada', city: 'Toronto', region: 'ON' },
    { country: 'Germany', city: 'Berlin', region: 'Berlin' },
    { country: 'Australia', city: 'Sydney', region: 'NSW' }
  ];
  
  // Use IP hash to consistently return same location for same IP
  const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
  return mockLocations[hash % mockLocations.length];
}