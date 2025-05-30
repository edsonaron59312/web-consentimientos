// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configurar Axios globalmente una vez si no lo has hecho
// Esto es importante para que todas las llamadas de axios incluyan credenciales
// y tengan la URL base correcta.
axios.defaults.baseURL = 'http://localhost:5000'; // Tu URL de Flask API
axios.defaults.withCredentials = true; // Para enviar cookies de sesión

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando la sesión

    useEffect(() => {
        const checkLoggedIn = async () => {
            setIsLoading(true);
            try {
                console.log("AuthProvider: Verificando sesión al cargar...");
                const response = await axios.get('/api/check_session');
                if (response.data.success && response.data.user) {
                    setCurrentUser(response.data.user);
                    console.log("AuthProvider: Sesión activa, usuario:", response.data.user);
                } else {
                    setCurrentUser(null);
                    console.log("AuthProvider: No hay sesión activa o check_session falló.");
                }
            } catch (error) {
                console.error("AuthProvider: Error verificando sesión o no hay sesión.", error.response ? error.response.data : error.message);
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = async (correo, contrasena) => {
        // No es necesario setIsLoading(true) aquí si el componente que llama maneja su propio estado de carga
        try {
            const response = await axios.post('/api/login', { correo, contrasena });
            if (response.data.success && response.data.user) {
                setCurrentUser(response.data.user);
                console.log("AuthProvider: Login exitoso", response.data.user);
                return response.data; // Devuelve los datos para que el componente sepa que fue exitoso
            } else {
                // El error será lanzado por la cláusula catch si la API devuelve un error HTTP (401, 400, etc.)
                // Si la API devuelve un 200 pero con success:false, lo manejamos aquí.
                throw new Error(response.data.message || "Error en el login desde AuthProvider");
            }
        } catch (error) {
            // Re-lanzar el error para que el componente que llama pueda manejarlo (ej. mostrar mensaje)
            console.error("AuthProvider: Error en login", error.response ? error.response.data : error.message);
            throw error;
        }
    };

    const logout = async () => {
        // No es necesario setIsLoading(true) aquí
        try {
            await axios.post('/api/logout');
            setCurrentUser(null);
            console.log("AuthProvider: Logout exitoso");
        } catch (error) {
            console.error("AuthProvider: Error en logout", error.response ? error.response.data : error.message);
            // A pesar del error, es buena idea limpiar el estado del usuario localmente
            setCurrentUser(null);
            // Podrías querer re-lanzar el error si necesitas manejarlo en el componente que llama
            // throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
