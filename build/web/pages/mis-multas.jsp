<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="model.Usuario" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    // Verificar si hay sesión activa
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    if (usuario == null) {
        response.sendRedirect("login.jsp?sessionExpired=true");
        return;
    }
    
    String nombreCompleto = usuario.getNombreCompleto();
    String rol = usuario.getNombreRol();
    boolean esAdmin = "Administrador".equals(rol);
    boolean esBibliotecario = "Bibliotecario".equals(rol);
    boolean puedeGestionar = esAdmin || esBibliotecario;
    
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
    pageContext.setAttribute("esBibliotecario", esBibliotecario);
    pageContext.setAttribute("puedeGestionar", puedeGestionar);
    pageContext.setAttribute("paginaActual", "mis-multas");
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Multas - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar Principal -->
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-2 sm:px-4">
            <div class="flex justify-between items-center py-3 sm:py-4">
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <a href="${pageContext.request.contextPath}/index.jsp" class="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity">
                        <div class=""><img src="../assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-10 w-10 sm:h-14 sm:w-14"></div>
                        
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
            <!-- Mobile menu button -->
            <div class="sm:hidden flex items-center justify-between py-2">
                <button id="menu-button" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-slate-700 hover:bg-gray-100 focus:outline-none">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <span class="text-sm font-medium text-slate-700">
                    <i class="fas fa-money-bill-wave mr-1"></i>Mis Multas
                </span>
                <div class="w-10"></div>
            </div>
            
            <!-- Desktop menu -->
            <nav class="hidden sm:flex space-x-1" role="navigation">
                <a href="dashboard.jsp" 
                   class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <c:if test="${esAdmin}">
                    <a href="usuarios.jsp"
                       class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-users mr-2"></i>Usuarios
                    </a>
                </c:if>
                <c:if test="${puedeGestionar}">
                    <a href="libros.jsp"
                       class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-book mr-2"></i>Libros
                    </a>
                    <a href="prestamos.jsp"
                       class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                    </a>
                </c:if>
                <a href="mis-prestamos.jsp"
                   class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-book-reader mr-2"></i>Mis Préstamos
                </a>
                <a href="mis-multas.jsp"
                   class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-money-bill-wave mr-2"></i>Mis Multas
                </a>
            </nav>
            
            <!-- Mobile menu -->
            <nav id="mobile-menu" class="hidden sm:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" role="navigation">
                <a href="dashboard.jsp" 
                   class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <c:if test="${esAdmin}">
                    <a href="usuarios.jsp"
                       class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-users mr-2"></i>Usuarios
                    </a>
                </c:if>
                <c:if test="${puedeGestionar}">
                    <a href="libros.jsp"
                       class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-book mr-2"></i>Libros
                    </a>
                    <a href="prestamos.jsp"
                       class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                        <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                    </a>
                </c:if>
                <a href="mis-prestamos.jsp"
                   class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-book-reader mr-2"></i>Mis Préstamos
                </a>
                <a href="mis-multas.jsp"
                   class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 bg-slate-50 text-slate-700">
                    <i class="fas fa-money-bill-wave mr-2"></i>Mis Multas
                </a>
            </nav>
        </div>
    </div>

    <!-- Container Principal -->
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <!-- Sección Mis Multas -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Encabezado -->
            <div class="p-3 sm:p-6 border-b border-gray-200">
                <div class="mb-4">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                        <i class="fas fa-money-bill-wave text-gray-600 mr-2"></i>
                        Mis Multas
                    </h2>
                    <p class="text-gray-600 text-xs sm:text-sm mt-1">Consulta el estado de tus multas por préstamos vencidos</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <!-- Campo de búsqueda con ícono -->
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input type="text" 
                               id="buscar-multas" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm"
                               placeholder="Buscar por libro, autor o ISBN...">
                    </div>
                    <!-- Filtro de estado -->
                    <div class="flex gap-2">
                        <select id="filtro-estado" class="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white">
                            <option value="todas">Todas las multas</option>
                            <option value="pendientes">Multas pendientes</option>
                            <option value="pagadas">Multas pagadas</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabla de Multas -->
            <div class="overflow-x-auto">
                <!-- Vista Desktop -->
                <table class="min-w-full divide-y divide-gray-200 hidden sm:table">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Préstamo</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Devolución</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multa</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-multas" class="bg-white divide-y divide-gray-200">
                        <!-- Fila de carga -->
                        <tr id="carga-multas">
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i>Cargando multas...
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Vista Mobile - Cards -->
                <div id="multas-mobile" class="block sm:hidden space-y-3">
                    <!-- Indicador de carga móvil -->
                    <div id="carga-multas-mobile" class="text-center py-8 text-gray-500">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Cargando multas...
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex flex-1 justify-between sm:hidden">
                    <button onclick="cambiarPagina(paginaActual - 1)" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Anterior
                    </button>
                    <button onclick="cambiarPagina(paginaActual + 1)" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Siguiente
                    </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Mostrando multas página <span class="font-medium" id="pagina-actual-multas">1</span> de 
                            <span class="font-medium" id="total-paginas-multas">1</span>
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" id="paginacion-multas">
                            <!-- Botones de paginación se generarán aquí -->
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Información de resultados -->
            <div class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                <div class="text-xs sm:text-sm text-gray-700">
                    Total de multas: <span id="total-multas" class="font-semibold">0</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configurar contexto de la aplicación
        window.CONTEXT_PATH = '${pageContext.request.contextPath}';
        
        // Toggle mobile menu
        const menuButton = document.getElementById('menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="${pageContext.request.contextPath}/assets/js/mis-multas.js"></script>
</body>
</html>