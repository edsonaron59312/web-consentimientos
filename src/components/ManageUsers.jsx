// src/components/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; // Para verificar el rol del usuario actual

// Paleta de colores
const predominantColor = '#074F69';
const textColorOnPrimary = '#FFFFFF';
const secondaryColorForHover = '#053a4e';

function ManageUsers() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estado para manejar el rol seleccionado en el <Form.Select> para cada usuario
    // y el estado de carga/éxito/error para la acción de guardar de cada usuario.
    // Ejemplo: { userId1: { selectedRole: 'admin', isLoading: false, error: '', success: '' }, userId2: {...} }
    const [userActionStates, setUserActionStates] = useState({});

    const cardHeaderStyle = {
        backgroundColor: predominantColor,
        color: textColorOnPrimary,
        fontWeight: 'bold',
    };

    const primaryButtonStyle = {
        backgroundColor: predominantColor,
        borderColor: predominantColor,
        color: textColorOnPrimary,
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/users');
            if (response.data.success) {
                const fetchedUsers = response.data.users || [];
                setUsers(fetchedUsers);
                // Inicializar el estado de edición para cada usuario con su rol actual
                const initialActionStates = {};
                fetchedUsers.forEach(user => {
                    initialActionStates[user.id] = { 
                        selectedRole: user.rol, 
                        isLoading: false, 
                        error: '', 
                        success: '' 
                    };
                });
                setUserActionStates(initialActionStates);
            } else {
                setError(response.data.message || 'Error al cargar usuarios.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo conectar al servidor para obtener los usuarios.');
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.rol === 'admin') {
            fetchUsers();
        } else if (currentUser && currentUser.rol !== 'admin') {
            setError("Acceso denegado. Esta sección es solo para administradores.");
            setLoading(false);
        } else {
            // Si no hay currentUser, PrivateRoute debería haber actuado.
            // Podríamos mostrar un mensaje genérico o simplemente no cargar nada.
            setLoading(false);
        }
    }, [currentUser]);

    const handleRoleChange = (userId, newRole) => {
        setUserActionStates(prev => ({
            ...prev,
            [userId]: { ...prev[userId], selectedRole: newRole, error: '', success: '' } // Limpiar mensajes al cambiar
        }));
    };

    const handleSaveRole = async (userId) => {
        const userState = userActionStates[userId];
        if (!userState || !userState.selectedRole) {
            setUserActionStates(prev => ({
                ...prev,
                [userId]: { ...prev[userId], error: 'Por favor seleccione un rol.', success: '' }
            }));
            return;
        }

        setUserActionStates(prev => ({
            ...prev,
            [userId]: { ...prev[userId], isLoading: true, error: '', success: '' }
        }));

        try {
            const response = await axios.post(`/api/users/${userId}/change_role`, { new_role: userState.selectedRole });
            if (response.data.success) {
                setUserActionStates(prev => ({
                    ...prev,
                    [userId]: { ...prev[userId], isLoading: false, success: response.data.message, error: '' }
                }));
                // Actualizar la lista de usuarios localmente para reflejar el cambio inmediatamente
                setUsers(prevUsers => prevUsers.map(u =>
                    u.id === userId ? { ...u, rol: userState.selectedRole } : u
                ));
                setTimeout(() => setUserActionStates(prev => ({
                    ...prev,
                    [userId]: { ...prev[userId], success: '' } // Limpiar mensaje de éxito después de un tiempo
                })), 3000);
            } else {
                setUserActionStates(prev => ({
                    ...prev,
                    [userId]: { ...prev[userId], isLoading: false, error: response.data.message || 'Error al cambiar el rol.', success: '' }
                }));
            }
        } catch (err) {
            setUserActionStates(prev => ({
                ...prev,
                [userId]: { ...prev[userId], isLoading: false, error: err.response?.data?.message || 'Error de conexión al cambiar el rol.', success: '' }
            }));
        }
    };

    if (loading) {
        return (
            <Container fluid className="py-3 px-md-4 text-center">
                <Spinner animation="border" style={{color: predominantColor}} />
                <p className="mt-2">Cargando gestión de usuarios...</p>
            </Container>
        );
    }

    // Si hay un error general o de acceso
    if (error) {
        return (
            <Container fluid className="py-3 px-md-4">
                <Alert variant="danger" className="text-center">{error}</Alert>
                {currentUser && currentUser.rol !== 'admin' && 
                    <div className="text-center">
                        <Button as={Link} to="/" style={primaryButtonStyle}>Ir al Dashboard Principal</Button>
                    </div>
                }
            </Container>
        );
    }

    return (
        <Container fluid className="py-3 px-md-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1 className="mb-0" style={{color: predominantColor, fontWeight: '600', fontSize: '2rem'}}>
                        <i className="bi bi-person-fill-gear me-2"></i>Gestionar Usuarios y Accesos
                    </h1>
                    <p className="text-muted" style={{fontSize: '1.1rem'}}>
                        Administra los roles de los usuarios del sistema.
                    </p>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Header as="h5" className="py-3" style={cardHeaderStyle}>
                    <i className="bi bi-people-fill me-2"></i>Lista de Usuarios Registrados
                </Card.Header>
                <Card.Body className="p-0"> {/* Padding 0 para que la tabla ocupe todo */}
                    {users.length > 0 ? (
                        <div className="table-responsive">
                            <Table striped bordered hover responsive="md" className="align-middle mb-0 small">
                                <thead style={{backgroundColor: predominantColor, color: textColorOnPrimary, verticalAlign: 'middle'}}>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>DNI</th>
                                        <th>Correo Electrónico</th>
                                        <th>Rol Actual</th>
                                        <th style={{minWidth: '280px'}}>Cambiar Rol y Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.nombre_completo}</td>
                                            <td>{user.dni_auditor}</td>
                                            <td>{user.correo}</td>
                                            <td>
                                                <span 
                                                    className={`badge fs-6 ${user.rol === 'admin' ? 'bg-primary' : 'bg-secondary'}`}
                                                    style={user.rol === 'admin' ? {backgroundColor: predominantColor, color: textColorOnPrimary} : {backgroundColor: '#6c757d', color: textColorOnPrimary }}
                                                >
                                                    {user.rol?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {currentUser && user.id === currentUser.id ? (
                                                    <small className="text-muted fst-italic">(Usuario Actual)</small>
                                                ) : (
                                                    <Form className="d-flex align-items-center gap-2" onSubmit={(e) => { e.preventDefault(); handleSaveRole(user.id); }}>
                                                        <Form.Select
                                                            size="sm"
                                                            aria-label={`Cambiar rol para ${user.nombre_completo}`}
                                                            value={userActionStates[user.id]?.selectedRole || user.rol}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            disabled={userActionStates[user.id]?.isLoading}
                                                            style={{maxWidth: '120px'}}
                                                        >
                                                            <option value="auditor">Auditor</option>
                                                            <option value="admin">Admin</option>
                                                        </Form.Select>
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm" 
                                                            type="submit"
                                                            disabled={userActionStates[user.id]?.isLoading}
                                                            style={primaryButtonStyle}
                                                            onMouseOver={e => { if (!userActionStates[user.id]?.isLoading) e.currentTarget.style.backgroundColor = secondaryColorForHover; }}
                                                            onMouseOut={e => { if (!userActionStates[user.id]?.isLoading) e.currentTarget.style.backgroundColor = predominantColor; }}
                                                        >
                                                            {userActionStates[user.id]?.isLoading ? 
                                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> 
                                                                : <i className="bi bi-check-lg"></i>}
                                                            <span className="ms-1 d-none d-md-inline">{userActionStates[user.id]?.isLoading ? 'Guardando...' : 'Guardar'}</span>
                                                        </Button>
                                                        {userActionStates[user.id]?.error && <Alert variant="danger" className="py-1 px-2 mb-0 ms-2 small" style={{fontSize: '0.75rem'}}>{userActionStates[user.id]?.error}</Alert>}
                                                        {userActionStates[user.id]?.success && <Alert variant="success" className="py-1 px-2 mb-0 ms-2 small" style={{fontSize: '0.75rem'}}>{userActionStates[user.id]?.success}</Alert>}
                                                    </Form>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted">
                            {error ? 'No se pudieron cargar los usuarios.' : 'No hay usuarios registrados en el sistema.'}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ManageUsers;
