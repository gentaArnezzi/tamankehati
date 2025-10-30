/**
 * Centralized API URL configuration
 * 
 * Always use getApiUrl() to get the correct API base URL
 * Never hardcode localhost:8000 in components!
 */

/**
 * Get the API base URL from environment variable
 * Defaults to production URL if not set
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com';
}

/**
 * Build full API endpoint URL
 * @param path - API path (e.g., '/api/v1/flora' or 'api/v1/flora')
 * @returns Full URL to the API endpoint
 */
export function apiUrl(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Build full URL for uploaded images/files
 * @param path - Image path from API (e.g., '/uploads/image.jpg')
 * @returns Full URL to the image
 */
export function imageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Already full URL
  }
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * API Base URL constant (for backward compatibility)
 */
export const API_BASE_URL = getApiUrl();

