/**
 * Centralized constants for the application
 * 
 * This file contains all magic numbers, timeouts, delays, and other constants
 * to ensure consistency and easy maintenance across the codebase.
 */

// ============================================================================
// TOUR & ONBOARDING TIMEOUTS
// ============================================================================

/**
 * Delay before starting onboarding tour for new users (in milliseconds)
 * Gives users time to see the dashboard before tour starts
 */
export const TOUR_DELAY_MS = 3500;

/**
 * Delay when resetting/restarting tour (in milliseconds)
 * Small delay to ensure state cleanup is complete
 */
export const TOUR_RESET_DELAY_MS = 300;

/**
 * Timeout for waiting for DOM elements to appear (in milliseconds)
 * Used in tour navigation and dynamic content loading
 */
export const ELEMENT_WAIT_TIMEOUT_MS = 5000;

/**
 * Delay between navigation and next action (in milliseconds)
 * Allows page to fully render before proceeding
 */
export const NAVIGATION_DELAY_MS = 300;

/**
 * Timeout for waiting for form elements (in milliseconds)
 * Used in tour form guidance steps
 */
export const FORM_ELEMENT_WAIT_TIMEOUT_MS = 3000;

// ============================================================================
// NOTIFICATION & POLLING
// ============================================================================

/**
 * Interval for fetching pending approval counts (in milliseconds)
 * Polls backend every 30 seconds for new approvals
 */
export const PENDING_APPROVAL_POLL_INTERVAL_MS = 30000;

// ============================================================================
// UI ANIMATION & TRANSITIONS
// ============================================================================

/**
 * Standard transition duration for UI animations (in milliseconds)
 */
export const TRANSITION_DURATION_MS = 300;

/**
 * Standard sidebar transition duration (in milliseconds)
 */
export const SIDEBAR_TRANSITION_DURATION_MS = 300;

// ============================================================================
// FORM & SUBMISSION DELAYS
// ============================================================================

/**
 * Delay after form submission before showing success message (in milliseconds)
 */
export const FORM_SUBMISSION_FEEDBACK_DELAY_MS = 1500;

// ============================================================================
// API & NETWORK
// ============================================================================

/**
 * Default timeout for API requests (in milliseconds)
 * Can be overridden per-request if needed
 */
export const DEFAULT_API_TIMEOUT_MS = 30000;

/**
 * Maximum retry attempts for failed API requests
 */
export const MAX_API_RETRY_ATTEMPTS = 3;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * LocalStorage key for authentication token
 */
export const AUTH_TOKEN_KEY = "auth_token";

/**
 * LocalStorage key for user data
 */
export const AUTH_USER_KEY = "auth_user";

/**
 * LocalStorage key for user email
 */
export const AUTH_EMAIL_KEY = "auth_email";

/**
 * LocalStorage key prefix for tour completion status
 */
export const TOUR_COMPLETED_KEY_PREFIX = "tour_completed_";

/**
 * LocalStorage key for onboarding current step
 */
export const ONBOARDING_CURRENT_STEP_KEY = "onboarding_current_step";

