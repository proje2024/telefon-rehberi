import React from 'react';
import { useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Navigation from '../Navigation/Navigation';
import './NavBarComponent.css';
import { Link, Typography } from '@mui/material';

const AppBarComponent = () => {
    const location = useLocation();
    return (
        <AppBar position="fixed" className="app-bar">
            <Toolbar className="styled-toolbar">
                {(location.pathname === '/home') && (
                    <Link href="/home" color="inherit" underline="none">
                        <Typography variant="p" className="main-app-name">Telefon Rehberi</Typography>
                    </Link>
                )}
                <Toolbar className="styled-right-toolbar">
                    <Navigation />
                </Toolbar>
            </Toolbar>
        </AppBar>
    );
};

export default AppBarComponent;
