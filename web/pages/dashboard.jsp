<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="model.Usuario" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    // Verificar si hay sesión activa
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    if (usuario == null) {
        // No hay sesión, redirigir al login con mensaje
        response.sendRedirect("login.jsp?sessionExpired=true");
        return;
    }
    
    String nombreCompleto = usuario.getNombreCompleto();
    String rol = usuario.getNombreRol();
    boolean esAdmin = "Administrador".equals(rol);
    boolean esBibliotecario = "Bibliotecario".equals(rol);
    boolean puedeGestionar = esAdmin || esBibliotecario;
    
    // Poner el usuario en el contexto para JSTL
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
    <title>Dashboard - Sistema de Biblioteca</title>
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
                    <i class="fas fa-home mr-1"></i>Dashboard
                </span>
                <div class="w-10"></div>
            </div>
            
            <!-- Desktop menu -->
            <nav class="hidden sm:flex space-x-1" role="navigation">
                <a href="dashboard.jsp" 
                   class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
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
                <a href="catalogo.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-th mr-2"></i>Catálogo
                </a>
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
                   class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 bg-slate-50 text-slate-700">
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
                <a href="catalogo.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-th mr-2"></i>Catálogo
                </a>
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
        <!-- Mensaje de Bienvenida -->
        <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-8 border border-gray-200">
            <h2 class="text-xl sm:text-3xl font-bold text-gray-800 mb-2">
                <i class="fas fa-hand-sparkles text-slate-600 mr-2"></i>
                ¡Bienvenido, <c:out value="${usuario.nombre}" />!
            </h2>
            <p class="text-sm sm:text-base text-gray-600">
                <jsp:useBean id="now" class="java.util.Date"/>
                <fmt:formatDate value="${now}" pattern="dd/MM/yyyy HH:mm" />
            </p>
        </div>
        
    </div>
    
    <script>
        // Toggle mobile menu
        const menuButton = document.getElementById('menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    </script>
</body>
</html>
