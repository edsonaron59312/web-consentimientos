// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from './AuthContext.jsx';

// Paleta de colores definida
const predominantColor = '#074F69'; // Azul oscuro/petróleo
const grayColor = '#6c757d'; // Un gris estándar de Bootstrap para texto secundario/labels
const lightBgColor = '#f0f2f5'; // Un fondo claro para la página, similar al del layout
const cardBgColor = '#FFFFFF'; // Fondo blanco para la tarjeta
const textColorOnPrimary = '#FFFFFF'; // Texto blanco sobre el color predominante

function AuthForm() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(correo, contrasena);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error en el inicio de sesión. Verifique sus credenciales.');
            setLoading(false);
        }
    };

    // Estilos para el logo
    const logoStyle = {
        width: '100px', // Más grande
        height: '100px',
        backgroundColor: predominantColor,
        color: textColorOnPrimary,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem', // Letras más grandes
        fontWeight: 'bold',
        margin: '0 auto 30px auto', // Más margen inferior
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', // Sombra más pronunciada
    };

    // Estilos para el botón principal
    const primaryButtonStyle = {
        backgroundColor: predominantColor,
        borderColor: predominantColor,
        color: textColorOnPrimary, // Asegurar texto blanco
        fontWeight: '600',
        padding: '0.75rem 1.5rem',
        fontSize: '1.1rem', // Botón ligeramente más grande
    };
    
    const cardStyle = {
        width: '100%', 
        maxWidth: '450px', // Ligeramente más ancho
        backgroundColor: cardBgColor, 
        borderRadius: '15px', // Bordes más redondeados
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', // Sombra más suave y difusa
        border: 'none', // Quitar borde por defecto si no se necesita
    };

    return (
        <div style={{ 
            backgroundColor: lightBgColor, 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
        }}>
            <Card style={cardStyle} className="p-3 p-md-5"> {/* Más padding interno */}
                <Card.Body>
                    <div style={logoStyle}>
                        <span>PYM</span>
                    </div>
                    <h2 className="text-center mb-4" style={{ color: predominantColor, fontWeight: 'bold' }}>
                        Iniciar Sesión
                    </h2>
                    
                    {error && <Alert variant="danger" className="text-center mb-3">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="loginCorreo">
                            <Form.Label style={{ color: grayColor, fontWeight: '500' }}>Correo Electrónico</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="su.correo@ejemplo.com"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                                disabled={loading}
                                size="lg"
                                style={{borderRadius: '8px'}} // Bordes redondeados para inputs
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="loginContrasena">
                            <Form.Label style={{ color: grayColor, fontWeight: '500' }}>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                required
                                disabled={loading}
                                size="lg"
                                style={{borderRadius: '8px'}} // Bordes redondeados para inputs
                            />
                        </Form.Group>

                        <div className="d-grid mt-4">
                           <Button style={primaryButtonStyle} type="submit" disabled={loading} size="lg">
                                {loading ? 
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : 
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                }
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default AuthForm;
