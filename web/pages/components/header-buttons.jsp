<%-- header-buttons.jsp - Botones de Carnet, Perfil y Cerrar Sesión --%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="flex items-center space-x-2 sm:space-x-3">
    <div class="text-right hidden md:block">
        <p class="text-white font-semibold text-sm"><c:out value="${usuario.nombreCompleto}" /></p>
        <p class="text-slate-300 text-xs">
            <i class="fas fa-user-shield"></i> <c:out value="${usuario.nombreRol}" />
        </p>
    </div>
    
    <!-- Botón Carnet -->
    <button onclick="abrirModalCarnetPerfil()" class="bg-white text-slate-700 px-2 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-100 transition duration-200 shadow-sm flex items-center">
        <i class="fas fa-id-card sm:mr-2"></i>
        <span class="hidden sm:inline">Carnet</span>
    </button>
    
    <a href="${pageContext.request.contextPath}/logout" class="bg-white text-slate-700 px-2 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-100 transition duration-200 shadow-sm flex items-center">
        <i class="fas fa-sign-out-alt sm:mr-2"></i>
        <span class="hidden sm:inline">Cerrar Sesión</span>
    </a>
</div>

<script>
    // Almacenar datos del usuario globalmente para que el componente los use cuando cargue
    window.DATOS_USUARIO_SISTEMA = {
        id: ${usuario.id},
        nombre: '<c:out value="${usuario.nombreCompleto}" />',
        usuario: '<c:out value="${usuario.usuario}" />',
        email: '<c:out value="${usuario.email}" />',
        telefono: '<c:out value="${usuario.telefono != null ? usuario.telefono : ''}" />',
        direccion: '<c:out value="${usuario.direccion != null ? usuario.direccion : ''}" />',
        rol: '<c:out value="${usuario.nombreRol}" />'
    };
</script>
