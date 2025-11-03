/**
 * Centralized API URL configuration
 *
 * Always use getApiUrl() to get the correct API base URL
 * Never hardcode localhost:8000 or production URLs in components!
 * 
 * Production URL fallback is intentionally kept for development environments
 * but should be replaced via NEXT_PUBLIC_API_URL environment variable in production.
 */

const PRODUCTION_API_URL = "https://tamankehati-backend-pxnu.onrender.com";

/**
 * Get the API base URL from environment variable
 * Defaults to production URL if not set
 * 
 * @returns The API base URL (without trailing slash)
 */
export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    PRODUCTION_API_URL
  );
}

/**
 * Build full API endpoint URL
 * 
 * @param path - API path (e.g., '/api/v1/flora' or 'api/v1/flora')
 * @returns Full URL to the API endpoint
 * 
 * @example
 * ```typescript
 * const url = apiUrl("/api/v1/parks");
 * // Returns: "https://tamankehati-backend-pxnu.onrender.com/api/v1/parks"
 * ```
 */
export function apiUrl(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Build full URL for uploaded images/files
 * Handles various URL formats and localhost replacements
 * 
 * @param path - Image path from API (e.g., '/uploads/image.jpg' or full URL)
 * @returns Full URL to the image or placeholder if path is invalid
 * 
 * @example
 * ```typescript
 * imageUrl("/uploads/photo.jpg")
 * // Returns: "https://tamankehati-backend-pxnu.onrender.com/uploads/photo.jpg"
 * 
 * imageUrl("http://localhost:8000/uploads/photo.jpg")
 * // Returns: "https://tamankehati-backend-pxnu.onrender.com/uploads/photo.jpg"
 * ```
 */
export function imageUrl(path: string | null | undefined): string {
  // Handle null/undefined
  if (!path) {
    // Return a valid fallback image URL instead of placeholder that might not exist
    return "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop";
  }
  
  // Normalize the path first - trim whitespace
  let normalizedPath = String(path).trim();
  
  // Handle empty string after trimming
  if (!normalizedPath || normalizedPath === "") {
    return "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop";
  }
  
  // CRITICAL: Check for localhost patterns FIRST (before any other checks)
  // This must happen before checking http/https to catch all localhost URLs
  const localhostPatterns = [
    /http:\/\/localhost:8000/gi,
    /https:\/\/localhost:8000/gi,
    /http:\/\/127\.0\.0\.1:8000/gi,
    /https:\/\/127\.0\.0\.1:8000/gi,
  ];
  
  for (const pattern of localhostPatterns) {
    if (pattern.test(normalizedPath)) {
      const baseUrl = getApiUrl();
      try {
        const urlObj = new URL(normalizedPath);
        // Extract pathname and search params, replace host with production URL
        return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
      } catch (e) {
        // If URL parsing fails (invalid URL), do simple string replacement
        const pathOnly = normalizedPath.replace(/^https?:\/\/[^\/]+/, "");
        return `${baseUrl}${pathOnly}`;
      }
    }
  }
  
  // Already a full URL (production URL)
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    // Return as-is for valid production URLs
    return normalizedPath;
  }
  
  // Relative path - prepend base URL
  const baseUrl = getApiUrl();
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Replace localhost URLs with current API URL
 * Useful for migrating old URLs in data
 * 
 * @param url - URL that may contain localhost
 * @returns URL with localhost replaced by current API URL
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  
  // Replace common localhost patterns
  const localhostPatterns = [
    /http:\/\/localhost:8000/g,
    /http:\/\/127\.0\.0\.1:8000/g,
    /https:\/\/localhost:8000/g,
  ];
  
  let normalized = url;
  const baseUrl = getApiUrl();
  
  localhostPatterns.forEach((pattern) => {
    normalized = normalized.replace(pattern, baseUrl);
  });
  
  return normalized;
}

/**
 * API Base URL constant (for backward compatibility)
 * Note: This is evaluated once at module load time
 * Use getApiUrl() function if you need runtime evaluation
 */
export const API_BASE_URL = getApiUrl();
