import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import SuperTokens from 'supertokens-react-native';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.API_BASE_URL || "http://localhost:5000", // Replace with your actual API base URL
    prepareHeaders: async (headers) => {
        // Automatically injects custom anti-csrf headers if SuperTokens requires them
        headers.set('rid', 'session');
        // Lets the backend build emailed links (password reset, email
        // verification) against this app's own domain rather than the web
        // app's — see back/src/lib/supertokens.ts.
        headers.set('x-platform', 'native');
        return headers;
    },
});

export const baseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // 1. Ensure credentials (cookies/tokens) are handled if using standard CORS
    if (typeof args === 'string') {
        args = { url: args, credentials: 'include' };
    } else {
        args.credentials = 'include';
    }

    // 2. Execute the initial request
    let result = await rawBaseQuery(args, api, extraOptions);

    // 3. If the backend returns a 401, attempt to refresh the session
    if (result.error && result.error.status === 401) {
        try {
            // This triggers the SuperTokens SDK to refresh the access token via backend /auth/session/refresh
            const refreshAttempt = await SuperTokens.attemptRefreshingSession();
            
            if (refreshAttempt) {
                // Retry the original request with the fresh token session
                result = await rawBaseQuery(args, api, extraOptions);
            } else {
                // Session is fully expired, force logout state
                await SuperTokens.signOut();
            }
        } catch (refreshError) {
            // Throws on network/server failures; a dead session returns false
            // above. Don't sign the user out over a transient failure.
            return { error: { status: 'FETCH_ERROR', error: 'Could not refresh the session' } };
        }
    }

    return result;
};
