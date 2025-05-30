// src/components/RegistrosTable.jsx
import React, { useState, useEffect } from 'react';
// MODIFICADO: Añadido 'Pagination'
import { Container, Card, Table, Alert, Spinner, Button, InputGroup, Form, Row, Col, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import * as XLSX from 'xlsx';

// Paleta de colores
const predominantColor = '#074F69';
const successColor = '#198754';

function RegistrosTable() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const { currentUser } = useAuth();

    // <<<--- NUEVO ESTADO PARA PAGINACIÓN --- >>>
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // <-- Mantenido en 5 para facilitar ver la paginación

    useEffect(() => {
        const fetchRegistros = async () => {
            setLoading(true);
            setError('');
            try {
                // Mantenemos la URL original que proporcionaste
                const response = await axios.get('/api/records');
                if (response.data.success) {
                    setRegistros(response.data.records || []);
                } else {
                    setError(response.data.message || 'Error al cargar registros.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'No se pudo conectar al servidor para obtener los registros.');
                console.error("Error fetching registros:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchRegistros();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
        setCurrentPage(1); // <<<--- NUEVO: Resetear página al buscar
    };

    const handleDateChange = (event) => {
        setFilterDate(event.target.value);
        setCurrentPage(1); // <<<--- NUEVO: Resetear página al filtrar
    };

    const filteredRegistros = registros.filter(registro => {
        const matchesSearchTerm = Object.values(registro).some(value =>
            String(value).toLowerCase().includes(searchTerm)
        );
        // Mantenemos tu lógica original de filtrado de fecha
        const matchesDate = filterDate ? registro.fecha_registro?.startsWith(filterDate) : true;
        return matchesSearchTerm && matchesDate;
    });

    // <<<--- NUEVA LÓGICA DE PAGINACIÓN (Cálculos) --- >>>
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistros.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // <<<--- NUEVA LÓGICA DE PAGINACIÓN (Renderizado) --- >>>
    const renderPaginationItems = () => {
        let items = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) { startPage = 1; endPage = totalPages; }
        else {
            const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) { startPage = 1; endPage = maxPagesToShow; }
            else if (currentPage + maxPagesAfterCurrentPage >= totalPages) { startPage = totalPages - maxPagesToShow + 1; endPage = totalPages; }
            else { startPage = currentPage - maxPagesBeforeCurrentPage; endPage = currentPage + maxPagesAfterCurrentPage; }
        }

        items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);
        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        for (let number = startPage; number <= endPage; number++) { items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</Pagination.Item>); }
        if (endPage < totalPages) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
        return items;
    };

    // Tu función original de exportar (sin cambios)
    const handleExportToExcel = () => {
        if (filteredRegistros.length === 0) {
            alert("No hay registros para exportar según los filtros actuales.");
            return;
        }
        const dataToExport = filteredRegistros.map(reg => ({
            'ID': reg.id, 'Teléfono': reg.telefono, 'DNI Asesor': reg.dni_asesor, 'Asesor': reg.asesor, 'Campaña': reg.campana, 'Supervisor': reg.supervisor, 'Coordinador': reg.coordinador, '¿Tipifica Bien?': reg.tipifica_bien, '¿Consentimiento?': reg.cliente_desiste, 'Observaciones': reg.observaciones, 'Auditor': reg.nombre_auditor, 'Fecha de Registro': new Date(reg.fecha_registro).toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second:'2-digit', hour12: true })
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
        const columnWidths = [ { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 50 }, { wch: 30 }, { wch: 20 } ];
        worksheet["!cols"] = columnWidths;
        XLSX.writeFile(workbook, "Registros_Escuchas.xlsx");
    };

    const cardHeaderStyle = { backgroundColor: predominantColor, color: 'white', borderBottom: `1px solid ${predominantColor}` };
    const tableHeaderStyle = { backgroundColor: predominantColor, color: 'white', position: 'sticky', top: 0, zIndex: 1 };

    if (loading) {
        return ( <Container fluid className="py-3 px-md-4 text-center"> <Spinner animation="border" style={{ color: predominantColor }} /> <p className="mt-2">Cargando registros...</p> </Container> );
    }

    return (
        <Container fluid className="py-3 px-md-4">
            <Card className="shadow-sm">
                <Card.Header as="h5" className="text-center fw-bold py-3" style={cardHeaderStyle}>
                    <i className="bi bi-table me-2"></i>VISUALIZAR REGISTROS DE ESCUCHAS
                </Card.Header>
                <Card.Body className="p-3 p-md-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row className="mb-3 g-3 align-items-center">
                        <Col md={7} lg={8}> <InputGroup> <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text> <Form.Control type="text" placeholder="Buscar en todos los campos..." onChange={handleSearchChange} value={searchTerm} /> </InputGroup> </Col>
                        <Col md={5} lg={4}> <InputGroup> <InputGroup.Text><i className="bi bi-calendar-date"></i></InputGroup.Text> <Form.Control type="date" onChange={handleDateChange} value={filterDate} /> </InputGroup> </Col>
                    </Row>
                    {/* MODIFICADO: Ajustada altura y usando 'currentItems' */}
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                        <Table striped bordered hover responsive="sm" size="sm" className="align-middle">
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th>ID</th> <th>Teléfono</th> <th>DNI Asesor</th> <th>Asesor</th> <th>Campaña</th> <th>Supervisor</th> <th>Coordinador</th> <th>Tipifica?</th> <th>Consent.?</th> <th style={{minWidth: '250px'}}>Observaciones</th> <th>Auditor</th> <th>Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* MODIFICADO: Usar 'currentItems' para mostrar solo los de la página actual */}
                                {currentItems.length > 0 ? (
                                    currentItems.map((registro) => (
                                        <tr key={registro.id}>
                                            <td>{registro.id}</td> <td>{registro.telefono}</td> <td>{registro.dni_asesor}</td> <td>{registro.asesor}</td> <td>{registro.campana}</td> <td>{registro.supervisor}</td> <td>{registro.coordinador}</td> <td>{registro.tipifica_bien}</td> <td>{registro.cliente_desiste}</td>
                                            <td title={registro.observaciones}> {registro.observaciones && registro.observaciones.length > 60 ? `${registro.observaciones.substring(0, 60)}...` : registro.observaciones} </td>
                                            <td>{registro.nombre_auditor}</td>
                                            <td> {registro.fecha_registro ? new Date(registro.fecha_registro).toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'N/A'} </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr> <td colSpan="12" className="text-center py-4"> {registros.length === 0 && !error ? "No hay registros para mostrar." : "No se encontraron registros que coincidan con los filtros."} </td> </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                     {/* MODIFICADO: Contenedor para Paginación y Botón */}
                     <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                        {/* Tu botón original de Excel (sin cambios) */}
                        <Button variant="success" onClick={handleExportToExcel} disabled={filteredRegistros.length === 0} style={{backgroundColor: successColor, borderColor: successColor}} className="mb-2 mb-md-0">
                            <i className="bi bi-file-earmark-excel-fill me-2"></i>Exportar a Excel
                        </Button>
                        {/* <<<--- NUEVO: Componente de Paginación --- >>> */}
                        {totalPages > 1 && (
                            <Pagination className="mb-0 justify-content-end">
                                {renderPaginationItems()}
                            </Pagination>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default RegistrosTable;
