// src/components/AuditoriaLogs.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner, Button, Pagination, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { Link } from 'react-router-dom';

// Paleta de colores
const predominantColor = '#074F69';
const textColorOnPrimary = '#FFFFFF';

function AuditoriaLogs() {
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [logsPerPage, setLogsPerPage] = useState(15);

    const cardHeaderStyle = {
        backgroundColor: predominantColor,
        color: textColorOnPrimary,
        fontWeight: 'bold',
    };

    const tableHeaderStyle = {
        backgroundColor: predominantColor,
        color: textColorOnPrimary,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        fontSize: '0.85rem',
    };
    
    const primaryButtonStyle = {
        backgroundColor: predominantColor,
        borderColor: predominantColor,
        color: textColorOnPrimary,
    };

    useEffect(() => {
        const fetchAuditLogs = async () => {
            if (!currentUser || currentUser.rol !== 'admin') {
                setError("Acceso denegado. Esta sección es solo para administradores.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`/api/audit_logs?page=${currentPage}&per_page=${logsPerPage}`);
                if (response.data.success) {
                    setLogs(response.data.logs || []);
                    setTotalPages(response.data.total_pages || 1);
                    setCurrentPage(response.data.current_page || 1);
                    setTotalLogs(response.data.total_logs || 0);
                } else {
                    setError(response.data.message || 'Error al cargar los logs de auditoría.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'No se pudo conectar al servidor para obtener los logs.');
                console.error("Error fetching audit logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditLogs();
    }, [currentUser, currentPage, logsPerPage]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleLogsPerPageChange = (e) => {
        setLogsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1); 
    };

    const renderDetails = (details) => {
        if (!details) return <span className="text-muted small fst-italic">N/A</span>;
        let parsedDetails = details;
        if (typeof details === 'string') {
            try { 
                parsedDetails = JSON.parse(details);
            } catch (e) {
                return <pre className="m-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem' }}>{details}</pre>;
            }
        }
        return <pre className="m-0" style={{ maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem', backgroundColor: '#f8f9fa', padding: '0.5rem', borderRadius:'4px', border: '1px solid #dee2e6' }}>
                 {JSON.stringify(parsedDetails, null, 2)}
               </pre>;
    };

    if (loading && logs.length === 0) { 
        return (
            <Container fluid className="py-3 px-md-4 text-center">
                <Spinner animation="border" style={{color: predominantColor}} />
                <p className="mt-2">Cargando logs de auditoría...</p>
            </Container>
        );
    }

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
    
    // MODIFICADO: Definir startPage y endPage aquí para que estén en el alcance correcto
    let paginationItems = [];
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 1) {
        const maxPagesToShow = 5; 

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - Math.floor(maxPagesToShow / 2);
                endPage = currentPage + Math.floor(maxPagesToShow / 2);
            }
        }

        for (let number = startPage; number <= endPage; number++) {
            paginationItems.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>
            );
        }
    }

    return (
        <Container fluid className="py-3 px-md-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1 className="mb-0" style={{color: predominantColor, fontWeight: '600', fontSize: '2rem'}}>
                        <i className="bi bi-journal-text me-2"></i>Logs de Auditoría del Sistema
                    </h1>
                    <p className="text-muted" style={{fontSize: '1.1rem'}}>
                        Registro de acciones importantes realizadas en el sistema. Total: {totalLogs} registros.
                    </p>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Header as="h5" className="py-3" style={cardHeaderStyle}>
                    <i className="bi bi-list-ol me-2"></i>Registros de Actividad
                </Card.Header>
                <Card.Body className="p-0">
                     <Row className="p-3 align-items-center border-bottom mx-0">
                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                            <Form.Group controlId="logsPerPageSelect" className="d-flex align-items-center">
                                <Form.Label className="small me-2 mb-0 text-nowrap">Mostrar:</Form.Label>
                                <Form.Select size="sm" value={logsPerPage} onChange={handleLogsPerPageChange} style={{display: 'inline-block', width: 'auto'}}>
                                    <option value="15">15</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </Form.Select>
                                <span className="small ms-2 text-nowrap">por página.</span>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={8} className="d-flex justify-content-md-end mt-2 mt-md-0">
                           {totalPages > 1 && ( // La línea 192 del error original estaría dentro de este bloque
                                <Pagination size="sm" className="mb-0 flex-wrap justify-content-center justify-content-md-end">
                                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                    {startPage > 1 && <Pagination.Ellipsis onClick={() => handlePageChange(Math.max(1, startPage - Math.floor(5/2) -1 ))}/>}
                                    {paginationItems}
                                    {endPage < totalPages && <Pagination.Ellipsis onClick={() => handlePageChange(Math.min(totalPages, endPage + Math.floor(5/2) + 1))}/>}
                                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                                </Pagination>
                            )}
                        </Col>
                    </Row>
                    {loading && logs.length > 0 && <div className="text-center p-3"><Spinner animation="border" size="sm" style={{color: predominantColor}} /> <span className="ms-2">Actualizando...</span></div>}
                    <div className="table-responsive">
                        <Table striped bordered hover responsive="lg" className="align-middle mb-0 small">
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th>ID</th>
                                    <th>Timestamp</th>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Acción</th>
                                    <th>Entidad</th>
                                    <th>ID Ent.</th>
                                    <th>IP</th>
                                    <th style={{minWidth: '150px'}}>User Agent</th>
                                    <th style={{minWidth: '200px'}}>Detalles Anteriores</th>
                                    <th style={{minWidth: '200px'}}>Detalles Nuevos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map(log => (
                                        <tr key={log.id}>
                                            <td>{log.id}</td>
                                            <td>{new Date(log.timestamp).toLocaleString('es-PE', {dateStyle:'short', timeStyle:'medium'})}</td>
                                            <td title={log.correo_usuario}>{log.nombre_usuario || log.correo_usuario || <span className="text-muted fst-italic">Sistema</span>}</td>
                                            <td>{log.rol_usuario || <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td><span className="fw-semibold">{log.accion}</span></td>
                                            <td>{log.entidad_afectada || <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td>{log.id_entidad_afectada || <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td>{log.direccion_ip || <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td title={log.user_agent}>{log.user_agent ? `${log.user_agent.substring(0,25)}...` : <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td>{renderDetails(log.detalles_anteriores)}</td>
                                            <td>{renderDetails(log.detalles_nuevos)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center py-5">
                                            <i className="bi bi-journal-x fs-1 text-muted"></i>
                                            <p className="mt-2 text-muted">No hay logs de auditoría para mostrar con los filtros actuales.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                     {logs.length > 0 && totalPages > 1 && ( 
                        <div className="d-flex justify-content-center p-3 border-top">
                            <Pagination size="sm">
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {startPage > 1 && <Pagination.Ellipsis onClick={() => handlePageChange(Math.max(1, startPage - Math.floor(5/2) -1 ))}/>}
                                {paginationItems}
                                {endPage < totalPages && <Pagination.Ellipsis onClick={() => handlePageChange(Math.min(totalPages, endPage + Math.floor(5/2) + 1))}/>}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AuditoriaLogs;
