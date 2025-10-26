import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './pages/App';
import { Verify } from './pages/Verify';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { ProjectDocs } from './pages/ProjectDocs';
import { AppLayout } from './layouts/AppLayout';
import { Visualize } from './pages/Visualize';
import { Usage } from './pages/Usage';
import { Account } from './pages/Account';
import { DokAgent } from './pages/DokAgent';
import { RequireAuth, RedirectIfAuthed } from './routes/Protected';


const router = createBrowserRouter([
    { path: '/login', element: <RedirectIfAuthed><Login /></RedirectIfAuthed> },
    { path: '/verify', element: <Verify /> },
    {
        path: '/',
        element: <AppLayout><App /></AppLayout>
    },
    {
        path: '/usage',
        element: <AppLayout><Usage /></AppLayout>
    },
    {
        path: '/usage/:section',
        element: <AppLayout><Usage /></AppLayout>
    },
    {
        path: '/projects',
        element: <RequireAuth><AppLayout><Projects /></AppLayout></RequireAuth>
    },
    {
        path: '/projects/:id',
        element: <RequireAuth><AppLayout><ProjectDocs /></AppLayout></RequireAuth>
    },
    {
        path: '/projects/:id/visualize',
        element: <RequireAuth><AppLayout><Visualize /></AppLayout></RequireAuth>
    },
    {
        path: '/visualize',
        element: <RequireAuth><AppLayout><Visualize /></AppLayout></RequireAuth>
    },
    {
        path: '/account/me',
        element: <RequireAuth><AppLayout><Account /></AppLayout></RequireAuth>
    },
    {
        path: '/agent',
        element: <RequireAuth><AppLayout><DokAgent /></AppLayout></RequireAuth>
    }
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}


