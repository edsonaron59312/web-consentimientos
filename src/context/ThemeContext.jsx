// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Paso 1: Determinar el tema inicial de forma segura (sin localStorage aquí)
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light'; // Valor por defecto si window.matchMedia no está disponible
    });

    // Paso 2: Cargar el tema desde localStorage solo después de que el componente se monte (lado del cliente)
    useEffect(() => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme && storedTheme !== theme) { // Comprobar si storedTheme es diferente para evitar un bucle
                setThemeState(storedTheme);
            }
        }
    }, []); // El array vacío asegura que esto se ejecute solo una vez al montar

    // Paso 3: Sincronizar los cambios de tema con document.documentElement y localStorage
    useEffect(() => {
        if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]); // Se ejecuta cada vez que el estado 'theme' cambia

    const toggleTheme = () => {
        setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Usamos useMemo para evitar que el valor del contexto cambie innecesariamente
    const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
};
