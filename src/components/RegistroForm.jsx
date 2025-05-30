// src/components/RegistroForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
// MODIFICADO: Eliminado Modal, añadido Spinner
import { Card, Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; // Assuming AuthContext is in the same 'context' folder or path needs adjustment
import { useTheme } from '../context/ThemeContext.jsx'; // <<<--- MODIFICADO: Ruta de importación corregida
import { toast } from 'react-toastify'; // <<<--- NUEVO: Importar toast

// Paleta de colores
const predominantColor = '#074F69';
const grayColor = '#808080';
const lightGrayColor = '#f8f9fa';
// const successColor = '#28a745'; // Ya no se usa para el modal, pero se puede mantener si es necesario
const errorColor = '#dc3545';

function RegistroForm() {
    const { currentUser } = useAuth();
    const { theme } = useTheme(); // <<<--- NUEVO: Obtener tema actual
    const initialFormData = {
        telefono: '',
        dni_asesor: '',
        asesor: '',
        campana: '',
        supervisor: '',
        coordinador: '',
        tipifica_bien: '',
        cliente_desiste: '',
        observaciones: '',
        dni_auditor: '',
        nombre_auditor: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loadingAsesor, setLoadingAsesor] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: '' });
    // MODIFICADO: Eliminado estado del modal
    // const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData(prevData => ({
                ...initialFormData,
                dni_auditor: currentUser.dni_auditor || '',
                nombre_auditor: currentUser.nombre_completo || ''
            }));
            setErrors({});
        } else {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [currentUser]); // No es necesario 'initialFormData' como dependencia si es constante

    const validateField = useCallback((name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'telefono':
                if (!value) errorMsg = 'El teléfono es obligatorio.';
                else if (!/^9\d{8}$/.test(value)) errorMsg = 'Debe ser un número de 9 dígitos que comience con 9.';
                break;
            case 'dni_asesor':
                if (!value) errorMsg = 'El DNI del asesor es obligatorio.';
                else if (!/^\d{8,9}$/.test(value)) errorMsg = 'Debe ser numérico de 8 o 9 dígitos.';
                break;
            case 'tipifica_bien':
                if (!value) errorMsg = 'Seleccione una opción para "¿Tipifica bien?".';
                break;
            case 'cliente_desiste':
                if (!value) errorMsg = 'Seleccione una opción para "¿Consentimiento?".';
                break;
            default: break;
        }
        return errorMsg;
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === "dni_asesor") {
            processedValue = value.replace(/\D/g, '').substring(0, 9);
        } else if (name === "telefono") {
            processedValue = value.replace(/\D/g, '');
            if (processedValue.length > 0 && processedValue.charAt(0) !== '9') {
                processedValue = formData.telefono;
            }
            processedValue = processedValue.substring(0, 9);
        }

        setFormData(prevData => ({ ...prevData, [name]: processedValue }));
        if (errors[name]) {
            const errorMsg = validateField(name, processedValue);
            setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value);
        setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
        if (name === "dni_asesor" && !errorMsg) {
            fetchAsesorData(value);
        }
    };

    const fetchAsesorData = async (dni) => {
        if (dni && (dni.length === 8 || dni.length === 9)) {
            setLoadingAsesor(true);
            setErrors(prev => ({ ...prev, dni_asesor: '', asesor: '', campana: '', supervisor: '', coordinador: ''}));
            setFormData(prevData => ({ ...prevData, asesor: '', campana: '', supervisor: '', coordinador: '' }));

            // Usar URL completa o variable de entorno para flexibilidad
            const apiUrlBase = import.meta.env.VITE_API_URL || ''; // Define VITE_API_URL en tu .env o deja '' si usas proxy
            const apiUrl = currentUser?.data_source === 'sql'
                ? `${apiUrlBase}/api/advisor/sql/${dni}`
                : `${apiUrlBase}/api/advisor/sheet/${dni}`;
            const sourceName = currentUser?.data_source === 'sql' ? 'SQL' : 'Sheet';

            try {
                const response = await axios.get(apiUrl);
                if (response.data && !response.data.error) {
                    setFormData(prevData => ({
                        ...prevData,
                        asesor: response.data.asesor || '',
                        campana: response.data.campana || '',
                        supervisor: response.data.supervisor || '',
                        coordinador: response.data.coordinador || (currentUser?.data_source === 'sql' ? 'Marjorie Landa Temoche' : '')
                    }));
                } else {
                    setErrors(prev => ({...prev, dni_asesor: response.data.error || `DNI no encontrado en ${sourceName}`}));
                }
            } catch (err) {
                 setErrors(prev => ({...prev, dni_asesor: err.response?.data?.error || `Error conectando al servidor (${sourceName})`}));
            } finally {
                setLoadingAsesor(false);
            }
        }
    };

    const validateAllFields = useCallback(() => {
        const newErrors = {};
        let isValid = true;
        const fieldsToSkipValidation = ['observaciones', 'asesor', 'campana', 'supervisor', 'coordinador', 'dni_auditor', 'nombre_auditor'];

        for (const fieldName in initialFormData) {
            if (fieldsToSkipValidation.includes(fieldName)) continue;
            const errorMsg = validateField(fieldName, formData[fieldName]);
            if (errorMsg) {
                newErrors[fieldName] = errorMsg;
                isValid = false;
            }
        }
        setErrors(newErrors);
        return isValid;
    }, [formData, initialFormData, validateField]); // Añadidas dependencias

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ loading: false, error: '', success: '' });

        if (!validateAllFields()) {
            setSubmitStatus({ loading: false, error: 'Por favor, corrija los errores en el formulario.', success: '' });
            return;
        }

        setSubmitStatus({ loading: true, error: '', success: '' });
        const dataToSubmit = { ...formData, dni_auditor: currentUser?.dni_auditor, nombre_auditor: currentUser?.nombre_completo };

        try {
            // Usar URL completa o variable de entorno para flexibilidad
            const apiUrl = import.meta.env.VITE_API_URL || ''; // Define VITE_API_URL en tu .env o deja '' si usas proxy
            const response = await axios.post(`${apiUrl}/api/submit`, dataToSubmit);

            if (response.data.success) {
                // <<<--- MODIFICADO: Mostrar toast en lugar de modal --- >>>
                toast.success('¡Registro Guardado Exitosamente!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: theme, // Usar el tema actual (light/dark)
                });
                setSubmitStatus({ loading: false, error: '', success: '¡Registro guardado exitosamente!' });
                setFormData({ ...initialFormData, dni_auditor: currentUser?.dni_auditor || '', nombre_auditor: currentUser?.nombre_completo || '' });
                setErrors({});
            } else {
                setSubmitStatus({ loading: false, error: response.data.message || 'Error al guardar el registro.', success: '' });
            }
        } catch (err) {
            setSubmitStatus({ loading: false, error: err.response?.data?.message || 'Error de conexión al enviar el formulario.', success: '' });
        }
    };

    // MODIFICADO: Eliminada función del modal
    // const handleCloseSuccessModal = () => setShowSuccessModal(false);

    const cardHeaderStyle = { backgroundColor: predominantColor, color: 'white', borderBottom: `1px solid ${predominantColor}` };
    const primaryButtonStyle = { backgroundColor: predominantColor, borderColor: predominantColor, fontWeight: 'bold' };
    const readOnlyFieldStyle = { backgroundColor: lightGrayColor, borderColor: grayColor, color: '#495057' };

    return (
        <Container fluid className="py-3">
            <Row>
                <Col>
                    <Card className="shadow-sm" style={{ borderColor: grayColor }}>
                        <Card.Header as="h5" className="text-center fw-bold py-3" style={cardHeaderStyle}>
                            <i className="bi bi-pencil-square me-2"></i>INGRESAR NUEVO REGISTRO
                        </Card.Header>
                        <Card.Body className="p-4">
                            {submitStatus.error && (
                                <Alert variant="danger" onClose={() => setSubmitStatus(prev => ({...prev, error: ''}))} dismissible style={{borderColor: errorColor}}>
                                    <Alert.Heading as="h5"><i className="bi bi-x-octagon-fill me-2"></i>Error</Alert.Heading>
                                    {submitStatus.error}
                                </Alert>
                            )}
                            <Form noValidate onSubmit={handleSubmit}>
                                {/* Teléfono y DNI Asesor */}
                                <Row className="g-3 mb-4">
                                    <Form.Group as={Col} md={6} controlId="formTelefono">
                                        <Form.Label className="fw-semibold">Teléfono:</Form.Label>
                                        <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} maxLength={9} required isInvalid={!!errors.telefono} />
                                        <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formDniAsesor">
                                        <Form.Label className="fw-semibold">DNI Asesor:</Form.Label>
                                        <div className="d-flex align-items-center">
                                            <Form.Control type="text" name="dni_asesor" value={formData.dni_asesor} onChange={handleChange} onBlur={handleBlur} maxLength={9} required isInvalid={!!errors.dni_asesor} />
                                            {loadingAsesor && <Spinner animation="border" size="sm" className="ms-2" variant="secondary"/>}
                                        </div>
                                        <Form.Control.Feedback type="invalid">{errors.dni_asesor}</Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                                {/* Asesor y Campaña */}
                                <Row className="g-3 mb-4">
                                    <Form.Group as={Col} md={6} controlId="formAsesor">
                                        <Form.Label className="fw-semibold">Asesor:</Form.Label>
                                        <Form.Control type="text" name="asesor" value={formData.asesor} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formCampana">
                                        <Form.Label className="fw-semibold">Campaña:</Form.Label>
                                        <Form.Control type="text" name="campana" value={formData.campana} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                </Row>
                                {/* Supervisor y Coordinador */}
                                <Row className="g-3 mb-4">
                                    <Form.Group as={Col} md={6} controlId="formSupervisor">
                                        <Form.Label className="fw-semibold">Supervisor:</Form.Label>
                                        <Form.Control type="text" name="supervisor" value={formData.supervisor} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formCoordinador">
                                        <Form.Label className="fw-semibold">Coordinador:</Form.Label>
                                        <Form.Control type="text" name="coordinador" value={formData.coordinador} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                </Row>
                                <hr className="my-4" style={{borderColor: grayColor, opacity: 0.5}}/>
                                {/* Tipifica y Consentimiento */}
                                <Row className="g-3 mb-4">
                                    <Form.Group as={Col} md={6} controlId="formTipificaBien">
                                        <Form.Label className="fw-semibold">¿Tipifica bien?</Form.Label>
                                        <Form.Select name="tipifica_bien" value={formData.tipifica_bien} onChange={handleChange} onBlur={handleBlur} required isInvalid={!!errors.tipifica_bien}>
                                            <option value="">Seleccione...</option> <option value="SI">SI</option> <option value="NO">NO</option> <option value="NO APLICA">NO APLICA</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.tipifica_bien}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formClienteDesiste">
                                        <Form.Label className="fw-semibold">¿Consentimiento?</Form.Label>
                                        <Form.Select name="cliente_desiste" value={formData.cliente_desiste} onChange={handleChange} onBlur={handleBlur} required isInvalid={!!errors.cliente_desiste}>
                                            <option value="">Seleccione...</option> <option value="SI">SI</option> <option value="NO">NO</option> <option value="NO APLICA">NO APLICA</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.cliente_desiste}</Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                                <hr className="my-4" style={{borderColor: grayColor, opacity: 0.5}}/>
                                {/* Auditor */}
                                <Row className="g-3 mb-4">
                                    <Form.Group as={Col} md={6} controlId="formDniAuditor">
                                        <Form.Label className="fw-semibold">DNI Auditor:</Form.Label>
                                        <Form.Control type="text" name="dni_auditor" value={formData.dni_auditor} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formNombreAuditor">
                                        <Form.Label className="fw-semibold">Nombre Auditor:</Form.Label>
                                        <Form.Control type="text" name="nombre_auditor" value={formData.nombre_auditor} readOnly style={readOnlyFieldStyle}/>
                                    </Form.Group>
                                </Row>
                                {/* Observaciones */}
                                <Form.Group className="mb-4" controlId="formObservaciones">
                                    <Form.Label className="fw-semibold">Observaciones:</Form.Label>
                                    <Form.Control as="textarea" name="observaciones" rows={3} value={formData.observaciones} onChange={handleChange} />
                                </Form.Group>
                                {/* Botón de Envío */}
                                <div className="d-grid">
                                    <Button style={primaryButtonStyle} type="submit" size="lg" disabled={submitStatus.loading}>
                                        {submitStatus.loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Registrando...</> : <><i className="bi bi-check-circle-fill me-2"></i>Registrar</>}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* MODIFICADO: Eliminado Modal */}
        </Container>
    );
}
export default RegistroForm;
