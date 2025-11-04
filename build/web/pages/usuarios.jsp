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
    
    // Solo administradores pueden acceder a esta página
    if (!esAdmin) {
        response.sendRedirect("dashboard.jsp?error=noauth");
        return;
    }
    
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
    pageContext.setAttribute("paginaActual", "usuarios");
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="${pageContext.request.contextPath}/assets/css/font-awesome.all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar Principal -->
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <div class=""><img src="../assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-14 w-14"></div>
                    
                    <div>
                        <h1 class="text-white text-2xl font-bold">Sistema de Biblioteca</h1>
                        <p class="text-slate-300 text-sm">Gestión Integral</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <p class="text-white font-semibold"><c:out value="${usuario.nombreCompleto}" /></p>
                        <p class="text-slate-300 text-sm">
                            <i class="fas fa-user-shield"></i> <c:out value="${usuario.nombreRol}" />
                        </p>
                    </div>
                    <a href="${pageContext.request.contextPath}/logout" class="bg-white text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition duration-200 shadow-sm">
                        <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Subheader con Pestañas -->
    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-4">
            <nav class="flex space-x-1" role="navigation">
                <a href="dashboard.jsp" 
                   class="px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <a href="usuarios.jsp" 
                   class="px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-users mr-2"></i>Usuarios
                </a>
            </nav>
        </div>
    </div>

    <!-- Container Principal -->
    <div class="container mx-auto px-4 py-8">
        <!-- Sección Gestión de Usuarios -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Encabezado -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-users-cog text-slate-600 mr-2"></i>
                            Gestión de Usuarios
                        </h2>
                        <p class="text-gray-600 text-sm mt-1">Administra los usuarios del sistema</p>
                    </div>
                    <button onclick="abrirModalCrear()" 
                            class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm">
                        <i class="fas fa-plus mr-2"></i>Nuevo Usuario
                    </button>
                </div>
            </div>

            <!-- Tabla de Usuarios -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-usuarios" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Cargando usuarios...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div id="paginacion" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Mostrando <span id="info-registros"></span>
                </div>
                <div id="botones-paginacion" class="flex space-x-2">
                    <!-- Los botones se generarán dinámicamente -->
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Crear/Editar Usuario -->
    <div id="modalUsuario" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <!-- Encabezado Modal -->
                <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 id="modal-titulo" class="text-2xl font-bold text-gray-900">
                        <i class="fas fa-user-plus text-slate-600 mr-2"></i>
                        Nuevo Usuario
                    </h3>
                    <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <!-- Formulario -->
                <form id="formUsuario" class="mt-4">
                    <input type="hidden" id="usuario-id" name="id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Usuario -->
                        <div class="col-span-1">
                            <label for="usuario-usuario" class="block text-sm font-medium text-gray-700 mb-1">
                                Usuario <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-usuario" name="usuario" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Rol -->
                        <div class="col-span-1">
                            <label for="usuario-rol" class="block text-sm font-medium text-gray-700 mb-1">
                                Rol <span class="text-red-500">*</span>
                            </label>
                            <select id="usuario-rol" name="idRol" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                                <option value="">Seleccione un rol</option>
                            </select>
                        </div>

                        <!-- Nombre -->
                        <div class="col-span-1">
                            <label for="usuario-nombre" class="block text-sm font-medium text-gray-700 mb-1">
                                Nombre <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-nombre" name="nombre" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Apellido -->
                        <div class="col-span-1">
                            <label for="usuario-apellido" class="block text-sm font-medium text-gray-700 mb-1">
                                Apellido <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="usuario-apellido" name="apellido" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Email -->
                        <div class="col-span-1">
                            <label for="usuario-email" class="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input type="email" id="usuario-email" name="email"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Teléfono -->
                        <div class="col-span-1">
                            <label for="usuario-telefono" class="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input type="tel" id="usuario-telefono" name="telefono"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Contraseña -->
                        <div id="campo-contrasena" class="col-span-1">
                            <label for="usuario-contrasena" class="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña <span id="required-contrasena" class="text-red-500">*</span>
                                <span id="texto-opcional" class="hidden text-xs text-gray-500">(opcional - dejar vacío si no desea cambiarla)</span>
                            </label>
                            <input type="password" id="usuario-contrasena" name="contrasena" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                        </div>

                        <!-- Dirección -->
                        <div class="col-span-2">
                            <label for="usuario-direccion" class="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <textarea id="usuario-direccion" name="direccion" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"></textarea>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <button type="button" onclick="cerrarModal()" 
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200 font-medium">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" id="btn-guardar"
                                class="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-200 font-medium">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Carnet de Biblioteca -->
    <div id="modal-carnet" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <!-- Encabezado Modal -->
                <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 class="text-2xl font-bold text-gray-900">
                        <i class="fas fa-id-card text-slate-600 mr-2"></i>
                        Carnet de Biblioteca
                    </h3>
                    <button onclick="cerrarModalCarnet()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <!-- Alerta si está vencido -->
                <div id="alerta-vencido" class="hidden mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong class="font-bold">¡Carnet vencido!</strong>
                    <span class="block sm:inline"> Este carnet ha expirado. Haga clic en "Renovar Carnet" para generar uno nuevo.</span>
                </div>

                <!-- Contenido del Carnet -->
                <div id="carnet-contenido" class="mt-6 flex justify-center">
                    <div class="border-2 border-slate-700 rounded-lg p-2 bg-gradient-to-br from-slate-50 to-white shadow-xl" style="width: 8.5cm; height: 5.4cm; display: flex; flex-direction: column;">
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
                <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button type="button" onclick="renovarCarnet()" 
                            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition duration-200">
                        <i class="fas fa-sync-alt mr-2"></i>Renovar Carnet
                    </button>
                    <button type="button" onclick="imprimirCarnet()" 
                            class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200">
                        <i class="fas fa-print mr-2"></i>Imprimir
                    </button>
                    <button type="button" onclick="cerrarModalCarnet()" 
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition duration-200">
                        <i class="fas fa-times mr-2"></i>Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configurar contexto de la aplicación
        window.CONTEXT_PATH = '${pageContext.request.contextPath}';
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/usuarios.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/carnet.js"></script>
</body>
</html>
