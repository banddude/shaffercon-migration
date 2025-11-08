/**
 * Centralized configuration for the site
 * Updated for custom domain (shaffercon.com) - no base path needed
 */

// No base path needed for custom domain
export const BASE_PATH = '';

// Helper function to prepend base path to any URL
export const withBasePath = (path: string): string => {
  // Ensure the path starts with /
  return path.startsWith('/') ? path : `/${path}`;
};

// Asset paths (for images, videos, etc.)
export const ASSET_PATH = (path: string): string => withBasePath(path);
