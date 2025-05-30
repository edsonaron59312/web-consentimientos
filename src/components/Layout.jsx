// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas, Spinner } from 'react-bootstrap'; // Spinner añadido
import { useAuth } from './AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // Importar useTheme

// Importaciones para react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Estilos para los toasts

// Paleta de colores base (Light Theme)
const predominantColorLight = '#074F69';
const secondaryColorForHoverLight = '#053a4e';
const textColorOnPrimaryLight = '#FFFFFF';
const textColorLightLight = '#E9ECEF';
const contentBgColorLight = '#f4f7f6';
const hrBorderColorLight = 'rgba(255,255,255,0.2)';
const offcanvasHeaderBorderLight = 'rgba(255,255,255,0.2)';

// Paleta de colores Dark Theme
const predominantColorDark = '#1A2833'; // Un azul más oscuro o gris oscuro
const secondaryColorForHoverDark = '#243B4A'; // Un poco más claro para hover
const textColorOnPrimaryDark = '#E0E0E0'; // Texto claro sobre primario oscuro
const textColorLightDark = '#B0B0B0'; // Texto secundario grisáceo
const contentBgColorDark = '#121212'; // Fondo de contenido muy oscuro
const hrBorderColorDark = 'rgba(255,255,255,0.1)';
const offcanvasHeaderBorderDark = 'rgba(255,255,255,0.1)';


function Layout() {
    const { currentUser, logout, isLoading: authIsLoading } = useAuth();
    const { theme, toggleTheme } = useTheme(); // Usar el contexto de tema
    const navigate = useNavigate();
    const location = useLocation();
    const [showOffcanvasSidebar, setShowOffcanvasSidebar] = useState(false);
    const sidebarWidth = 260;
    const navbarHeight = 56;

    // Seleccionar colores basados en el tema actual
    const isDarkTheme = theme === 'dark';
    const predominantColor = isDarkTheme ? predominantColorDark : predominantColorLight;
    const secondaryColorForHover = isDarkTheme ? secondaryColorForHoverDark : secondaryColorForHoverLight;
    const textColorOnPrimary = isDarkTheme ? textColorOnPrimaryDark : textColorOnPrimaryLight;
    const textColorLight = isDarkTheme ? textColorLightDark : textColorLightLight;
    const contentBgColor = isDarkTheme ? contentBgColorDark : contentBgColorLight;
    const hrBorderColor = isDarkTheme ? hrBorderColorDark : hrBorderColorLight;
    const offcanvasHeaderBorderColor = isDarkTheme ? offcanvasHeaderBorderDark : offcanvasHeaderBorderLight;


    const handleLogout = async () => {
        try {
            await logout();
            toast.info('Has cerrado sesión exitosamente.', { theme: theme });
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            toast.error("Error al cerrar sesión. Inténtalo de nuevo.", { theme: theme });
            navigate('/login');
        }
    };

    const handleCloseOffcanvas = () => setShowOffcanvasSidebar(false);
    const handleShowOffcanvas = () => setShowOffcanvasSidebar(true);

    useEffect(() => {
        const mainContent = document.getElementById('mainContentArea');
        const pageFooter = document.getElementById('pageFooter');
        const adjustLayout = () => {
            if (mainContent) {
                const isLg = window.innerWidth >= 992;
                const currentMarginLeft = isLg && currentUser ? `${sidebarWidth}px` : '0px';
                mainContent.style.marginLeft = currentMarginLeft;
                if (pageFooter) pageFooter.style.marginLeft = currentMarginLeft;
            }
        };
        
        if(currentUser) adjustLayout();
        
        window.addEventListener('resize', adjustLayout);
        return () => window.removeEventListener('resize', adjustLayout);
    }, [currentUser]);

    if (authIsLoading && !currentUser) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: contentBgColor}}>
                <Spinner animation="border" style={{width: '3rem', height: '3rem', color: predominantColor}} />
                <span className="ms-3 fs-5 text-secondary">Cargando aplicación...</span>
            </div>
        );
    }
    
    if (!currentUser && !authIsLoading) { 
        return <div className="d-flex justify-content-center align-items-center vh-100">Redirigiendo a inicio de sesión...</div>;
    }
    
    const navLinkBaseStyle = {
        color: textColorLight,
        paddingTop: '0.85rem',
        paddingBottom: '0.85rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        marginBottom: '0.3rem',
        borderRadius: '0.375rem',
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    };

    const navLinkActiveStyle = {
        ...navLinkBaseStyle,
        backgroundColor: secondaryColorForHover,
        color: textColorOnPrimary,
        fontWeight: 'bold',
    };
    
    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const commonNavLinks = (
        <>
            <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} style={isActive('/') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                <i className="bi bi-house-door-fill me-2"></i>Dashboard Home
            </Nav.Link>
            <Nav.Link as={Link} to="/registrar" onClick={handleCloseOffcanvas} style={isActive('/registrar') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                <i className="bi bi-pencil-square me-2"></i>Registrar Escucha
            </Nav.Link>
            <Nav.Link as={Link} to="/registros" onClick={handleCloseOffcanvas} style={isActive('/registros') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                <i className="bi bi-table me-2"></i>Ver Registros
            </Nav.Link>
        </>
    );

    const adminNavLinks = (
        <>
            {currentUser && currentUser.rol === 'admin' && ( 
                <>
                    <hr style={{borderColor: hrBorderColor, opacity: 0.75}}/>
                    <Nav.Link as={Link} to="/admin/dashboard" onClick={handleCloseOffcanvas} style={isActive('/admin/dashboard') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                        <i className="bi bi-bar-chart-line-fill me-2"></i>Dashboard Admin
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/usuarios" onClick={handleCloseOffcanvas} style={isActive('/admin/usuarios') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                        <i className="bi bi-person-fill-gear me-2"></i>Gestionar Usuarios
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/auditoria" onClick={handleCloseOffcanvas} style={isActive('/admin/auditoria') ? navLinkActiveStyle : navLinkBaseStyle} className="d-flex align-items-center sidebar-link-custom">
                        <i className="bi bi-journal-richtext me-2"></i>Logs de Auditoría
                    </Nav.Link>
                </>
            )}
        </>
    );
    
    // El estilo hover se maneja dinámicamente con las variables de color
    const sidebarLinkHoverEffect = `
        .sidebar-link-custom:hover {
            background-color: ${secondaryColorForHover} !important;
            color: ${textColorOnPrimary} !important;
        }
    `;

    return (
        <>
            <style>{sidebarLinkHoverEffect}</style>
            <ToastContainer
                position="top-right"
                autoClose={4000} 
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme} // Usar el tema del contexto directamente
            />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar 
                    style={{backgroundColor: predominantColor, height: `${navbarHeight}px`}} 
                    variant="dark" // Mantenemos variant="dark" para el texto y los íconos de Bootstrap, o ajustamos según el tema
                    expand={false} 
                    className="px-3 shadow-sm" 
                    fixed="top" 
                >
                    {currentUser && (
                        <Button variant="outline-light" onClick={handleShowOffcanvas} className="d-lg-none me-2">
                            <i className="bi bi-list fs-4"></i>
                        </Button>
                    )}
                    <Navbar.Brand as={Link} to={currentUser ? "/" : "/login"} style={{color: textColorOnPrimary, fontWeight:'bold', fontSize: '1.25rem'}}>
                        <i className="bi bi-shield-check-fill me-2"></i>Gestión Salesland
                    </Navbar.Brand>
                    {currentUser && ( 
                        <Nav className="ms-auto align-items-center flex-row">
                             <Button 
                                variant="outline-light" 
                                onClick={toggleTheme} 
                                className="me-2 py-1 px-2"
                                size="sm"
                            >
                                <i className={`bi ${isDarkTheme ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
                            </Button>
                            <Navbar.Text className="me-3 d-none d-md-block" style={{color: textColorLight, fontSize: '0.9rem'}}>
                                <i className="bi bi-person-circle me-1"></i>
                                {currentUser.nombre_completo} ({currentUser.rol?.toUpperCase()})
                            </Navbar.Text>
                            <Button 
                                variant={isDarkTheme ? "outline-danger" : "danger"} // Ajustar variante del botón de logout
                                size="sm" 
                                onClick={handleLogout} 
                                className="py-1 px-2"
                            >
                                <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                            </Button>
                        </Nav>
                    )}
                </Navbar>

                <div className="d-flex flex-grow-1" style={{ paddingTop: `${navbarHeight}px`}}>
                    {currentUser && (
                        <>
                            <Nav 
                                className="flex-column p-3 d-none d-lg-flex shadow-lg" 
                                style={{ 
                                    width: `${sidebarWidth}px`, 
                                    height: `calc(100vh - ${navbarHeight}px)`, 
                                    position: 'fixed', 
                                    top: `${navbarHeight}px`, 
                                    left: 0, 
                                    overflowY: 'auto', 
                                    zIndex: 1020, 
                                    backgroundColor: predominantColor 
                                }}
                            >
                                {commonNavLinks}
                                {adminNavLinks}
                            </Nav>

                            <Offcanvas 
                                show={showOffcanvasSidebar} 
                                onHide={handleCloseOffcanvas} 
                                placement="start" 
                                style={{
                                    backgroundColor: predominantColor, 
                                    color: textColorOnPrimary, 
                                    top: `${navbarHeight}px`, 
                                    width: `${sidebarWidth}px`, 
                                    zIndex:1045
                                }}
                                className="shadow-lg"
                                // data-bs-theme={theme} // Podrías añadir esto si usas Bootstrap 5.3+ para que los componentes internos reaccionen
                            >
                                <Offcanvas.Header 
                                    closeButton 
                                    closeVariant={isDarkTheme ? 'white' : 'white'} // closeVariant puede necesitar ajuste o ser estilizado
                                    className="pb-2" 
                                    style={{borderBottom: `1px solid ${offcanvasHeaderBorderColor}`}}
                                >
                                    <Offcanvas.Title style={{fontWeight: 'bold', color: textColorOnPrimary}}>Menú Principal</Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body className="pt-2">
                                    <Nav className="flex-column">
                                        {commonNavLinks}
                                        {adminNavLinks}
                                    </Nav>
                                </Offcanvas.Body>
                            </Offcanvas>
                        </>
                    )}
                    <main 
                        id="mainContentArea" 
                        className="flex-grow-1"
                        style={{ 
                            overflowY: 'auto', 
                            backgroundColor: contentBgColor, 
                            transition: 'margin-left 0.2s ease-in-out, background-color 0.3s ease-in-out', // Añadida transición para el color de fondo
                            color: isDarkTheme ? '#E0E0E0' : '#212529', // Color de texto base para el contenido principal
                            marginLeft: currentUser && window.innerWidth >= 992 ? `${sidebarWidth}px` : '0px'
                        }}
                    >
                        <Outlet /> 
                    </main>
                </div>
                {currentUser && (
                    <footer 
                        id="pageFooter"
                        className="text-center p-2" 
                        style={{ 
                            backgroundColor: predominantColor, 
                            color: textColorLight, 
                            fontSize: '0.85rem',
                            transition: 'margin-left 0.2s ease-in-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out', // Transiciones
                            marginLeft: currentUser && window.innerWidth >= 992 ? `${sidebarWidth}px` : '0px'
                        }}
                    >
                         PYM Area de Desarrollo ™ - React Version
                    </footer>
                )}
            </div>
        </>
    );
}

export default Layout;
