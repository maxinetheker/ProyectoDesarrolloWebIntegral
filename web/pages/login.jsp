<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    // Si ya hay una sesión activa, redirigir al dashboard
    if (session.getAttribute("usuario") != null) {
        response.sendRedirect("dashboard.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicio de Sesión - Sistema de Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="${pageContext.request.contextPath}/assets/css/font-awesome.all.min.css" rel="stylesheet">
</head>
<body class="bg-[rgba(255,255,255,0.7)] bg-blend-overlay bg-[url('../assets/images/fondo_login.jpg')] bg-cover bg-center min-h-screen flex items-center justify-center">
    <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto">
            <!-- Card de Login -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <!-- Header -->
                <div class="bg-slate-800 p-8 text-center">
                    <div class="inline-block p-4 bg-white rounded-lg mb-4 shadow-md">
                        <a href="${pageContext.request.contextPath}/index.html"><img src="../assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-14 w-14 "></a>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">Sistema de Biblioteca</h1>
                    <p class="text-slate-300">Gestión Integral de Préstamos</p>
                </div>
                
                <!-- Formulario -->
                <div class="p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
                    
                    <!-- Mensaje de error usando JSTL -->
                    <c:if test="${not empty error}">
                        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-circle mr-2"></i>
                                <p><c:out value="${error}" /></p>
                            </div>
                        </div>
                    </c:if>
                    
                    <!-- Mensaje de sesión expirada -->
                    <c:if test="${param.sessionExpired eq 'true'}">
                        <div class="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded" role="alert">
                            <div class="flex items-center">
                                <i class="fas fa-clock mr-2"></i>
                                <p>Su sesión ha expirado. Por favor, inicie sesión nuevamente.</p>
                            </div>
                        </div>
                    </c:if>
                    
                    <!-- Mensaje de éxito (por ejemplo, después de logout) -->
                    <c:if test="${not empty mensaje}">
                        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle mr-2"></i>
                                <p><c:out value="${mensaje}" /></p>
                            </div>
                        </div>
                    </c:if>
                    
                    <form action="${pageContext.request.contextPath}/login" method="POST" class="space-y-6">
                        <!-- Campo Usuario -->
                        <div>
                            <label for="usuario" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user mr-2 text-slate-600"></i>Usuario
                            </label>
                            <input 
                                type="text" 
                                id="usuario" 
                                name="usuario" 
                                required
                                value="${param.usuario}"
                                class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200"
                                placeholder="Ingrese su usuario"
                                autofocus
                            >
                        </div>
                        
                        <!-- Campo Contraseña -->
                        <div>
                            <label for="contrasena" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock mr-2 text-slate-600"></i>Contraseña
                            </label>
                            <input 
                                type="password" 
                                id="contrasena" 
                                name="contrasena" 
                                required
                                class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200"
                                placeholder="Ingrese su contraseña"
                            >
                        </div>
                        
                        <!-- Botón de Login -->
                        <button 
                            type="submit" 
                            class="w-full bg-slate-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-slate-800 transition duration-200 shadow-md"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                        </button>
                    </form>
                </div>
                
                <!-- Footer -->
         <!--       <div class="bg-gray-50 px-8 py-4 border-t border-gray-200">
                    <div class="text-center text-sm text-gray-600">
                        <p class="mb-2"><i class="fas fa-info-circle mr-1"></i> Usuarios de prueba:</p>
                        <div class="space-y-1">
                            <p><strong>Admin:</strong> admin / admin123</p>
                            <p><strong>Usuario:</strong> usuario / user123</p>
                        </div>
                    </div>
                </div>-->
            </div>
            
            <!-- Footer fuera de la card -->
            <div class="text-center mt-6 text-gray-600">
                <p class="text-sm">
                    <i class="fas fa-shield-alt mr-1"></i>
                 
                </p>
            </div>
        </div>
    </div>
</body>
</html>
