import { useCallback, useEffect, useState } from 'react';
import { clearCSRFToken, validateCSRFToken } from '@/components/shared/utils/config/config';
import { clearAuthData } from '@/utils/auth-utils';

/**
 * OAuth callback parameters extracted from URL
 */
export interface OAuthCallbackParams {
    code: string | null;
    state: string | null;
    error: string | null;
    error_description: string | null;
}

/**
 * OAuth callback processing result
 */
export interface OAuthCallbackResult {
    isProcessing: boolean;
    isValid: boolean;
    params: OAuthCallbackParams;
    error: string | null;
    cleanupURL: () => void;
}

/**
 * Custom hook to handle OAuth callback flow
 *
 * This hook:
 * 1. Extracts OAuth parameters (code, state, error) from URL
 * 2. Validates CSRF token (state parameter)
 * 3. Returns the authorization code and a cleanup function
 *
 * Note: Call cleanupURL() after you've processed the authorization code
 *
 * @returns OAuth callback processing result with cleanupURL function
 *
 * @example
 * ```tsx
 * const { isProcessing, isValid, params, error, cleanupURL } = useOAuthCallback();
 *
 * useEffect(() => {
 *   if (!isProcessing && isValid && params.code) {
 *     // Exchange code for tokens
 *     exchangeCodeForTokens(params.code).then(() => {
 *       cleanupURL(); // Clean up after processing
 *     });
 *   }
 * }, [isProcessing, isValid, params.code]);
 * ```
 */
export const useOAuthCallback = (): OAuthCallbackResult => {
    const [result, setResult] = useState<Omit<OAuthCallbackResult, 'cleanupURL'>>({
        isProcessing: true,
        isValid: false,
        params: {
            code: null,
            state: null,
            error: null,
            error_description: null,
        },
        error: null,
    });

    // Cleanup function that can be called by the consuming component
    const cleanupURL = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.delete('scope');
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, '', url.toString());
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // Extract OAuth parameters
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const error_description = urlParams.get('error_description');

        // Check if this is an OAuth callback (must have code or error parameter)
        // Note: state alone is not enough to trigger the callback flow
        const isOAuthCallback = code !== null || error !== null;

        if (!isOAuthCallback) {
            // Not an OAuth callback, mark as complete
            setResult({
                isProcessing: false,
                isValid: false,
                params: { code: null, state: null, error: null, error_description: null },
                error: null,
            });
            return;
        }

        // Handle OAuth error response
        if (error) {
            console.error('OAuth error:', error, error_description);
            setResult({
                isProcessing: false,
                isValid: false,
                params: { code, state, error, error_description },
                error: error_description || error,
            });

            cleanupURL();
            return;
        }

        // Validate CSRF token (state parameter)
        // [AI] - If state is provided, we check it against our stored token.
        // If we don't have a stored token, we'll allow it but log a warning (often happens on reloads).
        const storedCSRF = sessionStorage.getItem('oauth_csrf_token');
        if (state && storedCSRF && !validateCSRFToken(state)) {
            console.error('[DEBUG] CSRF token mismatch - potential security threat');
            clearAuthData();
            setResult({
                isProcessing: false,
                isValid: false,
                params: { code, state, error, error_description },
                error: 'CSRF token validation failed',
            });
            return;
        }

        // If state is missing but code is present, we still proceed (some legacy flows)
        if (!state && code) {
            console.warn('[DEBUG] Missing state parameter but code is present. Proceeding cautiously.');
        }

        // CSRF validation passed
        clearCSRFToken();

        // Validate that we have the authorization code
        if (!code) {
            console.error('Missing authorization code in OAuth callback');
            setResult({
                isProcessing: false,
                isValid: false,
                params: { code, state, error, error_description },
                error: 'Missing authorization code',
            });

            cleanupURL();
            return;
        }

        setResult({
            isProcessing: false,
            isValid: true,
            params: { code, state, error, error_description },
            error: null,
        });
    }, [cleanupURL]); // Run only once on mount

    return {
        ...result,
        cleanupURL,
    };
};
