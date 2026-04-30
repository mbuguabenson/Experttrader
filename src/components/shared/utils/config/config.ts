import { DerivWSAccountsService } from '@/services/derivws-accounts.service';
import { OAuthTokenExchangeService } from '@/services/oauth-token-exchange.service';
import { isProduction } from '@/utils/auth-helpers';
import { isDemoAccount } from '@/utils/account-helpers';
import brandConfig from '../../../../../brand.config.json';

// Export these for backward compatibility in imports
export { 
    isProduction, 
    isLocal, 
    validateCSRFToken, 
    clearCSRFToken, 
    clearCodeVerifier, 
    getCodeVerifier 
} from '@/utils/auth-helpers';

// =============================================================================
// Constants - Server Configuration
// =============================================================================

// WebSocket server URLs
export const WS_SERVERS = {
    STAGING: `${brandConfig.platform.derivws.url.staging}options/ws/public?app_id=${process.env.APP_ID || '113831'}`,
    PRODUCTION: `${brandConfig.platform.derivws.url.production}options/ws/public?app_id=${process.env.APP_ID || '113831'}`,
} as const;

// Helper to get default server URL based on production check and active account
const getDefaultServerURL = () => {
    // 1. Check if we have an active account in storage
    const activeLoginId = localStorage.getItem('active_loginid');
    if (activeLoginId) {
        return isDemoAccount(activeLoginId) ? WS_SERVERS.STAGING : WS_SERVERS.PRODUCTION;
    }

    // 2. Fallback to domain-based detection
    const isProductionEnv = isProduction();
    return isProductionEnv ? WS_SERVERS.PRODUCTION : WS_SERVERS.STAGING;
};

/**
 * Gets the WebSocket URL using the new authenticated flow
 */
export const getSocketURL = async (): Promise<string> => {
    try {
        // Check if user is authenticated
        const authInfo = OAuthTokenExchangeService.getAuthInfo();
        if (!authInfo || !authInfo.access_token) {
            return getDefaultServerURL();
        }

        // Handle Legacy tokens (starting with a1-)
        if (authInfo.access_token.startsWith('a1-')) {
            return getDefaultServerURL();
        }

        // Use the DerivWSAccountsService to get authenticated WebSocket URL
        const wsUrl = await DerivWSAccountsService.getAuthenticatedWebSocketURL(authInfo.access_token);
        return wsUrl;
    } catch (error) {
        console.error('[DerivWS] Error in getSocketURL:', error);
        return getDefaultServerURL();
    }
};

export const getDebugServiceWorker = () => {
    const flag = window.localStorage.getItem('debug_service_worker');
    return flag ? !!parseInt(flag) : false;
};

// OAuth URL generation moved to OAuthTokenExchangeService to avoid circularity
export const generateOAuthURL = async (prompt?: string) => {
    return OAuthTokenExchangeService.generateOAuthURL(prompt);
};
