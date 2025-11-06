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
    
    // Solo administradores pueden acceder a esta página
    if (!esAdmin) {
        response.sendRedirect("dashboard.jsp?error=noauth");
        return;
    }
    
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
    pageContext.setAttribute("esBibliotecario", esBibliotecario);
    pageContext.setAttribute("puedeGestionar", puedeGestionar);
    pageContext.setAttribute("paginaActual", "usuarios");
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Sistema de Biblioteca</title>
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
                    <i class="fas fa-users mr-1"></i>Usuarios
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
                       class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
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
                   class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
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
                       class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 bg-slate-50 text-slate-700">
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
                   class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-money-bill-wave mr-2"></i>Mis Multas
                </a>
            </nav>
        </div>
    </div>

    <!-- Container Principal -->
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <!-- Sección Gestión de Usuarios -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Encabezado -->
            <div class="p-3 sm:p-6 border-b border-gray-200">
                <div class="mb-4">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                        <i class="fas fa-users-cog text-slate-600 mr-2"></i>
                        Gestión de Usuarios
                    </h2>
                    <p class="text-gray-600 text-xs sm:text-sm mt-1">Administra los usuarios del sistema</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <!-- Campo de búsqueda con ícono -->
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="buscar-usuario" 
                            placeholder="Buscar por usuario, nombre o email..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200 text-sm"
                            autocomplete="off"
                        >
                    </div>
                    <button onclick="abrirModalCrear()" 
                            class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm whitespace-nowrap text-sm">
                        <i class="fas fa-plus mr-2"></i>Nuevo Usuario
                    </button>
                </div>
            </div>

            <!-- Tabla de Usuarios -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Nombre Completo</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Teléfono</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-usuarios" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="6" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                                <p class="text-sm">Cargando usuarios...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div id="paginacion" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="text-xs sm:text-sm text-gray-700">
                    Mostrando <span id="info-registros"></span>
                </div>
                <div id="botones-paginacion" class="flex flex-wrap justify-center gap-1 sm:gap-2">
                    <!-- Los botones se generarán dinámicamente -->
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Crear/Editar Usuario -->
    <div id="modalUsuario" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-4">
            <div class="mt-2 sm:mt-3">
                <!-- Encabezado Modal -->
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 id="modal-titulo" class="text-lg sm:text-2xl font-bold text-gray-900">
                        <i class="fas fa-user-plus text-slate-600 mr-2"></i>
                        Nuevo Usuario
                    </h3>
                    <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-xl sm:text-2xl"></i>
                    </button>
                </div>

                <!-- Formulario -->
                <form id="formUsuario" class="mt-3 sm:mt-4">
                    <input type="hidden" id="usuario-id" name="id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <!-- Usuario -->
                        <div class="col-span-1">
                            <label for="usuario-usuario" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Usuario <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-usuario" name="usuario" required
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Rol -->
                        <div class="col-span-1">
                            <label for="usuario-rol" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Rol <span class="text-red-500">*</span>
                            </label>
                            <select id="usuario-rol" name="idRol" required
                                    class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                                <option value="">Seleccione un rol</option>
                            </select>
                        </div>

                        <!-- Nombre -->
                        <div class="col-span-1">
                            <label for="usuario-nombre" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Nombre <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-nombre" name="nombre" required
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Apellido -->
                        <div class="col-span-1">
                            <label for="usuario-apellido" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Apellido <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-apellido" name="apellido" required
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Email -->
                        <div class="col-span-1">
                            <label for="usuario-email" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input type="email" id="usuario-email" name="email"
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Teléfono -->
                        <div class="col-span-1">
                            <label for="usuario-telefono" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input type="tel" id="usuario-telefono" name="telefono"
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Contraseña -->
                        <div id="campo-contrasena" class="col-span-1">
                            <label for="usuario-contrasena" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Contraseña <span id="required-contrasena" class="text-red-500">*</span>
                                <span id="texto-opcional" class="hidden text-xs text-gray-500">(opcional - dejar vacío si no desea cambiarla)</span>
                            </label>
                            <input type="password" id="usuario-contrasena" name="contrasena" 
                                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Dirección -->
                        <div class="col-span-1 md:col-span-2">
                            <label for="usuario-direccion" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <textarea id="usuario-direccion" name="direccion" rows="2"
                                      class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"></textarea>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                        <button type="button" onclick="cerrarModal()" 
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200 font-medium text-sm">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" id="btn-guardar"
                                class="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-200 font-medium text-sm">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Carnet de Biblioteca -->
    <div id="modal-carnet" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-4 sm:top-10 mx-auto p-3 sm:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-4">
            <div class="mt-2 sm:mt-3">
                <!-- Encabezado Modal -->
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 class="text-lg sm:text-2xl font-bold text-gray-900">
                        <i class="fas fa-id-card text-slate-600 mr-2"></i>
                        Carnet de Biblioteca
                    </h3>
                    <button onclick="cerrarModalCarnet()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-xl sm:text-2xl"></i>
                    </button>
                </div>

                <!-- Alerta si está vencido -->
                <div id="alerta-vencido" class="hidden mt-3 sm:mt-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative text-sm">
                    <strong class="font-bold">¡Carnet vencido!</strong>
                    <span class="block sm:inline"> Este carnet ha expirado. Haga clic en "Renovar Carnet" para generar uno nuevo.</span>
                </div>

                <!-- Contenido del Carnet -->
                <div id="carnet-contenido" class="mt-4 sm:mt-6 flex justify-center overflow-x-auto">
                    <div class="border-2 border-slate-700 rounded-lg p-2 bg-gradient-to-br from-slate-50 to-white shadow-xl" style="width: 8.5cm; height: 5.4cm; display: flex; flex-direction: column; min-width: 280px;">
                        <!-- Header del Carnet -->
                        <div class="header text-center border-b-2 border-slate-700 pb-1 mb-1" style="flex-shrink: 0;">
                            <h2 class="text-sm font-bold text-slate-800">BIBLIOTECA ESCOLAR</h2>
                            <p class="text-xs text-slate-600">I.E. Sagrado Corazón de María</p>
                        </div>

                        <!-- Datos del Usuario -->
                        <div class="datos mb-1" style="flex-shrink: 0;">
                            <div>
                                <p class="text-center text-xs font-bold text-slate-800 mb-0.5" id="carnet-nombre"></p>
                            </div>
                            <div class="grid grid-cols-2 gap-x-2 gap-y-0 text-xs">
                                <div class="dato">
                                    <strong class="text-slate-700">Usuario:</strong>
                                    <span id="carnet-usuario" class="text-slate-600"></span>
                                </div>
                                <div class="dato">
                                    <strong class="text-slate-700">ID:</strong>
                                    <span id="carnet-id" class="text-slate-600"></span>
                                </div>
                                <div class="dato col-span-2">
                                    <strong class="text-slate-700">Email:</strong>
                                    <span id="carnet-email" class="text-slate-600 text-xs"></span>
                                </div>
                                <div class="dato">
                                    <strong class="text-slate-700">Teléfono:</strong>
                                    <span id="carnet-telefono" class="text-slate-600"></span>
                                </div>
                                <div class="dato">
                                    <strong class="text-slate-700">Rol:</strong>
                                    <span id="carnet-rol" class="text-slate-600 font-semibold"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Código de Barras -->
                        <div class="codigo border-t-2 border-slate-300 pt-1" style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 0;">
                            <div class="flex justify-center" style="flex-shrink: 0;">
                                <svg id="codigo-barras"></svg>
                            </div>
                            <p class="vencimiento text-center text-xs text-slate-600 mt-0.5" style="flex-shrink: 0;">
                                <i class="fas fa-calendar-alt mr-1"></i>
                                Válido hasta: <strong id="carnet-vencimiento"></strong>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <button type="button" onclick="renovarCarnet()" 
                            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>Renovar Carnet
                    </button>
                    <button type="button" onclick="imprimirCarnet()" 
                            class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200 text-sm">
                        <i class="fas fa-print mr-2"></i>Imprimir
                    </button>
                    <button type="button" onclick="cerrarModalCarnet()" 
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition duration-200 text-sm">
                        <i class="fas fa-times mr-2"></i>Cerrar
                    </button>
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
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/usuarios.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/carnet.js"></script>
</body>
</html>
