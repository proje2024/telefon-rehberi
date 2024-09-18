import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {

    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'dark');

    useEffect(() => {
        const handler = (e) => {
            setMode(e.matches ? 'dark' : 'dark');
        };

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
        };
    }, []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'dark' && {
                background: {
                    default: '#1f1f1f',
                },
            }),
        },
    }), [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'dark'));
    };

    const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

ThemeContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

