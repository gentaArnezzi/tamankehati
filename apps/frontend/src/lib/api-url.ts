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
  
  const baseUrl = getApiUrl();
  
  // CRITICAL: Check for localhost patterns FIRST (before any other checks)
  // This must happen before checking http/https to catch all localhost URLs
  // Use more aggressive pattern matching to catch all variations
  // Check for localhost in multiple ways to catch all cases
  const hasLocalhost = 
    normalizedPath.includes('localhost:8000') || 
    normalizedPath.includes('127.0.0.1:8000') ||
    normalizedPath.startsWith('http://localhost:8000') ||
    normalizedPath.startsWith('https://localhost:8000') ||
    normalizedPath.startsWith('http://127.0.0.1:8000') ||
    normalizedPath.startsWith('https://127.0.0.1:8000');
  
  if (hasLocalhost) {
    // Extract path from localhost URL - multiple strategies
    let pathOnly = '';
    let queryString = '';
    
    // Strategy 1: Try regex to extract /uploads/ path
    const uploadsRegex = /\/uploads\/[^?\s]*(?:\?[^\s]*)?/;
    const uploadsMatch = normalizedPath.match(uploadsRegex);
    if (uploadsMatch) {
      const fullPath = uploadsMatch[0];
      const queryIndex = fullPath.indexOf('?');
      if (queryIndex !== -1) {
        pathOnly = fullPath.substring(0, queryIndex);
        queryString = fullPath.substring(queryIndex);
      } else {
        pathOnly = fullPath;
      }
    } else {
      // Strategy 2: Try URL parsing
      try {
        const urlToParse = normalizedPath.startsWith('http') ? normalizedPath : `http://${normalizedPath}`;
        const urlObj = new URL(urlToParse);
        pathOnly = urlObj.pathname;
        queryString = urlObj.search;
      } catch (e) {
        // Strategy 3: Manual extraction
        const uploadsIndex = normalizedPath.indexOf('/uploads');
        if (uploadsIndex !== -1) {
          const afterUploads = normalizedPath.substring(uploadsIndex);
          const queryIndex = afterUploads.indexOf('?');
          if (queryIndex !== -1) {
            pathOnly = afterUploads.substring(0, queryIndex);
            queryString = afterUploads.substring(queryIndex);
          } else {
            pathOnly = afterUploads;
          }
        } else {
          // Strategy 4: Last resort - aggressive replacement
          const cleaned = normalizedPath.replace(/^https?:\/\/[^\/]+/, "").replace(/^[^\/]+/, "");
          const parts = cleaned.split('?');
          pathOnly = parts[0];
          queryString = parts[1] ? `?${parts[1]}` : '';
        }
      }
    }
    
    // Ensure path starts with /
    if (!pathOnly.startsWith('/')) {
      pathOnly = '/' + pathOnly;
    }
    
    // Final check: if pathOnly still contains localhost, extract again
    if (pathOnly.includes('localhost:8000') || pathOnly.includes('127.0.0.1:8000')) {
      const finalMatch = pathOnly.match(/\/uploads\/[^?\s]*/);
      if (finalMatch) {
        pathOnly = finalMatch[0];
      }
    }
    
    return `${baseUrl}${pathOnly}${queryString}`;
  }
  
  // Already a full URL (production URL)
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    // Double-check: even production URLs might have localhost embedded (shouldn't happen, but just in case)
    if (normalizedPath.includes('localhost:8000') || normalizedPath.includes('127.0.0.1:8000')) {
      const pathMatch = normalizedPath.match(/(\/uploads\/.*?)(?:\?|$)/);
      if (pathMatch) {
        return `${baseUrl}${pathMatch[1]}`;
      }
      return normalizedPath.replace(/https?:\/\/localhost:8000[^\/]*/, baseUrl)
                          .replace(/https?:\/\/127\.0\.0\.1:8000[^\/]*/, baseUrl);
    }
    // Return as-is for valid production URLs
    return normalizedPath;
  }
  
  // Relative path - prepend base URL
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

