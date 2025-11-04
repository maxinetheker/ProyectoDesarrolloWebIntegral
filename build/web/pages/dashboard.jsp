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
    
    // Poner el usuario en el contexto para JSTL
    pageContext.setAttribute("usuario", usuario);
    pageContext.setAttribute("esAdmin", esAdmin);
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="${pageContext.request.contextPath}/assets/css/font-awesome.all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar Principal -->
    <nav class="bg-slate-800 shadow-md border-b border-slate-700">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <div class=""><img src="../assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-14 w-14 "></div>
                    
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
                   class="px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
                <c:if test="${esAdmin}">
                    <a href="usuarios.jsp"
                       class="px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
                        <i class="fas fa-users mr-2"></i>Usuarios
                    </a>
                </c:if>
            </nav>
        </div>
    </div>
    
    <!-- Container Principal -->
    <div class="container mx-auto px-4 py-8">
        <!-- Mensaje de Bienvenida -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">
                <i class="fas fa-hand-sparkles text-slate-600 mr-2"></i>
                ¡Bienvenido, <c:out value="${usuario.nombre}" />!
            </h2>
            <p class="text-gray-600">
                <jsp:useBean id="now" class="java.util.Date"/>
                <fmt:formatDate value="${now}" pattern="dd/MM/yyyy HH:mm" />
            </p>
        </div>
        
    </div>
</body>
</html>
