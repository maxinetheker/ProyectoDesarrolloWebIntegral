<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="model.Usuario" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    if (usuario == null) {
        response.sendRedirect("login.jsp?sessionExpired=true");
        return;
    }
    
    String rol = usuario.getNombreRol();
    boolean esAdmin = "Administrador".equals(rol);
    boolean esBibliotecario = "Bibliotecario".equals(rol);
    boolean puedeGestionar = esAdmin || esBibliotecario;
    
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
    pageContext.setAttribute("esBibliotecario", esBibliotecario);
    pageContext.setAttribute("puedeGestionar", puedeGestionar);
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo de Libros - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/assets/css/catalogo.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar Principal -->
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-2 sm:px-4">
            <div class="flex justify-between items-center py-3 sm:py-4">
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <a href="${pageContext.request.contextPath}/index.jsp" class="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity">
                        <div class=""><img src="${pageContext.request.contextPath}/assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-10 w-10 sm:h-14 sm:w-14"></div>
                        
                        <div>
                            <h1 class="text-white text-base sm:text-2xl font-bold">Sistema de Biblioteca</h1>
                            <p class="text-slate-300 text-xs sm:text-sm hidden sm:block">Gestión Integral</p>
                        </div>
                    </a>
                </div>
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <div class="text-right hidden md:block">
                        <p class="text-white font-semibold text-sm"><c:out value="${usuario.nombreCompleto}" /></p>
                        <p class="text-slate-300 text-xs">
                            <i class="fas fa-user-shield"></i> <c:out value="${usuario.nombreRol}" />
                        </p>
                    </div>
                    <a href="${pageContext.request.contextPath}/logout" class="bg-white text-slate-700 px-2 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-100 transition duration-200 shadow-sm flex items-center">
                        <i class="fas fa-sign-out-alt sm:mr-2"></i>
                        <span class="hidden sm:inline">Cerrar Sesión</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Subheader con Pestañas -->

    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-2 sm:px-4 relative">
            <div class="sm:hidden flex items-center justify-between py-2">
                <button id="menu-button" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-slate-700 hover:bg-gray-100 focus:outline-none">
                    <i class="fas fa-bars"></i>
                </button>
                <span class="text-sm font-medium text-slate-700">
                    Catálogo
                </span>
                <div class="w-10"></div>
            </div>
            
            <nav class="hidden sm:flex space-x-1" role="navigation">
                <a href="dashboard.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <c:if test="${esAdmin}">
                    <a href="usuarios.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-users mr-2"></i>Usuarios
                    </a>
                </c:if>
                <c:if test="${puedeGestionar}">
                    <a href="libros.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-book mr-2"></i>Libros
                    </a>
                    <a href="prestamos.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                    </a>
                </c:if>
                <a href="catalogo.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-th mr-2"></i>Catálogo
                </a>
                <a href="mis-prestamos.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-book-reader mr-2"></i>Mis Préstamos
                </a>
                <a href="mis-multas.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-exclamation-circle mr-2"></i>Mis Multas
                </a>
            </nav>
            
            <nav id="mobile-menu" class="hidden sm:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" role="navigation">
                <a href="dashboard.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <c:if test="${esAdmin}">
                    <a href="usuarios.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-users mr-2"></i>Usuarios
                    </a>
                </c:if>
                <c:if test="${puedeGestionar}">
                    <a href="libros.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-book mr-2"></i>Libros
                    </a>
                    <a href="prestamos.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                    </a>
                </c:if>
                <a href="catalogo.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 text-slate-700 bg-gray-50">
                    <i class="fas fa-th mr-2"></i>Catálogo
                </a>
                <a href="mis-prestamos.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-book-reader mr-2"></i>Mis Préstamos
                </a>
                <a href="mis-multas.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-exclamation-circle mr-2"></i>Mis Multas
                </a>
            </nav>
        </div>
    </div>

    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <!-- Search Bar -->
        <div class="mb-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="search-input-container max-w-2xl mx-auto">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           id="buscar-catalogo" 
                           placeholder="Buscar por nombre, autor, ISBN, categoría..." 
                           class="search-input w-full px-4 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                </div>
            </div>
        </div>

        <!-- Books Grid -->
        <div id="catalogo-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <!-- Books will be loaded here -->
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden text-center py-12">
            <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">No se encontraron libros</p>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-slate-600 mb-4"></i>
            <p class="text-gray-500">Cargando catálogo...</p>
        </div>

        <!-- Pagination -->
        <div id="paginacion" class="hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div id="info-registros" class="text-xs sm:text-sm text-gray-700"></div>
                <div id="botones-paginacion" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
            </div>
        </div>
    </div>

    <!-- Modal Detail -->
    <div id="modalDetalle" class="hidden fixed inset-0 bg-gray-900 bg-opacity-60 modal-backdrop overflow-y-auto h-full w-full z-50">
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden">
                <!-- Close Button -->
                <button onclick="cerrarModal()" 
                        class="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition">
                    <i class="fas fa-times text-gray-600 text-xl"></i>
                </button>

                <div class="grid md:grid-cols-2 gap-0">
                    <!-- Image Section -->
                    <div class="bg-gray-100 p-8 flex items-center justify-center">
                        <div id="modal-image-wrapper" class="modal-image-container w-full max-w-sm">
                            <img id="modal-image" src="" alt="Portada" class="w-full h-auto rounded-lg shadow-xl object-contain">
                        </div>
                    </div>

                    <!-- Details Section -->
                    <div class="p-8 overflow-y-auto max-h-[600px]">
                        <div class="mb-6">
                            <h2 id="modal-titulo" class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"></h2>
                            <p id="modal-autor" class="text-lg text-slate-600 mb-4"></p>
                            
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span id="modal-disponibilidad" class="px-3 py-1 text-sm font-semibold rounded-full"></span>
                                <span id="modal-genero" class="px-3 py-1 text-sm font-semibold rounded-full bg-slate-100 text-slate-700"></span>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="border-l-4 border-slate-600 pl-4">
                                <h3 class="text-sm font-semibold text-gray-600 uppercase mb-1">ISBN</h3>
                                <p id="modal-isbn" class="text-gray-900 font-mono"></p>
                            </div>

                            <div class="border-l-4 border-slate-600 pl-4">
                                <h3 class="text-sm font-semibold text-gray-600 uppercase mb-1">Editorial</h3>
                                <p id="modal-editorial" class="text-gray-900"></p>
                            </div>

                            <div class="border-l-4 border-slate-600 pl-4">
                                <h3 class="text-sm font-semibold text-gray-600 uppercase mb-1">Año de Publicación</h3>
                                <p id="modal-anio" class="text-gray-900"></p>
                            </div>

                            <div class="border-l-4 border-slate-600 pl-4">
                                <h3 class="text-sm font-semibold text-gray-600 uppercase mb-1">Ubicación</h3>
                                <p id="modal-ubicacion" class="text-gray-900"></p>
                            </div>

                            <div class="border-l-4 border-slate-600 pl-4">
                                <h3 class="text-sm font-semibold text-gray-600 uppercase mb-2">Descripción</h3>
                                <p id="modal-descripcion" class="text-gray-700 leading-relaxed"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.CONTEXT_PATH = '${pageContext.request.contextPath}';
        
        const menuButton = document.getElementById('menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    </script>
    <script src="${pageContext.request.contextPath}/assets/js/catalogo.js"></script>
</body>
</html>
