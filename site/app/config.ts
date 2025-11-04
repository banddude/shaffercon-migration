/**
 * Centralized configuration for the site
 * This includes the base path for GitHub Pages deployment
 */

// Base path for GitHub Pages (should match next.config.mjs basePath)
export const BASE_PATH = '/shaffercon-migration';

// Helper function to prepend base path to any URL
export const withBasePath = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_PATH}/${cleanPath}`;
};

// Asset paths (for images, videos, etc.)
export const ASSET_PATH = (path: string): string => withBasePath(path);
