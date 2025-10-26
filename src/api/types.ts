export type DeviceStartResponse = {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete?: string;
    expires_in: number;
    interval?: number;
};

export type TokenSuccessResponse = {
    access_token: string;
    refresh_token?: string;
    token_type: 'Bearer';
    expires_in: number;
    scope?: string;
};

export type TokenPendingResponse = {
    error: 'authorization_pending' | 'slow_down' | 'expired_token' | 'access_denied' | 'invalid_request';
    error_description?: string;
    interval?: number;
};

export type MeResponse = {
    id: string;
    email: string;
    name?: string;
    org?: { id: string; name: string };
};


