import React, { useEffect, useState } from 'react';
import { api, setToken } from '../lib/api';
import { Button, Card, TextInput, PasswordInput, Title, Text, SegmentedControl, Group } from '@mantine/core';
import logo from '../public/dokify.png';

export function Login() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [success, setSuccess] = useState(false);

    // Capture token from OAuth callback (/#token=...)
    useEffect(() => {
        const hash = window.location.hash || '';
        const m = hash.match(/token=([^&]+)/);
        if (m && m[1]) {
            try {
                const t = decodeURIComponent(m[1]);
                setToken(t);
                setSuccess(true);
                // If device_code present (URL or stashed), approve device flow as this user
                try {
                    const params = new URLSearchParams(window.location.search);
                    const deviceCode = params.get('device_code') || (localStorage.getItem('dok_device_code') || '');
                    const apiBase = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000';
                    if (deviceCode) {
                        fetch(`${apiBase}/v1/oauth/approve`, {
                            method: 'POST',
                            headers: { 'content-type': 'application/json', authorization: `Bearer ${t}` },
                            body: JSON.stringify({ device_code: deviceCode })
                        }).catch(() => { });
                        try { localStorage.removeItem('dok_device_code'); } catch { }
                    }
                } catch { }
                window.history.replaceState({}, '', window.location.pathname);
                setTimeout(() => { window.location.href = '/projects'; }, 700);
            } catch { }
        }
        // If already logged in, redirect away from login
        try {
            const t = localStorage.getItem('dokify_token');
            if (t) window.location.href = '/projects';
        } catch { }
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const path = mode === 'login' ? '/v1/auth/login' : '/v1/auth/register';
            const payload = mode === 'login' ? { email, password } : { name, email, password };
            const res = await api(path, { method: 'POST', body: JSON.stringify(payload) });
            setToken(res.access_token);
            // Approve device flow if device_code is present
            try {
                const params = new URLSearchParams(window.location.search);
                const deviceCode = params.get('device_code') || (localStorage.getItem('dok_device_code') || '');
                const apiBase = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000';
                if (deviceCode) {
                    await fetch(`${apiBase}/v1/oauth/approve`, {
                        method: 'POST',
                        headers: { 'content-type': 'application/json', authorization: `Bearer ${res.access_token}` },
                        body: JSON.stringify({ device_code: deviceCode })
                    });
                    try { localStorage.removeItem('dok_device_code'); } catch { }
                }
            } catch { }
            setSuccess(true);
            setTimeout(() => { window.location.href = '/projects'; }, 900);
        } catch (e: any) {
            try {
                const msg = String(e?.message || '');
                // If API says email_in_use on register, suggest switching to Login mode
                if (mode === 'register' && msg.includes('409')) {
                    setMode('login');
                    setError('Account exists. Please login.');
                } else {
                    setError(mode === 'login' ? 'Invalid credentials' : 'Registration failed');
                }
            } catch {
                setError(mode === 'login' ? 'Invalid credentials' : 'Registration failed');
            }
        } finally { setLoading(false); }
    }

    return (
        <div>
            <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card shadow="md" padding="lg" radius="md" style={{ maxWidth: 460, width: '100%', background: 'linear-gradient(180deg,#0a0a0a,#000000)', border: '1px solid #1f2937' }}>
                    <Group justify="space-between" style={{ marginBottom: 8 }}>
                        <img onClick={() => window.location.href = '/'} src={logo} alt="Dokify" style={{
                            height: 180, width: 'auto', display: 'block', marginLeft: -170
                        }} />
                        <SegmentedControl
                            value={mode}
                            onChange={(v) => setMode(v as 'login' | 'register')}
                            data={[{ label: 'Login', value: 'login' }, { label: 'Register', value: 'register' }]}
                        />
                    </Group>
                    <Text c="dimmed" style={{ marginBottom: 16 }}>Access your projects and dokbase.</Text>
                    {success ? (
                        <div className="stack">
                            <Text c="green.4">Success! Redirecting…</Text>
                            <Group>
                                <Button color="blue" onClick={() => (window.location.href = '/projects')}>Open Dokbase</Button>
                                <Button variant="light" color="blue" onClick={() => window.close?.()}>Close Tab</Button>
                            </Group>
                            <Text c="dimmed" size="sm">You can return to your IDE/CLI or navigate to your dokbase now.</Text>
                        </div>
                    ) : (
                        <form className="stack" onSubmit={onSubmit}>
                            {mode === 'register' && <TextInput label="Name" value={name} onChange={e => setName(e.currentTarget.value)} required styles={{ input: { background: '#0e1422', color: 'white' } }} />}
                            <TextInput label="Email" type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} required styles={{ input: { background: '#0e1422', color: 'white' } }} />
                            <PasswordInput label="Password" value={password} onChange={e => setPassword(e.currentTarget.value)} required styles={{ input: { background: '#0e1422', color: 'white' } }} />
                            {error && <Text c="red.4">{error}</Text>}
                            <Button type="submit" loading={loading} color="blue">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
                            <Group>
                                <Button
                                    variant="light"
                                    color="blue"
                                    onClick={() => {
                                        const dc = new URLSearchParams(window.location.search).get('device_code');
                                        if (dc) try { localStorage.setItem('dok_device_code', dc); } catch { }
                                        window.location.href = `${(import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000'}/v1/oauth/github/start`;
                                    }}
                                    leftSection={<img alt="GitHub" src="https://cdn.simpleicons.org/github/fff" style={{ width: 16, height: 16 }} />}
                                >
                                    GitHub
                                </Button>
                                <Button
                                    variant="light"
                                    color="blue"
                                    onClick={() => {
                                        const dc = new URLSearchParams(window.location.search).get('device_code');
                                        if (dc) try { localStorage.setItem('dok_device_code', dc); } catch { }
                                        window.location.href = `${(import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000'}/v1/oauth/google/start`;
                                    }}
                                    leftSection={<img alt="Google" src="https://cdn.simpleicons.org/google/fff" style={{ width: 16, height: 16 }} />}
                                >
                                    Google
                                </Button>
                            </Group>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}

// registration is handled inline via mode === 'register'


