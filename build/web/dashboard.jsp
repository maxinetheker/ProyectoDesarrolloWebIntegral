<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="dto.UsuarioDTO" %>
<%
    // Verificar si hay sesión activa
    UsuarioDTO usuario = (UsuarioDTO) session.getAttribute("usuario");
    if (usuario == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String nombreCompleto = usuario.getNombreCompleto();
    String rol = usuario.getNombreRol();
    boolean esAdmin = "Administrador".equals(rol);
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-book-reader text-3xl text-white"></i>
                    <div>
                        <h1 class="text-white text-2xl font-bold">Sistema de Biblioteca</h1>
                        <p class="text-slate-300 text-sm">Gestión Integral</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <p class="text-white font-semibold"><%= nombreCompleto %></p>
                        <p class="text-slate-300 text-sm">
                            <i class="fas fa-user-shield"></i> <%= rol %>
                        </p>
                    </div>
                    <a href="logout" class="bg-white text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition duration-200 shadow-sm">
                        <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                    </a>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Container Principal -->
    <div class="container mx-auto px-4 py-8">
        <!-- Mensaje de Bienvenida -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">
                <i class="fas fa-hand-sparkles text-slate-600 mr-2"></i>
                ¡Bienvenido, <%= usuario.getNombre() %>!
            </h2>
            <p class="text-gray-600">Fecha: <%= new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()) %></p>
        </div>
        
        <!-- Cards de Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Card 1 -->
            <div class="bg-white border-l-4 border-slate-600 rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm mb-2 font-medium">Total Libros</p>
                        <p class="text-4xl font-bold text-slate-700">1,245</p>
                    </div>
                    <div class="bg-slate-100 p-3 rounded-lg">
                        <i class="fas fa-book text-2xl text-slate-600"></i>
                    </div>
                </div>
                <p class="text-gray-500 text-sm mt-4">
                    <i class="fas fa-arrow-up mr-1 text-green-600"></i>12% vs mes anterior
                </p>
            </div>
            
            <!-- Card 2 -->
            <div class="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm mb-2 font-medium">Préstamos Activos</p>
                        <p class="text-4xl font-bold text-blue-700">342</p>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-lg">
                        <i class="fas fa-exchange-alt text-2xl text-blue-600"></i>
                    </div>
                </div>
                <p class="text-gray-500 text-sm mt-4">
                    <i class="fas fa-check mr-1 text-green-600"></i>En tiempo
                </p>
            </div>
            
            <!-- Card 3 -->
            <div class="bg-white border-l-4 border-indigo-600 rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm mb-2 font-medium">Usuarios</p>
                        <p class="text-4xl font-bold text-indigo-700">856</p>
                    </div>
                    <div class="bg-indigo-100 p-3 rounded-lg">
                        <i class="fas fa-users text-2xl text-indigo-600"></i>
                    </div>
                </div>
                <p class="text-gray-500 text-sm mt-4">
                    <i class="fas fa-user-check mr-1 text-green-600"></i>738 activos
                </p>
            </div>
            
            <!-- Card 4 -->
            <div class="bg-white border-l-4 border-amber-600 rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm mb-2 font-medium">Vencidos</p>
                        <p class="text-4xl font-bold text-amber-700">23</p>
                    </div>
                    <div class="bg-amber-100 p-3 rounded-lg">
                        <i class="fas fa-exclamation-triangle text-2xl text-amber-600"></i>
                    </div>
                </div>
                <p class="text-gray-500 text-sm mt-4">
                    <i class="fas fa-clock mr-1 text-amber-600"></i>Requiere atención
                </p>
            </div>
        </div>
        
        <!-- Menú de Opciones -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Gestión de Libros -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-slate-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-200 transition duration-200">
                        <i class="fas fa-books text-2xl text-slate-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Gestión de Libros</h3>
                </div>
                <p class="text-gray-600">Agregar, editar y consultar libros del catálogo</p>
            </a>
            
            <!-- Préstamos -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition duration-200">
                        <i class="fas fa-handshake text-2xl text-blue-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Préstamos</h3>
                </div>
                <p class="text-gray-600">Registrar y gestionar préstamos de libros</p>
            </a>
            
            <!-- Devoluciones -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition duration-200">
                        <i class="fas fa-undo text-2xl text-indigo-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Devoluciones</h3>
                </div>
                <p class="text-gray-600">Procesar devoluciones de libros prestados</p>
            </a>
            
            <% if (esAdmin) { %>
            <!-- Gestión de Usuarios (Solo Admin) -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-slate-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-200 transition duration-200">
                        <i class="fas fa-users-cog text-2xl text-slate-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Usuarios</h3>
                </div>
                <p class="text-gray-600">Administrar usuarios del sistema</p>
            </a>
            
            <!-- Reportes (Solo Admin) -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition duration-200">
                        <i class="fas fa-chart-bar text-2xl text-blue-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Reportes</h3>
                </div>
                <p class="text-gray-600">Ver estadísticas y generar reportes</p>
            </a>
            <% } %>
            
            <!-- Chatbot -->
            <a href="#" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition duration-200 group">
                <div class="flex items-center mb-4">
                    <div class="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition duration-200">
                        <i class="fas fa-robot text-2xl text-indigo-700"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 ml-4">Asistente Virtual</h3>
                </div>
                <p class="text-gray-600">Consulta nuestro chatbot para ayuda</p>
            </a>
        </div>
    </div>
    
    <!-- Footer -->
    <footer class="bg-slate-800 text-white mt-12 py-6 border-t border-slate-700">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 Sistema de Biblioteca. Todos los derechos reservados.</p>
            <p class="text-slate-400 text-sm mt-2">
                <i class="fas fa-code mr-1"></i>
                Desarrollado con Jakarta EE y Tailwind CSS
            </p>
        </div>
    </footer>
</body>
</html>
