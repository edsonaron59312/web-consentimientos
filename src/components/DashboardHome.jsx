// src/components/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import axios from 'axios';

// Paleta de colores (consistente con Layout y otros componentes)
const predominantColor = '#074F69';
const secondaryColorForHover = '#053a4e'; // Asegúrate que esta línea esté presente y correcta
const textColorOnPrimary = '#FFFFFF';

function DashboardHome() {
    const { currentUser } = useAuth();
    const [summaryData, setSummaryData] = useState({ totalRegistrosPropios: 0, promedioDiario: 0 });
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [errorSummary, setErrorSummary] = useState('');

    useEffect(() => {
        const fetchUserSummary = async () => {
            if (!currentUser) {
                setLoadingSummary(false);
                return;
            }
            setLoadingSummary(true);
            setErrorSummary('');
            try {
                // Simulación de llamada API 
                await new Promise(resolve => setTimeout(resolve, 700)); 
                setSummaryData({
                    totalRegistrosPropios: Math.floor(Math.random() * 120) + 15,
                    promedioDiario: (Math.random() * 8 + 3).toFixed(1) 
                });
            } catch (err) {
                setErrorSummary('No se pudo cargar el resumen del usuario.');
                console.error("Error fetching user summary:", err);
            } finally {
                setLoadingSummary(false);
            }
        };
        fetchUserSummary();
    }, [currentUser]);

    const cardHeaderStyle = {
        backgroundColor: predominantColor,
        color: textColorOnPrimary,
        fontWeight: 'bold',
        borderBottom: `2px solid ${secondaryColorForHover}` // Uso de secondaryColorForHover
    };
    
    const cardStyle = {
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e0e0e0',
        height: '100%'
    };

    const primaryButtonStyle = {
        backgroundColor: predominantColor,
        borderColor: predominantColor,
        color: textColorOnPrimary,
    };
    
    const secondaryButtonStyle = {
        backgroundColor: 'transparent',
        borderColor: predominantColor,
        color: predominantColor,
    };

    return (
        <Container fluid className="py-3 px-md-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1 className="mb-0" style={{color: predominantColor, fontWeight: '600', fontSize: '2rem'}}>
                        <i className="bi bi-speedometer2 me-2"></i>Dashboard Principal
                    </h1>
                    <p className="lead text-muted" style={{fontSize: '1.1rem'}}>
                        Bienvenido de nuevo, {currentUser?.nombre_completo || 'Usuario'}.
                    </p>
                </Col>
            </Row>

            {errorSummary && <Alert variant="danger" className="mb-4">{errorSummary}</Alert>}

            <Row className="g-4">
                <Col md={6} lg={4} className="d-flex">
                    <Card style={cardStyle} className="flex-fill">
                        <Card.Header as="h5" style={cardHeaderStyle} className="py-3">
                            <i className="bi bi-card-list me-2"></i>Mis Registros (Este Mes)
                        </Card.Header>
                        <Card.Body className="text-center d-flex flex-column justify-content-between p-4">
                            <div>
                                {loadingSummary ? <Spinner animation="border" variant="primary" style={{color:predominantColor}}/> : 
                                    <Card.Title className="display-3 fw-bold mb-1" style={{color: predominantColor}}>{summaryData.totalRegistrosPropios}</Card.Title>
                                }
                                <Card.Text className="text-muted mb-3">Total de escuchas registradas por ti este mes.</Card.Text>
                            </div>
                            <Button 
                                variant="primary" 
                                as={Link} to="/registros" 
                                style={primaryButtonStyle}
                                className="mt-auto w-100"
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = secondaryColorForHover; e.currentTarget.style.borderColor = secondaryColorForHover;}}
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = predominantColor; e.currentTarget.style.borderColor = predominantColor;}}
                            >
                                Ver Mis Registros
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="d-flex">
                    <Card style={cardStyle} className="flex-fill">
                        <Card.Header as="h5" style={cardHeaderStyle} className="py-3">
                            <i className="bi bi-calendar-check me-2"></i>Promedio Diario
                        </Card.Header>
                        <Card.Body className="text-center d-flex flex-column justify-content-center p-4">
                             {loadingSummary ? <Spinner animation="border" variant="primary" style={{color:predominantColor}}/> : 
                                <Card.Title className="display-3 fw-bold mb-1" style={{color: predominantColor}}>{summaryData.promedioDiario}</Card.Title>
                            }
                            <Card.Text className="text-muted">Promedio de registros por día (simulado).</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={4} className="d-flex">
                     <Card style={cardStyle} className="flex-fill">
                        <Card.Header as="h5" style={cardHeaderStyle} className="py-3">
                            <i className="bi bi-lightning-charge-fill me-2"></i>Acciones Rápidas
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center p-4">
                            <div className="d-grid gap-3">
                                <Button 
                                    as={Link} to="/registrar" 
                                    style={primaryButtonStyle}
                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = secondaryColorForHover; e.currentTarget.style.borderColor = secondaryColorForHover;}}
                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = predominantColor; e.currentTarget.style.borderColor = predominantColor;}}
                                >
                                    <i className="bi bi-plus-circle-fill me-2"></i>Nueva Escucha
                                </Button>
                                <Button 
                                    variant="outline-primary" 
                                    as={Link} to="/registros" 
                                    style={secondaryButtonStyle}
                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = predominantColor; e.currentTarget.style.color = textColorOnPrimary;}}
                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = predominantColor;}}
                                >
                                    <i className="bi bi-eye-fill me-2"></i>Ver Todos Mis Registros
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {currentUser?.rol === 'admin' && (
                 <Row className="mt-4">
                    <Col>
                        <Alert variant="info" style={{borderColor: predominantColor, color: predominantColor, backgroundColor: 'rgba(7, 79, 105, 0.05)'}}>
                            <Alert.Heading as="h5" className="fw-bold"><i className="bi bi-tools me-2"></i>Panel de Administrador</Alert.Heading>
                            <p className="mb-2">
                                Tienes acceso a herramientas y vistas adicionales para la gestión completa del sistema.
                            </p>
                            <hr style={{borderColor: 'rgba(7, 79, 105, 0.2)'}}/>
                            <div className="d-flex justify-content-start gap-2">
                                <Button 
                                    as={Link} to="/admin/dashboard" 
                                    style={primaryButtonStyle}
                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = secondaryColorForHover; e.currentTarget.style.borderColor = secondaryColorForHover;}}
                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = predominantColor; e.currentTarget.style.borderColor = predominantColor;}}
                                >
                                    Ir a Dashboard Admin
                                </Button>
                                <Button 
                                    as={Link} to="/admin/usuarios" 
                                    variant="outline-secondary" 
                                    style={secondaryButtonStyle}
                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = predominantColor; e.currentTarget.style.color = textColorOnPrimary;}}
                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = predominantColor;}}
                                >
                                    Gestionar Usuarios
                                </Button>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}
        </Container>
    );
}
export default DashboardHome;
