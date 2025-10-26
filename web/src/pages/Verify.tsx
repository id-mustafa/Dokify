import React, { useEffect, useState } from 'react';

const API_BASE = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000/v1';

export function Verify() {
    const [status, setStatus] = useState('');

    useEffect(() => {
        const url = new URL(window.location.href);
        const user_code = url.searchParams.get('user_code') || '';
        if (!user_code) {
            setStatus('Missing user_code');
            return;
        }
        fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ user_code })
        })
            .then(async (r) => {
                if (r.ok) setStatus('Approved! You can close this tab.');
                else setStatus('Invalid or expired code');
            })
            .catch(() => setStatus('Network error'));
    }, []);

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24 }}>
            <h1>Dokify Device Verification</h1>
            <p>{status}</p>
        </div>
    );
}


