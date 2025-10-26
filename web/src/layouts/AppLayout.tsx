import React from 'react';
import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { getToken, clearToken } from '../lib/api';
import logo from '../public/dokify.png';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [opened, setOpened] = React.useState(false);
    const location = useLocation();
    const active = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
    const [isAuthed, setIsAuthed] = React.useState(!!getToken());
    React.useEffect(() => {
        const onChange = () => setIsAuthed(!!getToken());
        window.addEventListener('dok:auth-changed', onChange);
        return () => window.removeEventListener('dok:auth-changed', onChange);
    }, []);
    return (
        <AppShell
            header={{ height: 56 }}
            navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
            withBorder
            styles={{ main: { background: 'var(--bg)', color: 'var(--text)' } }}
        >
            <AppShell.Header style={{ background: '#0a0a0a', borderBottom: '1px solid #1f1f1f' }}>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />
                        <div style={{ height: 30, overflow: 'hidden', display: 'block' }}>
                            <img
                                src={logo}
                                alt="Dokify"
                                style={{ display: 'block', height: 50, width: 'auto', marginTop: -10, marginLeft: -40 }}
                            />
                        </div>
                    </Group>
                    {isAuthed ? (
                        <a className="link" href="#" onClick={(e) => { e.preventDefault(); clearToken(); window.location.href = '/login'; }}>Logout</a>
                    ) : (
                        <Link className="link" to="/login">Login</Link>
                    )}
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="lg" style={{ background: '#0a0a0a', borderRight: 'solid #1f1f1f 1px' }}>
                <AppShell.Section>
                    <NavLink component={Link} to="/" label="Home" active={active('/')} />
                    <NavLink component={Link} to="/usage" label="Usage" active={active('/usage')} />
                    {isAuthed && <NavLink component={Link} to="/projects" label="Projects" active={active('/projects')} />}
                    {isAuthed && <NavLink component={Link} to="/DokAgent" label="DokAgent" active={active('/dokagent')} />}
                    {isAuthed && <NavLink component={Link} to="/Visualizer" label="Visualizer" active={active('/visualizer')} />}
                </AppShell.Section>
                <AppShell.Section grow />
                {isAuthed && (
                    <AppShell.Section>
                        <NavLink component={Link} to={isAuthed ? '/account/me' : '/login'} label="Account" active={active('/account/me')} />
                    </AppShell.Section>
                )}
            </AppShell.Navbar>
            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}


