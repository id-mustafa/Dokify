import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../lib/api';

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const token = getToken();
    const loc = useLocation();
    if (!token) {
        return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
    }
    return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
    const token = getToken();
    if (token) {
        return <Navigate to="/projects" replace />;
    }
    return <>{children}</>;
}


