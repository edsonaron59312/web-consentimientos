// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx'; // Asegúrate que la ruta sea correcta
import './index.css'; // Estilos generales de tu aplicación
import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Íconos de Bootstrap (útiles para el botón de tema)

// Obtenemos el elemento raíz del DOM donde se montará la aplicación React
const rootElement = document.getElementById('root');

// Creamos el root de React 18+
const root = ReactDOM.createRoot(rootElement);

// Renderizamos la aplicación
root.render(
  <React.StrictMode>
    {/* ThemeProvider envuelve a AuthProvider y App para que el tema esté disponible globalmente */}
    <ThemeProvider>
      {/* AuthProvider envuelve App para que el contexto de autenticación esté disponible */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
