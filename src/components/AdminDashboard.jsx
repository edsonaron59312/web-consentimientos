// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

// Importaciones para Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const predominantColor = '#074F69';
const secondaryColorForHover = '#053a4e'; 
const textColorOnPrimary = '#FFFFFF';
const chartAccentColor1 = 'rgba(7, 79, 105, 0.6)'; 
const chartAccentColor1Solid = 'rgba(7, 79, 105, 1)';

function AdminDashboard() {
    const { currentUser } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [auditorChartData, setAuditorChartData] = useState(null);
    const [dailyChartData, setDailyChartData] = useState(null);

    const cardHeaderStyle = { backgroundColor: predominantColor, color: textColorOnPrimary, fontWeight: 'bold' };
    const cardStyle = { height: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' };
    const primaryButtonStyle = { backgroundColor: predominantColor, borderColor: predominantColor, color: textColorOnPrimary };
    const tableHeaderStyle = { backgroundColor: predominantColor, color: textColorOnPrimary, position: 'sticky', top: 0, zIndex: 1 };

    const fetchDashboardData = async (year, month) => {
        setLoading(true);
        setError('');
        setDashboardData(null); // Limpiar datos anteriores mientras se carga
        setAuditorChartData(null);
        setDailyChartData(null);
        try {
            const response = await axios.get(`/api/dashboard_data?year=${year}&month=${month}`);
            if (response.data.success) {
                setDashboardData(response.data);
            } else {
                setError(response.data.message || 'Error al cargar datos del dashboard.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo conectar al servidor para obtener datos del dashboard.');
            console.error("Error fetching admin dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.rol === 'admin') {
            fetchDashboardData(selectedYear, selectedMonth);
        } else if (currentUser && currentUser.rol !== 'admin') {
            setError("Acceso denegado. Esta sección es solo para administradores.");
            setLoading(false);
        } else {
            setLoading(false); 
        }
    }, [currentUser, selectedYear, selectedMonth]);

    useEffect(() => {
        if (dashboardData && dashboardData.success) { // Asegurarse que dashboardData exista y la llamada fue exitosa
            if (dashboardData.auditor_totals) {
                const labels = Object.keys(dashboardData.auditor_totals);
                const data = Object.values(dashboardData.auditor_totals);
                setAuditorChartData({
                    labels,
                    datasets: [{
                        label: 'Total Registros por Auditor',
                        data,
                        backgroundColor: chartAccentColor1,
                        borderColor: chartAccentColor1Solid,
                        borderWidth: 1
                    }]
                });
            }

            if (dashboardData.days_in_month_data && dashboardData.dashboard_data) {
                const dailyLabels = dashboardData.days_in_month_data.map(d => `${String(d.day_num).padStart(2, '0')}`);
                const dailyTotals = Array(dailyLabels.length).fill(0);
                
                Object.values(dashboardData.dashboard_data).forEach(auditorCounts => {
                    dashboardData.days_in_month_data.forEach((dayObj, index) => {
                        dailyTotals[index] += (auditorCounts[dayObj.day_num] || 0);
                    });
                });

                setDailyChartData({
                    labels: dailyLabels,
                    datasets: [{
                        label: 'Total Registros Diarios',
                        data: dailyTotals,
                        fill: true,
                        backgroundColor: chartAccentColor1,
                        borderColor: chartAccentColor1Solid,
                        tension: 0.1
                    }]
                });
            }
        }
    }, [dashboardData]);

    const yearsList = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 3; i <= currentYear + 1; i++) { years.push(i); }
        return years;
    };

    const monthsList = [
        {value: 1, name: "Enero"}, {value: 2, name: "Febrero"}, {value: 3, name: "Marzo"},
        {value: 4, name: "Abril"}, {value: 5, name: "Mayo"}, {value: 6, name: "Junio"},
        {value: 7, name: "Julio"}, {value: 8, name: "Agosto"}, {value: 9, name: "Septiembre"},
        {value: 10, name: "Octubre"}, {value: 11, name: "Noviembre"}, {value: 12, name: "Diciembre"}
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Título de la Gráfica' } }
    };

    if (loading) {
        return (
            <Container fluid className="py-3 px-md-4 text-center">
                <Spinner animation="border" style={{color: predominantColor}} />
                <p className="mt-2">Cargando Dashboard de Administrador...</p>
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

    // MODIFICADO: Añadir una comprobación más robusta para dashboardData antes de renderizar
    if (!dashboardData || !dashboardData.success) { 
         return (
            <Container fluid className="py-3 px-md-4 text-center">
                <Alert variant="light">
                    {dashboardData?.message || "No hay datos disponibles para el dashboard de administrador para el período seleccionado o la carga falló."}
                </Alert>
            </Container>
        );
    }
    
    // Ahora podemos asumir que dashboardData y sus propiedades existen
    const { 
        month_name, 
        year_processed, 
        total_records_month, 
        num_auditors_processed,
        dashboard_data: detailedData, // Renombrar para claridad
        days_in_month_data,
        auditor_totals
    } = dashboardData;

    return (
        <Container fluid className="py-3 px-md-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1 className="mb-0" style={{color: predominantColor, fontWeight: '600', fontSize: '2rem'}}>
                        <i className="bi bi-bar-chart-line-fill me-2"></i>Dashboard de Administrador
                    </h1>
                    {/* MODIFICADO: Usar month_name y year_processed que vienen de dashboardData */}
                    <p className="text-muted" style={{fontSize: '1.1rem'}}>
                        Resumen de actividad para {month_name || 'Mes Desconocido'} {year_processed || 'Año Desconocido'}.
                    </p>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col md={6} xl={4} className="d-flex">
                    <Card style={cardStyle} className="text-center flex-fill">
                        <Card.Body className="d-flex flex-column justify-content-center p-4">
                            <i className="bi bi-calendar-check display-4 mb-2" style={{color: predominantColor}}></i>
                            <Card.Title className="display-4 fw-bold" style={{color: predominantColor}}>{total_records_month || 0}</Card.Title>
                            <Card.Text className="text-muted small">Total Registros (Mes)</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} xl={4} className="d-flex">
                    <Card style={cardStyle} className="text-center flex-fill">
                        <Card.Body className="d-flex flex-column justify-content-center p-4">
                            <i className="bi bi-people-fill display-4 mb-2" style={{color: predominantColor}}></i>
                            <Card.Title className="display-4 fw-bold" style={{color: predominantColor}}>{num_auditors_processed || 0}</Card.Title>
                            <Card.Text className="text-muted small">Auditores con Actividad</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                 <Col md={12} xl={4} className="d-flex">
                    <Card style={cardStyle} className="text-center flex-fill">
                        <Card.Body className="d-flex flex-column justify-content-center p-4">
                            <i className="bi bi-graph-up-arrow display-4 mb-2" style={{color: predominantColor}}></i>
                            <Card.Title className="display-4 fw-bold" style={{color: predominantColor}}>
                                {num_auditors_processed > 0 ? 
                                 (total_records_month / num_auditors_processed).toFixed(1) : 0}
                            </Card.Title>
                            <Card.Text className="text-muted small">Promedio Registros / Auditor</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filtros */}
            <Card className="shadow-sm mb-4" style={{borderColor: '#dee2e6'}}>
                <Card.Body className="p-3">
                    <Form>
                        <Row className="g-3 align-items-end">
                            <Col md={5} sm={6}>
                                <Form.Group controlId="month_filter_admin">
                                    <Form.Label className="small fw-semibold mb-1">Mes:</Form.Label>
                                    <Form.Select 
                                        size="sm" 
                                        name="month_filter" 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    >
                                        {monthsList.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={5} sm={6}>
                                <Form.Group controlId="year_filter_admin">
                                    <Form.Label className="small fw-semibold mb-1">Año:</Form.Label>
                                    <Form.Select 
                                        size="sm" 
                                        name="year_filter" 
                                        value={selectedYear} 
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    >
                                        {yearsList().map(y => <option key={y} value={y}>{y}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            
            {/* Gráficas */}
            <Row className="g-4 mb-4">
                <Col lg={6} className="d-flex">
                    <Card style={cardStyle} className="flex-fill">
                        <Card.Header as="h5" style={cardHeaderStyle} className="py-3">
                            <i className="bi bi-person-lines-fill me-2"></i>Total Registros por Auditor
                        </Card.Header>
                        <Card.Body style={{ height: '350px' }}>
                            {auditorChartData ? (
                                <Bar data={auditorChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display:true, text: `Registros por Auditor - ${month_name || ''} ${year_processed || ''}`}}}} />
                            ) : <p className="text-muted text-center mt-3">Cargando datos de gráfica...</p>}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="d-flex">
                    <Card style={cardStyle} className="flex-fill">
                        <Card.Header as="h5" style={cardHeaderStyle} className="py-3">
                            <i className="bi bi-graph-up me-2"></i>Total Registros por Día
                        </Card.Header>
                        <Card.Body style={{ height: '350px' }}>
                            {dailyChartData ? (
                                <Line data={dailyChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display:true, text: `Registros Diarios - ${month_name || ''} ${year_processed || ''}`}}}} />
                            ) : <p className="text-muted text-center mt-3">Cargando datos de gráfica...</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabla de Registros por Auditor y Día */}
            <Card className="shadow-sm" style={{borderColor: '#dee2e6'}}>
                <Card.Header as="h5" className="py-3" style={cardHeaderStyle}>
                    <i className="bi bi-layout-text-sidebar-reverse me-2"></i>Detalle de Registros por Auditor y Día
                </Card.Header>
                <Card.Body className="p-0"> {/* Padding 0 para que la tabla ocupe todo el espacio */}
                    {Object.keys(detailedData || {}).length > 0 && days_in_month_data && auditor_totals ? (
                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <Table striped bordered hover size="sm" className="align-middle text-center small mb-0">
                                <thead style={tableHeaderStyle}>
                                    <tr>
                                        <th style={{minWidth: '200px', textAlign: 'left', paddingLeft: '0.75rem'}}>Auditor</th>
                                        {days_in_month_data.map(day => (
                                            <th 
                                                key={day.day_num} 
                                                className={day.is_sunday ? 'fw-normal' : ''} 
                                                style={day.is_sunday ? {backgroundColor: '#6c757d', color: '#fff'} : {}}
                                            >
                                                {day.day_name_short}<br/>{String(day.day_num).padStart(2, '0')}
                                            </th>
                                        ))}
                                        <th style={{minWidth: '70px'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(detailedData).map(([auditorName, dailyCounts]) => (
                                        <tr key={auditorName}>
                                            <td style={{textAlign: 'left', fontWeight:'500', paddingLeft: '0.75rem'}}>{auditorName}</td>
                                            {days_in_month_data.map(day => (
                                                <td 
                                                    key={`${auditorName}-${day.day_num}`} 
                                                    style={day.is_sunday ? {backgroundColor: '#e9ecef', fontWeight:'500'} : {}}
                                                >
                                                    {dailyCounts[day.day_num] > 0 ? dailyCounts[day.day_num] : <span className="text-muted">-</span>}
                                                </td>
                                            ))}
                                            <td style={{fontWeight:'bold', fontSize: '0.9rem'}}>{auditor_totals[auditorName] || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <Alert variant="light" className="text-center m-3">
                            No hay datos de registros detallados para el período seleccionado o ningún auditor tiene registros.
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AdminDashboard;
