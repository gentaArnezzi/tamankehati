/**
 * HTML Sanitization Utility using DOMPurify
 * 
 * This utility provides safe HTML sanitization to prevent XSS attacks.
 * All user-generated content should be sanitized before being rendered
 * with dangerouslySetInnerHTML.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - Unsanitized HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 * 
 * @example
 * ```tsx
 * const sanitized = sanitizeHtml(userContent);
 * <div dangerouslySetInnerHTML={{ __html: sanitized }} />
 * ```
 */
export function sanitizeHtml(
  dirty: string | null | undefined,
  options?: {
    /** Allow specific HTML tags (default: most common safe tags) */
    allowedTags?: string[];
    /** Allow specific HTML attributes */
    allowedAttributes?: { [key: string]: string[] };
    /** Additional DOMPurify config */
    config?: DOMPurify.Config;
  }
): string {
  if (!dirty) {
    return '';
  }

  // Default safe configuration
  const defaultConfig: DOMPurify.Config = {
    // Allow common safe HTML tags
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span', 'hr'
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id',
      'width', 'height', 'target', 'rel'
    ],
    // Allow data attributes if needed
    ALLOW_DATA_ATTR: false,
    // Sanitize URLs in href and src
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Add rel="noopener noreferrer" to external links
    ADD_ATTR: ['target'],
    // Add target="_blank" to links that don't have target
    FORBID_ATTR: ['style'], // Disallow inline styles by default
  };

  // Merge user options with defaults
  const config: DOMPurify.Config = {
    ...defaultConfig,
    ...options?.config,
    ALLOWED_TAGS: options?.allowedTags || defaultConfig.ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttributes 
      ? Object.values(options.allowedAttributes).flat()
      : defaultConfig.ALLOWED_ATTR,
  };

  // Sanitize the HTML
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize HTML with more permissive settings for rich content
 * (e.g., articles, announcements with formatting needs)
 * 
 * @param dirty - Unsanitized HTML string
 * @returns Sanitized HTML string with more formatting options
 */
export function sanitizeHtmlRich(dirty: string | null | undefined): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span', 'hr', 'sub', 'sup', 'mark', 'del', 'ins'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'id']
    },
    config: {
      ADD_ATTR: ['target'],
    }
  });
}

/**
 * Sanitize HTML with strict settings (only basic formatting)
 * 
 * @param dirty - Unsanitized HTML string
 * @returns Sanitized HTML string with minimal formatting
 */
export function sanitizeHtmlStrict(dirty: string | null | undefined): string {
  return sanitizeHtml(dirty, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a'],
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel']
    }
  });
}

