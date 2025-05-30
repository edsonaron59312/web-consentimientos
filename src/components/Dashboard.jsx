import React from 'react';
import { Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
         try {
            await axios.post('/api/logout');
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Igual redirigir o mostrar error
            navigate('/login');
        }
    }

    return (
        <Container>
            <h1 className="mt-5">¡Bienvenido a tu Dashboard!</h1>
            <p>Aquí irá tu contenido principal.</p>
            <Button variant="danger" onClick={handleLogout}>Cerrar Sesión</Button>
        </Container>
    );
}

export default Dashboard;