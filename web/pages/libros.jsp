<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="model.Usuario" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
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
    <title>Gestión de Libros - Sistema de Biblioteca</title>
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
                    <i class="fas fa-book mr-1"></i>Libros
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
                <a href="libros.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-slate-700 text-slate-700">
                    <i class="fas fa-book mr-2"></i>Libros
                </a>
                <a href="prestamos.jsp" class="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 border-transparent text-gray-600 hover:text-slate-700 hover:border-slate-300">
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
                <a href="libros.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-slate-700 bg-slate-50 text-slate-700">
                    <i class="fas fa-book mr-2"></i>Libros
                </a>
                <a href="prestamos.jsp" class="block px-4 py-3 font-medium text-sm border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-slate-300">
                    <i class="fas fa-exchange-alt mr-2"></i>Préstamos
                </a>
            </nav>
        </div>
    </div>

    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-3 sm:p-6 border-b border-gray-200">
                <div class="mb-4">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                        <i class="fas fa-book text-slate-600 mr-2"></i>
                        Gestión de Libros
                    </h2>
                    <p class="text-gray-600 text-xs sm:text-sm mt-1">Administra el catálogo de libros</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div class="relative flex-1 max-w-full sm:max-w-md">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="buscar-libro" placeholder="Buscar por título, autor, ISBN..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200 text-sm" autocomplete="off">
                    </div>
                    <button onclick="abrirModalCrear()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm whitespace-nowrap text-sm">
                        <i class="fas fa-plus mr-2"></i>Nuevo Libro
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Autor</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">ISBN</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-libros" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="5" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                                <p class="text-sm">Cargando libros...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="paginacion" class="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="text-xs sm:text-sm text-gray-700">
                    Mostrando <span id="info-registros"></span>
                </div>
                <div id="botones-paginacion" class="flex flex-wrap justify-center gap-1 sm:gap-2"></div>
            </div>
        </div>
    </div>

    <div id="modalLibro" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-4 sm:top-10 mx-auto p-3 sm:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-4">
            <div class="mt-2 sm:mt-3">
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 id="modal-titulo" class="text-lg sm:text-2xl font-bold text-gray-900">
                        <i class="fas fa-book text-slate-600 mr-2"></i>Nuevo Libro
                    </h3>
                    <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-xl sm:text-2xl"></i>
                    </button>
                </div>

                <form id="formLibro" class="mt-3 sm:mt-4">
                    <input type="hidden" id="libro-id" name="id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div class="col-span-1 md:col-span-2">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Título <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="libro-nombre" name="nombre" required
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Autor <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="libro-autor" name="autor" required
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                ISBN <span class="text-red-500">*</span>
                            </label>
                            <div class="flex gap-2">
                                <input type="text" id="libro-isbn" name="isbn" required maxlength="13"
                                    class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                                <button type="button" onclick="generarISBN()" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs sm:text-sm">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Editorial
                            </label>
                            <input type="text" id="libro-editorial" name="editorial"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Año de Publicación <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="libro-anio" name="anioPublicacion" required min="1800" max="2100"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Género
                            </label>
                            <input type="text" id="libro-genero" name="genero"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Ubicación
                            </label>
                            <input type="text" id="libro-ubicacion" name="ubicacion"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1" id="campo-stock">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Stock Inicial <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="libro-stock" name="stock" required min="0"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>

                        <div class="col-span-1 md:col-span-2">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Descripción
                            </label>
                            <textarea id="libro-descripcion" name="descripcion" rows="3"
                                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
                        </div>
                        
                        <div class="col-span-1 md:col-span-2">
                            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Portada del Libro
                            </label>
                            <div class="flex flex-col items-center">
                                <div class="relative border-2 border-gray-300 rounded-lg overflow-hidden" style="width: 141px; height: 225px;">
                                    <img id="portada-preview" src="../assets/images/portadas/portada.jpg" alt="Vista previa" class="w-full h-full object-cover">
                                    <button type="button" id="btn-eliminar-portada" onclick="eliminarPortada()" class="hidden absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 hover:bg-red-700 transition">
                                        <i class="fas fa-trash text-sm"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Relación 564x900px</p>
                                
                                <input type="file" id="portada-file" name="portada" accept="image/*" class="hidden">
                                <input type="hidden" id="libro-urlPortada" name="urlPortada">
                                
                                <button type="button" onclick="document.getElementById('portada-file').click()" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
                                    <i class="fas fa-upload mr-2"></i>Seleccionar Portada
                                </button>
                                <p class="text-xs text-gray-500 mt-2 text-center">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Formatos: JPG, PNG (máx. 10MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                        <button type="button" onclick="cerrarModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200 font-medium text-sm">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-200 font-medium text-sm">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="modalStock" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-20 mx-auto p-3 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div class="mt-2 sm:mt-3">
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900">
                        <i class="fas fa-boxes text-slate-600 mr-2"></i>Actualizar Stock
                    </h3>
                    <button onclick="cerrarModalStock()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form id="formStock" class="mt-4">
                    <input type="hidden" id="stock-libro-id">
                    <input type="hidden" id="stock-actual">
                    <input type="hidden" id="stock-disponible-actual">
                    
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-2">Libro: <strong id="stock-libro-nombre"></strong></p>
                        <div class="bg-slate-50 p-3 rounded-md">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-600">Stock Total:</span>
                                    <strong class="text-slate-700 ml-2" id="stock-total-actual">0</strong>
                                </div>
                                <div>
                                    <span class="text-gray-600">Stock Disponible:</span>
                                    <strong class="text-slate-700 ml-2" id="stock-disponible-mostrar">0</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Ajustar Stock
                            <span class="text-xs text-gray-500 font-normal ml-1">(Ingresa cantidad positiva para agregar, negativa para quitar)</span>
                        </label>
                        <input type="number" id="stock-ajuste" placeholder="Ej: 10 o -5" required
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500">
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-info-circle mr-1"></i>
                            Esto afectará tanto el stock total como el disponible
                        </p>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button type="button" onclick="cerrarModalStock()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 text-sm">
                            <i class="fas fa-save mr-2"></i>Actualizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="modalISBN" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-20 mx-auto p-3 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div class="mt-2 sm:mt-3">
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900">
                        <i class="fas fa-barcode text-slate-600 mr-2"></i>Código de Barras ISBN
                    </h3>
                    <button onclick="cerrarModalISBN()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-600 mb-3">ISBN: <strong id="isbn-codigo"></strong></p>
                    <div class="bg-white p-4 inline-block border rounded">
                        <svg id="codigo-barras-isbn"></svg>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <button onclick="descargarCodigoBarras()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <i class="fas fa-download mr-2"></i>Descargar JPG
                    </button>
                    <button onclick="cerrarModalISBN()" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="modalDetalleLibro" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-0">
        <div class="relative top-4 sm:top-10 mx-auto p-3 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-4">
            <div class="mt-2 sm:mt-3">
                <div class="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-200">
                    <h3 class="text-lg sm:text-2xl font-bold text-gray-900">
                        <i class="fas fa-info-circle text-slate-600 mr-2"></i>Detalles del Libro
                    </h3>
                    <button onclick="cerrarModalDetalle()" class="text-gray-400 hover:text-gray-600 transition duration-150">
                        <i class="fas fa-times text-xl sm:text-2xl"></i>
                    </button>
                </div>

                <div class="mt-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Portada -->
                        <div class="col-span-1">
                            <div class="border-2 border-gray-200 rounded-lg overflow-hidden" style="width: 100%; max-width: 282px; margin: 0 auto;">
                                <img id="detalle-portada" src="../assets/images/portadas/portada.jpg" alt="Portada" class="w-full h-auto" style="aspect-ratio: 564/900; object-fit: cover;">
                            </div>
                        </div>

                        <!-- Información del libro -->
                        <div class="col-span-1 md:col-span-2">
                            <h4 id="detalle-nombre" class="text-xl font-bold text-gray-900 mb-3"></h4>
                            
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p class="text-gray-500 font-medium">Autor</p>
                                    <p id="detalle-autor" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">ISBN</p>
                                    <p id="detalle-isbn" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Editorial</p>
                                    <p id="detalle-editorial" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Año</p>
                                    <p id="detalle-anio" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Género</p>
                                    <p id="detalle-genero" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Ubicación</p>
                                    <p id="detalle-ubicacion" class="text-gray-900"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Stock Total</p>
                                    <p id="detalle-stock" class="text-gray-900 font-semibold"></p>
                                </div>
                                <div>
                                    <p class="text-gray-500 font-medium">Stock Disponible</p>
                                    <p id="detalle-stock-disponible" class="text-gray-900 font-semibold"></p>
                                </div>
                            </div>

                            <div class="mt-3">
                                <p class="text-gray-500 font-medium mb-1">Descripción</p>
                                <p id="detalle-descripcion" class="text-gray-700 text-sm"></p>
                            </div>
                        </div>
                    </div>

                    <!-- Préstamos Pendientes -->
                    <div class="mt-6 border-t pt-4">
                        <h5 class="text-lg font-semibold text-gray-900 mb-3">
                            <i class="fas fa-clock text-orange-500 mr-2"></i>Préstamos Pendientes
                        </h5>
                        <div id="tabla-prestamos-pendientes" class="overflow-x-auto">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button onclick="cerrarModalDetalle()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200 font-medium text-sm">
                        <i class="fas fa-times mr-2"></i>Cerrar
                    </button>
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
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/libros.js"></script>
</body>
</html>
