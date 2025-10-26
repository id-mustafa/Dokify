import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './AppRouter';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './theme.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const container = document.getElementById('root')!;
createRoot(container).render(
    <MantineProvider defaultColorScheme="dark" theme={{ primaryColor: 'gray' }}>
        <Notifications position="top-right" />
        <AppRouter />
    </MantineProvider>
);


