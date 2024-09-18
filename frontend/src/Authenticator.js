import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AuthContext = createContext();

export const Authenticator = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem("token");

            if(token) {
                // Giriş yapıldıysa durumu güncelle
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }

            setLoading(false); // Yükleme durumu kapat
        };

        checkLoginStatus();
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    // useMemo kullanarak value prop'unu sarmala
    const value = useMemo(() => ({
        isLoggedIn,
        setIsLoggedIn,
        handleLoginSuccess,
        loading
    }), [isLoggedIn, handleLoginSuccess, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

Authenticator.propTypes = {
    children: PropTypes.node.isRequired
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default Authenticator;
