// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Importamos useAuth

const PrivateRoute = ({ children }) => {
    const { currentUser, isLoading } = useAuth(); // Usamos el contexto
    const location = useLocation();

    if (isLoading) {
        return <div>Cargando sesión (PrivateRoute)...</div>; // O un spinner de carga
    }

    if (!currentUser) {
        // Redirige al login, guardando la ubicación a la que intentaban acceder
        console.log("PrivateRoute: No hay usuario, redirigiendo a /login desde", location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children; // Si hay usuario, renderiza el contenido protegido (el Layout con sus rutas)
};

export default PrivateRoute;