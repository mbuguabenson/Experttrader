import { DerivWSAccountsService, DerivAccount } from './derivws-accounts.service';

/**
 * Service to handle Legacy Deriv API login (via URL parameters acct1, token1, etc.)
 */
export class LegacyAuthService {
    /**
     * Checks the URL for legacy auth parameters and handles them if found
     * @returns true if legacy auth was processed, false otherwise
     */
    static checkAndHandleLegacyAuth(): boolean {
        const urlParams = new URLSearchParams(window.location.search);
        const acct1 = urlParams.get('acct1');
        const token1 = urlParams.get('token1');

        if (!acct1 || !token1) {
            return false;
        }

        console.log('[LegacyAuth] Detected legacy login parameters. Processing...');

        const accounts: DerivAccount[] = [];
        const accountsListMap: Record<string, string> = {};

        // Loop through potential accounts (usually up to 10 or 20)
        for (let i = 1; i <= 20; i++) {
            const acc = urlParams.get(`acct${i}`);
            const token = urlParams.get(`token${i}`);
            const cur = urlParams.get(`cur${i}`) || 'USD';

            if (acc && token) {
                const isDemo = acc.startsWith('VRT') || acc.startsWith('VRTC');
                accounts.push({
                    account_id: acc,
                    balance: '0', // Will be updated after authorization
                    currency: cur,
                    group: isDemo ? 'demo' : 'real',
                    status: 'active',
                    account_type: isDemo ? 'demo' : 'real'
                });
                accountsListMap[acc] = token;
            } else {
                break; // Stop at first missing account
            }
        }

        if (accounts.length > 0) {
            // 1. Store accounts in the format expected by DerivWSAccountsService
            DerivWSAccountsService.storeAccounts(accounts);

            // 2. Store tokens in the legacy format expected by bot-skeleton/appId.js
            localStorage.setItem('accountsList', JSON.stringify(accountsListMap));

            // 3. Store account details in clientAccounts for ClientStore and Header
            const clientAccountsMap: Record<string, any> = {};
            accounts.forEach(acc => {
                clientAccountsMap[acc.account_id] = {
                    currency: acc.currency,
                    account_type: acc.account_type,
                    token: accountsListMap[acc.account_id]
                };
            });
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccountsMap));

            // 4. Set active account (usually the first one)
            const firstAccount = accounts[0];
            localStorage.setItem('active_loginid', firstAccount.account_id);
            localStorage.setItem('account_type', firstAccount.account_type);

            // 4. Create a dummy auth_info to satisfy the modern Auth check
            // We use the first token as the "access_token" for the app's state
            const authInfo = {
                access_token: token1,
                token_type: 'bearer',
                expires_in: 3600 * 24, // 24 hours for legacy tokens usually
                expires_at: Date.now() + 3600 * 24 * 1000,
                scope: 'trade'
            };
            sessionStorage.setItem('auth_info', JSON.stringify(authInfo));

            console.log('[LegacyAuth] Legacy accounts stored. Redirecting to clean URL...');
            
            // Clean up the URL
            const cleanUrl = new URL(window.location.href);
            cleanUrl.search = '';
            window.history.replaceState({}, '', cleanUrl.toString());

            return true;
        }

        return false;
    }
}
