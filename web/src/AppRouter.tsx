import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './pages/App';
import { Verify } from './pages/Verify';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { ProjectDocs } from './pages/ProjectDocs';
import { AppLayout } from './layouts/AppLayout';
import { Usage } from './pages/Usage';
import { Account } from './pages/Account';
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
        path: '/account/me',
        element: <RequireAuth><AppLayout><Account /></AppLayout></RequireAuth>
    }
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}


