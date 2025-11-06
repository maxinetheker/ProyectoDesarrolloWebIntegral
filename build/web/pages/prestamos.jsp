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
    
    if (!esAdmin && !esBibliotecario) {
        response.sendRedirect("dashboard.jsp?error=noauth");
        return;
    }
    
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
    pageContext.setAttribute("esBibliotecario", esBibliotecario);
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Préstamos - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-2 sm:px-4">
            <div class="flex justify-between items-center py-3 sm:py-4">
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <div class=""><img src="../assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-10 w-10 sm:h-14 sm:w-14"></div>
                    <div>
                        <h1 class="text-white text-base sm:text-2xl font-bold">Sistema de Biblioteca</h1>
                        <p class="text-slate-300 text-xs sm:text-sm hidden sm:block">Gestión Integral</p>
                    </div>
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

    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-2 sm:px-4 relative">
            <div class="sm:hidden flex items-center justify-between py-2">
                <button id="menu-button" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-slate-700 hover:bg-gray-100 focus:outline-none">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <span class="text-sm font-medium text-slate-700">
                    <i class="fas fa-exchange-alt mr-1"></i>Préstamos
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
                <a href="libros.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-book mr-2"></i>Libros
                </a>
                <a href="prestamos.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-exchange-alt mr-2"></i>Préstamos
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
                <a href="libros.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-book mr-2"></i>Libros
                </a>
                <a href="prestamos.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 bg-slate-50 text-slate-700">
                    <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                </a>
            </nav>
        </div>
    </div>

    <div class="bg-gray-100 border-b border-gray-300">
        <div class="container mx-auto px-2 sm:px-4">
            <!-- Mobile Grid Layout (2x2) -->
            <div class="grid grid-cols-2 gap-0 sm:hidden">
                <button onclick="cambiarSeccion('devoluciones-pendientes')" id="tab-devoluciones-pendientes" 
                    class="px-2 py-3 text-xs font-medium border-b-2 border-r border-blue-600 text-blue-600 bg-white">
                    <i class="fas fa-clock mr-1"></i>Pendientes
                </button>
                <button onclick="cambiarSeccion('libros-devueltos')" id="tab-libros-devueltos" 
                    class="px-2 py-3 text-xs font-medium border-b-2 border-transparent text-gray-600 bg-white hover:text-gray-800">
                    <i class="fas fa-check-circle mr-1"></i>Devueltos
                </button>
                <button onclick="cambiarSeccion('multas-pendientes')" id="tab-multas-pendientes" 
                    class="px-2 py-3 text-xs font-medium border-b-2 border-r border-transparent text-gray-600 bg-white hover:text-gray-800">
                    <i class="fas fa-exclamation-triangle mr-1"></i>M. Pendientes
                </button>
                <button onclick="cambiarSeccion('multas-pagadas')" id="tab-multas-pagadas" 
                    class="px-2 py-3 text-xs font-medium border-b-2 border-transparent text-gray-600 bg-white hover:text-gray-800">
                    <i class="fas fa-dollar-sign mr-1"></i>M. Pagadas
                </button>
            </div>
            
            <!-- Desktop Horizontal Layout -->
            <div class="hidden sm:flex space-x-1 overflow-x-auto">
                <button onclick="cambiarSeccion('devoluciones-pendientes')" id="tab-devoluciones-pendientes-desktop" 
                    class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 border-blue-600 text-blue-600">
                    <i class="fas fa-clock mr-1 sm:mr-2"></i>Devoluciones Pendientes
                </button>
                <button onclick="cambiarSeccion('libros-devueltos')" id="tab-libros-devueltos-desktop" 
                    class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                    <i class="fas fa-check-circle mr-1 sm:mr-2"></i>Libros Devueltos
                </button>
                <button onclick="cambiarSeccion('multas-pendientes')" id="tab-multas-pendientes-desktop" 
                    class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                    <i class="fas fa-exclamation-triangle mr-1 sm:mr-2"></i>Multas Pendientes
                </button>
                <button onclick="cambiarSeccion('multas-pagadas')" id="tab-multas-pagadas-desktop" 
                    class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                    <i class="fas fa-dollar-sign mr-1 sm:mr-2"></i>Multas Pagadas
                </button>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div id="seccion-devoluciones-pendientes" class="seccion-prestamo">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="p-3 sm:p-6 border-b border-gray-200">
                    <div class="mb-4">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                            <i class="fas fa-clock text-gray-600 mr-2"></i>
                            Devoluciones Pendientes
                        </h2>
                        <p class="text-gray-600 text-xs sm:text-sm mt-1">Préstamos activos que deben ser devueltos</p>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between items-stretch gap-3 mb-3">
                        <div class="flex flex-col sm:flex-row gap-3 flex-1">
                            <div class="relative flex-1 max-w-full sm:max-w-md">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                                <input type="text" id="buscar-devoluciones" placeholder="Buscar por libro, usuario, ISBN..."
                                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm" autocomplete="off">
                            </div>
                            <div class="flex-shrink-0 w-full sm:w-48">
                                <select id="filtro-vencimiento" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm">
                                    <option value="todos">Todos los préstamos</option>
                                    <option value="vencidos">Solo vencidos</option>
                                    <option value="no_vencidos">Solo no vencidos</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="abrirModalNuevoPrestamo()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm whitespace-nowrap text-sm">
                            <i class="fas fa-plus mr-2"></i>Nuevo Préstamo
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Fecha Préstamo</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-devoluciones" class="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                    <p class="text-sm">Cargando préstamos...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div id="paginacion-devoluciones" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="text-xs sm:text-sm text-gray-700">
                        Mostrando <span id="info-registros-devoluciones"></span>
                    </div>
                    <div id="botones-paginacion-devoluciones" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
                </div>
            </div>
        </div>

        <div id="seccion-libros-devueltos" class="seccion-prestamo hidden">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="p-3 sm:p-6 border-b border-gray-200">
                    <div class="mb-4">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                            <i class="fas fa-check-circle text-gray-600 mr-2"></i>
                            Libros Devueltos
                        </h2>
                        <p class="text-gray-600 text-xs sm:text-sm mt-1">Historial de devoluciones realizadas</p>
                    </div>
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="buscar-devueltos" placeholder="Buscar por libro, usuario, ISBN..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-sm" autocomplete="off">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">F. Préstamo</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Devolución</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Multa</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-devueltos" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>
                <div id="paginacion-devueltos" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="text-xs sm:text-sm text-gray-700">
                        Mostrando <span id="info-registros-devueltos"></span>
                    </div>
                    <div id="botones-paginacion-devueltos" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
                </div>
            </div>
        </div>
        <div id="seccion-multas-pendientes" class="seccion-prestamo hidden">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="p-3 sm:p-6 border-b border-gray-200">
                    <div class="mb-4">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                            <i class="fas fa-exclamation-triangle text-gray-600 mr-2"></i>
                            Multas Pendientes
                        </h2>
                        <p class="text-gray-600 text-xs sm:text-sm mt-1">Multas por pagar</p>
                    </div>
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="buscar-multas-pendientes" placeholder="Buscar por libro, usuario, ID préstamo..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 text-sm" autocomplete="off">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">F. Préstamo</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">F. Devolución</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multa</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-multas-pendientes" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>
                <div id="paginacion-multas-pendientes" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="text-xs sm:text-sm text-gray-700">
                        Mostrando <span id="info-registros-multas-pendientes"></span>
                    </div>
                    <div id="botones-paginacion-multas-pendientes" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
                </div>
            </div>
        </div>
        <div id="seccion-multas-pagadas" class="seccion-prestamo hidden">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="p-3 sm:p-6 border-b border-gray-200">
                    <div class="mb-4">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                            <i class="fas fa-dollar-sign text-gray-600 mr-2"></i>
                            Multas Pagadas
                        </h2>
                        <p class="text-gray-600 text-xs sm:text-sm mt-1">Historial de multas pagadas</p>
                    </div>
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="buscar-multas-pagadas" placeholder="Buscar por libro, usuario, ID préstamo..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 text-sm" autocomplete="off">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">F. Préstamo</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">F. Devolución</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multa</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-multas-pagadas" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>
                <div id="paginacion-multas-pagadas" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="text-xs sm:text-sm text-gray-700">
                        Mostrando <span id="info-registros-multas-pagadas"></span>
                    </div>
                    <div id="botones-paginacion-multas-pagadas" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.CONTEXT_PATH = '${pageContext.request.contextPath}';
        window.ES_ADMIN = ${esAdmin};
        
        const menuButton = document.getElementById('menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/prestamos-devoluciones.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/prestamos-devueltos.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/prestamos-multas-pendientes.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/prestamos-multas-pagadas.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/prestamos-main.js"></script>
</body>
</html>
