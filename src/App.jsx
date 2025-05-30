// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Componentes de autenticación y estructura
import AuthForm from './components/AuthForm.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Layout from './components/Layout.jsx';

// Componentes de las páginas/secciones
import DashboardHome from './components/DashboardHome.jsx';
import RegistroForm from './components/RegistroForm.jsx';
import RegistrosTable from './components/RegistrosTable.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ManageUsers from './components/ManageUsers.jsx';
import AuditoriaLogs from './components/AuditoriaLogs.jsx'; // <<<--- 1. IMPORTA EL COMPONENTE

function NotFoundInsideLayout() {
    return (
        <div className="text-center mt-5">
            <h2>Página no encontrada</h2>
            <p>La sección que buscas dentro de la aplicación no existe.</p>
            <Link to="/">Ir al Dashboard Home</Link>
        </div>
    );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública para el Login */}
        <Route path="/login" element={<AuthForm />} />

        {/* Rutas protegidas que usan el Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout /> {/* Layout ahora contiene el <Outlet/> para las rutas hijas */}
            </PrivateRoute>
          }
        >
          {/* Estas son las rutas anidadas que se renderizarán dentro del <Outlet /> de Layout */}
          <Route index element={<DashboardHome />} /> {/* Se muestra en "/" */}
          <Route path="registrar" element={<RegistroForm />} />
          <Route path="registros" element={<RegistrosTable />} />
          
          {/* Rutas solo para administradores */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/usuarios" element={<ManageUsers />} />
          <Route path="admin/auditoria" element={<AuditoriaLogs />} /> {/* <<<--- 2. AÑADE LA NUEVA RUTA */}
          
          {/* Ruta catch-all para páginas no encontradas DENTRO del layout */}
          <Route path="*" element={<NotFoundInsideLayout />} />
        </Route>
        
        {/* Ruta catch-all general (si quieres una página 404 fuera del layout y sin autenticación) */}
        <Route path="*" element={
            <div className="d-flex flex-column align-items-center justify-content-center vh-100">
                <h1>404 - Página No Encontrada</h1>
                <p>El recurso que buscas no existe.</p>
                <Link to="/login">Ir a Iniciar Sesión</Link>
            </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
