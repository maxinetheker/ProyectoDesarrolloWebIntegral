// perfil-carnet.js - Componente reutilizable de Carnet y Perfil de Usuario

// Función para crear e inyectar el modal en el DOM
function inicializarModalPerfilCarnet() {
    // Verificar si ya existe el modal
    if (document.getElementById('modal-carnet-perfil')) {
        return;
    }
    
    // Crear el modal HTML
    const modalHTML = `
    <div id="modal-carnet-perfil" class="hidden fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto z-50">
        <div class="min-h-screen px-2 py-4 sm:p-6">
            <div class="bg-white rounded-lg shadow-2xl max-w-2xl mx-auto">
                <!-- Header del Modal -->
                <div class="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 sm:p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl sm:text-2xl font-bold">
                            <i class="fas fa-id-card mr-2"></i>Mi Carnet Digital
                        </h3>
                        <button onclick="cerrarModalCarnetPerfil()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="p-4 sm:p-6">
                    <!-- Carnet Digital -->
                    <div id="carnet-digital" class="mb-6">
                        <div class="flex justify-center">
                            <div class="border-2 border-slate-700 rounded-lg p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-gray-50 shadow-xl" style="width: 100%; max-width: 350px;">
                                <!-- Header del Carnet -->
                                <div class="text-center border-b-2 border-slate-700 pb-2 mb-3">
                                    <h4 class="text-lg sm:text-xl font-bold text-slate-900">Carnet de Biblioteca</h4>
                                    <p class="text-xs sm:text-sm text-slate-700">I.E. Sagrado Corazón de María</p>
                                </div>
                                
                                <!-- Datos del Usuario -->
                                <div class="space-y-2 mb-3">
                                    <div class="flex items-start">
                                        <span class="text-xs sm:text-sm font-semibold text-slate-900 w-24 flex-shrink-0">Nombre:</span>
                                        <span id="carnet-nombre" class="text-xs sm:text-sm text-gray-700 flex-1"></span>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-xs sm:text-sm font-semibold text-slate-900 w-24 flex-shrink-0">Usuario:</span>
                                        <span id="carnet-usuario" class="text-xs sm:text-sm text-gray-700 flex-1"></span>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-xs sm:text-sm font-semibold text-slate-900 w-24 flex-shrink-0">Email:</span>
                                        <span id="carnet-email" class="text-xs sm:text-sm text-gray-700 flex-1 break-all"></span>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-xs sm:text-sm font-semibold text-slate-900 w-24 flex-shrink-0">Rol:</span>
                                        <span id="carnet-rol" class="text-xs sm:text-sm text-gray-700 flex-1"></span>
                                    </div>
                                </div>
                                
                                <!-- Código de Barras -->
                                <div class="border-t-2 border-slate-300 pt-2">
                                    <div class="w-full overflow-hidden">
                                        <svg id="codigo-barras-perfil" class="mx-auto" style="max-width: 100%;"></svg>
                                    </div>
                                    <p id="codigo-texto-perfil" class="text-center text-xs font-mono text-gray-600 mt-1"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información de Perfil -->
                    <div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 sm:p-6 border border-slate-200">
                        <h4 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <i class="fas fa-user-circle mr-2"></i>
                            Información de Perfil
                        </h4>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-user mr-1"></i>Nombre Completo
                                </label>
                                <p id="perfil-nombre" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200"></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-at mr-1"></i>Usuario
                                </label>
                                <p id="perfil-usuario" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200"></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-envelope mr-1"></i>Email
                                </label>
                                <p id="perfil-email" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200 break-all"></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-phone mr-1"></i>Teléfono
                                </label>
                                <p id="perfil-telefono" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200"></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-user-shield mr-1"></i>Rol
                                </label>
                                <p id="perfil-rol" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200"></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-slate-900 mb-1">
                                    <i class="fas fa-map-marker-alt mr-1"></i>Dirección
                                </label>
                                <p id="perfil-direccion" class="text-sm text-gray-700 bg-white p-2 rounded border border-slate-200"></p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones de Acción -->
                    <div class="mt-6 flex justify-end">
                        <button onclick="cerrarModalCarnetPerfil()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium transition duration-200 flex items-center justify-center">
                            <i class="fas fa-times mr-2"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    // Insertar el modal al final del body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Variable global para almacenar datos del usuario
let datosUsuarioActual = null;

// Función para configurar los datos del usuario
function configurarDatosUsuario(usuario) {
    datosUsuarioActual = usuario;
}

// Inicializar datos del usuario automáticamente si están en window.DATOS_USUARIO_SISTEMA
document.addEventListener('DOMContentLoaded', function() {
    inicializarModalPerfilCarnet();
    
    // Cargar datos del usuario si están disponibles
    if (window.DATOS_USUARIO_SISTEMA && !datosUsuarioActual) {
        configurarDatosUsuario(window.DATOS_USUARIO_SISTEMA);
    }
});

// Función para abrir modal de carnet y perfil
function abrirModalCarnetPerfil() {
    // Asegurar que el modal existe
    inicializarModalPerfilCarnet();
    
    if (!datosUsuarioActual) {
        console.error('No hay datos de usuario configurados');
        return;
    }
    
    // Llenar los datos en el modal
    document.getElementById('carnet-nombre').textContent = datosUsuarioActual.nombre;
    document.getElementById('carnet-usuario').textContent = datosUsuarioActual.usuario;
    document.getElementById('carnet-email').textContent = datosUsuarioActual.email;
    document.getElementById('carnet-rol').textContent = datosUsuarioActual.rol;
    
    document.getElementById('perfil-nombre').textContent = datosUsuarioActual.nombre;
    document.getElementById('perfil-usuario').textContent = datosUsuarioActual.usuario;
    document.getElementById('perfil-email').textContent = datosUsuarioActual.email;
    document.getElementById('perfil-telefono').textContent = datosUsuarioActual.telefono || 'No registrado';
    document.getElementById('perfil-rol').textContent = datosUsuarioActual.rol;
    document.getElementById('perfil-direccion').textContent = datosUsuarioActual.direccion || 'No registrada';
    
    // Mostrar el modal
    document.getElementById('modal-carnet-perfil').classList.remove('hidden');
    
    // Generar código de barras
    generarCodigoBarrasPerfil();
}

// Función para cerrar modal
function cerrarModalCarnetPerfil() {
    document.getElementById('modal-carnet-perfil').classList.add('hidden');
}

// Función para abrir solo perfil (alias)
function abrirModalPerfil() {
    abrirModalCarnetPerfil();
}

// Generar código de barras
function generarCodigoBarrasPerfil() {
    if (!datosUsuarioActual) return;
    
    // Obtener el contextPath desde el window o construirlo desde window.location
    const contextPath = window.CONTEXT_PATH || window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1)) || '';
    
    fetch(contextPath + '/carnet?accion=obtener&usuarioId=' + datosUsuarioActual.id)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.tiene && data.codigo) {
                // Usar JsBarcode para generar el código de barras
                JsBarcode("#codigo-barras-perfil", data.codigo, {
                    format: "CODE128",
                    width: 1.5,
                    height: 50,
                    displayValue: false,
                    margin: 2
                });
                document.getElementById('codigo-texto-perfil').textContent = data.codigo;
            } else {
                // Si no tiene código de barras, mostrar mensaje
                const svgElement = document.getElementById('codigo-barras-perfil');
                if (svgElement) {
                    svgElement.innerHTML = '<text x="50%" y="50%" text-anchor="middle" font-size="12" fill="#666">Sin código de barras</text>';
                }
                const textoElement = document.getElementById('codigo-texto-perfil');
                if (textoElement) {
                    textoElement.textContent = 'No disponible';
                }
            }
        })
        .catch(error => {
            console.error('Error al generar código:', error);
            const svgElement = document.getElementById('codigo-barras-perfil');
            if (svgElement) {
                svgElement.innerHTML = '<text x="50%" y="50%" text-anchor="middle" font-size="12" fill="#f00">Error al cargar</text>';
            }
        });
}

