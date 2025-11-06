let paginaActualDevoluciones = 1;
let totalPaginasDevoluciones = 1;
let busquedaActualDevoluciones = '';
let filtroVencimientoActual = 'todos';

document.addEventListener('DOMContentLoaded', function() {
    const inputBuscar = document.getElementById('buscar-devoluciones');
    if (inputBuscar) {
        let tiempoEspera;
        inputBuscar.addEventListener('input', function() {
            clearTimeout(tiempoEspera);
            tiempoEspera = setTimeout(() => {
                busquedaActualDevoluciones = this.value.trim();
                paginaActualDevoluciones = 1;
                cargarDevolucionesPendientes();
            }, 500);
        });
    }
    
    const filtroVencimiento = document.getElementById('filtro-vencimiento');
    if (filtroVencimiento) {
        filtroVencimiento.addEventListener('change', function() {
            filtroVencimientoActual = this.value;
            paginaActualDevoluciones = 1;
            cargarDevolucionesPendientes();
        });
    }
});

function cargarDevolucionesPendientes() {
    const tbody = document.getElementById('tabla-devoluciones');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p class="text-sm">Cargando préstamos...</p>
            </td>
        </tr>
    `;
    
    let url = `${window.CONTEXT_PATH}/prestamos?accion=listarDevolucionesPendientes&pagina=${paginaActualDevoluciones}`;
    if (busquedaActualDevoluciones) {
        url += `&busqueda=${encodeURIComponent(busquedaActualDevoluciones)}`;
    }
    if (filtroVencimientoActual && filtroVencimientoActual !== 'todos') {
        url += `&filtroVencimiento=${encodeURIComponent(filtroVencimientoActual)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarDevoluciones(data.prestamos);
                totalPaginasDevoluciones = data.totalPaginas;
                actualizarPaginacionDevoluciones(data.totalRegistros, data.registroInicio, data.registroFin);
            } else {
                mostrarError(data.message || 'Error al cargar préstamos');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function renderizarDevoluciones(prestamos) {
    const tbody = document.getElementById('tabla-devoluciones');
    
    if (!prestamos || prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-check-circle text-3xl mb-2 text-green-500"></i>
                    <p>No hay devoluciones pendientes</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamos.map(prestamo => {
        const diasRestantes = diasHasta(prestamo.fechaDevolucionEsperada);
        const vencido = diasRestantes < 0;
        const proximoVencer = !vencido && diasRestantes <= 3;
        
        let estadoBadge = '';
        if (vencido) {
            estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                <i class="fas fa-exclamation-circle mr-1"></i>Vencido (${Math.abs(diasRestantes)} días)
            </span>`;
        } else if (proximoVencer) {
            estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                ${diasVencidos} día(s) vencido
            </span>`;
        } else {
            estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                <i class="fas fa-check mr-1"></i>${diasRestantes} días restantes
            </span>`;
        }
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-3 sm:px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${escapeHtml(prestamo.libroNombre)}</div>
                    <div class="text-xs text-gray-500">ISBN: ${escapeHtml(prestamo.libroIsbn)}</div>
                    <div class="mt-1 md:hidden">
                        <div class="text-xs text-gray-700">
                            <i class="fas fa-user mr-1"></i>${escapeHtml(prestamo.usuarioNombre)}
                        </div>
                        <div class="text-xs text-gray-500">DNI: ${escapeHtml(prestamo.usuarioDni)}</div>
                    </div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden md:table-cell">
                    <div class="text-sm text-gray-900">${escapeHtml(prestamo.usuarioNombre)}</div>
                    <div class="text-xs text-gray-500">DNI: ${escapeHtml(prestamo.usuarioDni)}</div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <div class="text-sm text-gray-700">${formatearFecha(prestamo.fechaPrestamo)}</div>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${formatearFecha(prestamo.fechaDevolucionEsperada)}</div>
                    <div class="mt-1">${estadoBadge}</div>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                        <button onclick="abrirModalDevolucion(${prestamo.id})" 
                            class="p-1.5 sm:p-2 text-white bg-slate-700 hover:bg-slate-800 rounded transition" title="Registrar Devolución">
                            <i class="fas fa-undo text-sm sm:text-base"></i>
                        </button>
                        <button onclick="abrirModalExtenderPlazo(${prestamo.id}, '${escapeHtml(prestamo.libroNombre)}', '${escapeHtml(prestamo.usuarioNombre)}', '${formatearFecha(prestamo.fechaDevolucionEsperada)}')" 
                            class="p-1.5 sm:p-2 text-white bg-slate-700 hover:bg-slate-800 rounded transition" title="Extender Plazo">
                            <i class="fas fa-calendar-plus text-sm sm:text-base"></i>
                        </button>
                        <button onclick="verDetallePrestamo(${prestamo.id})" 
                            class="p-1.5 sm:p-2 text-white bg-slate-700 hover:bg-slate-800 rounded transition" title="Ver Detalles">
                            <i class="fas fa-info-circle text-sm sm:text-base"></i>
                        </button>
                        <button onclick="eliminarPrestamo(${prestamo.id}, '${escapeHtml(prestamo.libroNombre)}')" 
                            class="p-1.5 sm:p-2 text-white bg-slate-700 hover:bg-slate-800 rounded transition" title="Eliminar Préstamo">
                            <i class="fas fa-trash text-sm sm:text-base"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarPaginacionDevoluciones(total, inicio, fin) {
    const infoRegistros = document.getElementById('info-registros-devoluciones');
    const botonesPaginacion = document.getElementById('botones-paginacion-devoluciones');
    
    if (total === 0) {
        infoRegistros.textContent = 'No hay registros';
        botonesPaginacion.innerHTML = '';
        return;
    }
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} registros`;
    
    let html = `
        <button onclick="cambiarPaginaDevoluciones(${paginaActualDevoluciones - 1})" 
            ${paginaActualDevoluciones === 1 ? 'disabled' : ''} 
            class="px-3 py-2 text-sm font-medium rounded-md ${paginaActualDevoluciones === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPaginasDevoluciones; i++) {
        html += `
            <button onclick="cambiarPaginaDevoluciones(${i})" 
                class="px-3 py-2 text-sm font-medium rounded-md ${i === paginaActualDevoluciones ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
                ${i}
            </button>
        `;
    }
    
    html += `
        <button onclick="cambiarPaginaDevoluciones(${paginaActualDevoluciones + 1})" 
            ${paginaActualDevoluciones === totalPaginasDevoluciones ? 'disabled' : ''} 
            class="px-3 py-2 text-sm font-medium rounded-md ${paginaActualDevoluciones === totalPaginasDevoluciones ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPaginaDevoluciones(pagina) {
    if (pagina < 1 || pagina > totalPaginasDevoluciones || pagina === paginaActualDevoluciones) return;
    paginaActualDevoluciones = pagina;
    cargarDevolucionesPendientes();
}

// Variables globales para el modal
let usuarioSeleccionado = null;
let libroSeleccionado = null;
let debounceUsuarioTimer = null;
let debounceLibroTimer = null;
let debounceCodigoTimer = null;

function abrirModalNuevoPrestamo() {
    usuarioSeleccionado = null;
    libroSeleccionado = null;
    
    Swal.fire({
        title: '<div class="text-base sm:text-lg">Nuevo Préstamo</div>',
        width: '95%',
        customClass: {
            container: 'swal-container-responsive',
            popup: 'swal-popup-responsive'
        },
        html: `
            <style>
                @media (min-width: 640px) {
                    .swal-popup-responsive {
                        max-width: 800px !important;
                    }
                }
                .swal-container-responsive .swal2-html-container {
                    max-height: 70vh;
                    overflow-y: auto;
                }
            </style>
            <div class="text-left space-y-4 sm:space-y-6">
                <!-- Sección Usuario -->
                <div class="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <h3 class="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700">1. Seleccionar Usuario</h3>
                    
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <button type="button" id="btn-metodo-usuario-buscar" class="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                            <i class="fas fa-search mr-1 sm:mr-2"></i><span class="hidden sm:inline">Buscar por </span>Nombre
                        </button>
                        <button type="button" id="btn-metodo-usuario-codigo" class="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400">
                            <i class="fas fa-barcode mr-1 sm:mr-2"></i><span class="hidden sm:inline">Código de </span>Barras
                        </button>
                    </div>
                    
                    <!-- Búsqueda por nombre -->
                    <div id="metodo-usuario-buscar" class="metodo-usuario">
                        <div class="relative">
                            <input type="text" id="input-buscar-usuario" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                   placeholder="Escribe nombre, apellido o usuario..." autocomplete="off">
                            <div id="sugerencias-usuario" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                    </div>
                    
                    <!-- Código de barras -->
                    <div id="metodo-usuario-codigo" class="metodo-usuario hidden">
                        <div class="relative">
                            <input type="text" id="input-codigo-usuario" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                   placeholder="Escanea el código de barras del usuario..." autocomplete="off">
                            <div id="sugerencias-codigo-usuario" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                    </div>
                    
                    <!-- Cuadro de confirmación de usuario (fuera de los divs que se ocultan) -->
                    <div id="usuario-seleccionado-info" class="mt-2 p-2 bg-green-50 border border-green-200 rounded hidden">
                        <div class="flex justify-between items-center">
                            <span class="text-xs sm:text-sm font-medium text-green-700"></span>
                            <button type="button" onclick="limpiarUsuarioSeleccionado()" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Alerta de carnet vencido (fuera de los divs que se ocultan) -->
                                        <div id="alerta-carnet-vencido" class="mt-2 p-2 bg-amber-50 border border-amber-400 text-amber-800 rounded text-xs hidden">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <strong>Carnet vencido.</strong> El usuario debe renovar su carnet antes de realizar un préstamo.
                    </div>
                </div>
                
                <!-- Sección Libro -->
                <div class="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <h3 class="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700">2. Seleccionar Libro</h3>
                    
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <button type="button" id="btn-metodo-libro-nombre" class="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700">
                            <i class="fas fa-book mr-1 sm:mr-2"></i><span class="hidden sm:inline">Buscar por </span>Nombre
                        </button>
                        <button type="button" id="btn-metodo-libro-isbn" class="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400">
                            <i class="fas fa-hashtag mr-1 sm:mr-2"></i><span class="hidden sm:inline">Buscar por </span>ISBN
                        </button>
                    </div>
                    
                    <!-- Búsqueda por nombre -->
                    <div id="metodo-libro-nombre" class="metodo-libro">
                        <div class="relative">
                            <input type="text" id="input-buscar-libro-nombre" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                   placeholder="Escribe el nombre del libro..." autocomplete="off">
                            <div id="sugerencias-libro-nombre" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                    </div>
                    
                    <!-- Búsqueda por ISBN -->
                    <div id="metodo-libro-isbn" class="metodo-libro hidden">
                        <div class="relative">
                            <input type="text" id="input-buscar-libro-isbn" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                   placeholder="Escribe o escanea el ISBN del libro..." autocomplete="off">
                            <div id="sugerencias-libro-isbn" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                    </div>
                    
                    <!-- Cuadro de confirmación de libro (fuera de los divs que se ocultan) -->
                    <div id="libro-seleccionado-info" class="mt-2 p-2 bg-green-50 border border-green-200 rounded hidden">
                        <div class="flex justify-between items-center">
                            <span class="text-xs sm:text-sm font-medium text-green-700"></span>
                            <button type="button" onclick="limpiarLibroSeleccionado()" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Detalles del préstamo -->
                <div class="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <h3 class="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700">3. Detalles del Préstamo</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs sm:text-sm font-medium mb-1">Días de préstamo</label>
                            <input type="number" id="input-dias-prestamo" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                   value="7" min="1" max="30">
                        </div>
                        <div>
                            <label class="block text-xs sm:text-sm font-medium mb-1">Observaciones (opcional)</label>
                            <textarea id="input-observaciones-entrega" class="w-full px-2 sm:px-3 py-2 text-sm border rounded" 
                                      rows="2" placeholder="Condición del libro, estado del carnet, etc."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: '<i class="fas fa-check mr-1"></i>Crear Préstamo',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        didOpen: () => {
            configurarEventosModalPrestamo();
        },
        preConfirm: () => {
            if (!usuarioSeleccionado) {
                Swal.showValidationMessage('Debe seleccionar un usuario');
                return false;
            }
            
            if (!libroSeleccionado) {
                Swal.showValidationMessage('Debe seleccionar un libro');
                return false;
            }
            
            const diasPrestamo = document.getElementById('input-dias-prestamo').value;
            const observaciones = document.getElementById('input-observaciones-entrega').value.trim();
            
            if (!diasPrestamo || diasPrestamo < 1) {
                Swal.showValidationMessage('Los días de préstamo deben ser al menos 1');
                return false;
            }
            
            return crearPrestamoValidado(usuarioSeleccionado.id, libroSeleccionado.id, diasPrestamo, observaciones);
        }
    });
}

function configurarEventosModalPrestamo() {
    // Botones de método de usuario
    document.getElementById('btn-metodo-usuario-buscar').addEventListener('click', function() {
        mostrarMetodoUsuario('buscar');
    });
    document.getElementById('btn-metodo-usuario-codigo').addEventListener('click', function() {
        mostrarMetodoUsuario('codigo');
    });
    
    // Botones de método de libro
    document.getElementById('btn-metodo-libro-nombre').addEventListener('click', function() {
        mostrarMetodoLibro('nombre');
    });
    document.getElementById('btn-metodo-libro-isbn').addEventListener('click', function() {
        mostrarMetodoLibro('isbn');
    });
    
    // Autocompletado de usuario
    document.getElementById('input-buscar-usuario').addEventListener('input', function() {
        clearTimeout(debounceUsuarioTimer);
        const busqueda = this.value.trim();
        
        if (busqueda.length < 2) {
            document.getElementById('sugerencias-usuario').classList.add('hidden');
            return;
        }
        
        debounceUsuarioTimer = setTimeout(() => {
            buscarUsuariosAutocompletado(busqueda);
        }, 300);
    });
    
    // Autocompletado por código de barras
    document.getElementById('input-codigo-usuario').addEventListener('input', function() {
        clearTimeout(debounceCodigoTimer);
        const codigo = this.value.trim();
        
        if (codigo.length < 3) {
            document.getElementById('sugerencias-codigo-usuario').classList.add('hidden');
            document.getElementById('alerta-carnet-vencido').classList.add('hidden');
            return;
        }
        
        debounceCodigoTimer = setTimeout(() => {
            buscarUsuariosPorCodigoBarras(codigo);
        }, 500);
    });
    
    // Autocompletado de libro por nombre
    document.getElementById('input-buscar-libro-nombre').addEventListener('input', function() {
        clearTimeout(debounceLibroTimer);
        const busqueda = this.value.trim();
        
        if (busqueda.length < 2) {
            document.getElementById('sugerencias-libro-nombre').classList.add('hidden');
            return;
        }
        
        debounceLibroTimer = setTimeout(() => {
            buscarLibrosAutocompletado(busqueda, 'nombre');
        }, 300);
    });
    
    // Autocompletado de libro por ISBN
    document.getElementById('input-buscar-libro-isbn').addEventListener('input', function() {
        clearTimeout(debounceLibroTimer);
        const busqueda = this.value.trim();
        
        if (busqueda.length < 2) {
            document.getElementById('sugerencias-libro-isbn').classList.add('hidden');
            return;
        }
        
        debounceLibroTimer = setTimeout(() => {
            buscarLibrosAutocompletado(busqueda, 'isbn');
        }, 300);
    });
}

function mostrarMetodoUsuario(metodo) {
    // Actualizar botones con estilos responsive
    document.getElementById('btn-metodo-usuario-buscar').className = metodo === 'buscar' 
        ? 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700'
        : 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    document.getElementById('btn-metodo-usuario-codigo').className = metodo === 'codigo' 
        ? 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700'
        : 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    
    // Mostrar/ocultar secciones
    document.getElementById('metodo-usuario-buscar').classList.toggle('hidden', metodo !== 'buscar');
    document.getElementById('metodo-usuario-codigo').classList.toggle('hidden', metodo !== 'codigo');
}

function mostrarMetodoLibro(metodo) {
    // Actualizar botones con estilos responsive
    document.getElementById('btn-metodo-libro-nombre').className = metodo === 'nombre'
        ? 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700'
        : 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    document.getElementById('btn-metodo-libro-isbn').className = metodo === 'isbn'
        ? 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700'
        : 'px-2 sm:px-4 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    
    // Mostrar/ocultar secciones
    document.getElementById('metodo-libro-nombre').classList.toggle('hidden', metodo !== 'nombre');
    document.getElementById('metodo-libro-isbn').classList.toggle('hidden', metodo !== 'isbn');
}

function buscarUsuariosAutocompletado(busqueda) {
    fetch(`${window.CONTEXT_PATH}/usuarios?accion=buscarAutocompletado&busqueda=${encodeURIComponent(busqueda)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarSugerenciasUsuario(data.usuarios);
            }
        })
        .catch(error => {
            console.error('Error al buscar usuarios:', error);
        });
}

function mostrarSugerenciasUsuario(usuarios) {
    const contenedor = document.getElementById('sugerencias-usuario');
    
    if (usuarios.length === 0) {
        contenedor.innerHTML = '<div class="p-2 text-gray-500 text-sm">No se encontraron usuarios</div>';
        contenedor.classList.remove('hidden');
        return;
    }
    
    let html = '';
    usuarios.forEach(usuario => {
        html += `
            <div class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0" 
                 onclick="seleccionarUsuario(${usuario.id}, '${escapeHtml(usuario.nombreCompleto)}', '${escapeHtml(usuario.usuario)}')">
                <div class="font-medium text-sm">${escapeHtml(usuario.nombreCompleto)}</div>
                <div class="text-xs text-gray-600">Usuario: ${escapeHtml(usuario.usuario)}</div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    contenedor.classList.remove('hidden');
}

function seleccionarUsuario(id, nombreCompleto, usuario) {
    usuarioSeleccionado = { id, nombreCompleto, usuario };
    
    document.getElementById('input-buscar-usuario').value = '';
    document.getElementById('sugerencias-usuario').classList.add('hidden');
    
    // Mostrar el cuadro de confirmación
    const infoDiv = document.getElementById('usuario-seleccionado-info');
    infoDiv.querySelector('span').textContent = `✓ ${nombreCompleto} (${usuario})`;
    infoDiv.classList.remove('hidden');
}

function limpiarUsuarioSeleccionado() {
    usuarioSeleccionado = null;
    document.getElementById('input-buscar-usuario').value = '';
    document.getElementById('usuario-seleccionado-info').classList.add('hidden');
    document.getElementById('input-codigo-usuario').value = '';
    document.getElementById('sugerencias-codigo-usuario').classList.add('hidden');
    document.getElementById('alerta-carnet-vencido').classList.add('hidden');
}

// Búsqueda por código de barras
function buscarUsuariosPorCodigoBarras(codigo) {
    fetch(`${window.CONTEXT_PATH}/usuarios?accion=buscarPorCodigoBarras&codigo=${encodeURIComponent(codigo)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarSugerenciasCodigoUsuario(data.usuarios);
            }
        })
        .catch(error => {
            console.error('Error al buscar usuarios por código de barras:', error);
        });
}

function mostrarSugerenciasCodigoUsuario(usuarios) {
    const contenedor = document.getElementById('sugerencias-codigo-usuario');
    
    if (usuarios.length === 0) {
        contenedor.innerHTML = '<div class="p-2 text-gray-500 text-sm">No se encontraron usuarios con ese código</div>';
        contenedor.classList.remove('hidden');
        return;
    }
    
    let html = '';
    usuarios.forEach(usuario => {
        const vencidoClass = usuario.estaVencido ? 'bg-red-50' : '';
        const vencidoIcon = usuario.estaVencido ? '<i class="fas fa-exclamation-triangle text-red-600 mr-1"></i>' : '';
        html += `
            <div class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 ${vencidoClass}" 
                 onclick="seleccionarUsuarioCodigoBarras(${usuario.id}, '${escapeHtml(usuario.nombreCompleto)}', '${escapeHtml(usuario.usuario)}', '${escapeHtml(usuario.codigo)}', ${usuario.estaVencido})">
                <div class="font-medium text-sm">${vencidoIcon}${escapeHtml(usuario.nombreCompleto)}</div>
                <div class="text-xs text-gray-600">Código: ${escapeHtml(usuario.codigo)}</div>
                ${usuario.estaVencido ? '<div class="text-xs text-red-600 font-medium">⚠️ Carnet vencido</div>' : ''}
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    contenedor.classList.remove('hidden');
}

function seleccionarUsuarioCodigoBarras(id, nombreCompleto, usuario, codigo, estaVencido) {
    usuarioSeleccionado = { id, nombreCompleto, usuario };
    
    document.getElementById('input-codigo-usuario').value = '';
    document.getElementById('sugerencias-codigo-usuario').classList.add('hidden');
    
    // Mostrar/ocultar alerta de carnet vencido
    const alertaDiv = document.getElementById('alerta-carnet-vencido');
    if (estaVencido) {
        alertaDiv.classList.remove('hidden');
    } else {
        alertaDiv.classList.add('hidden');
    }
    
    // Mostrar el cuadro de confirmación con el usuario seleccionado
    const infoDiv = document.getElementById('usuario-seleccionado-info');
    infoDiv.querySelector('span').textContent = `✓ ${nombreCompleto} (${usuario})`;
    infoDiv.classList.remove('hidden');
}

function buscarLibrosAutocompletado(busqueda, tipo) {
    fetch(`${window.CONTEXT_PATH}/libros?accion=buscarAutocompletado&busqueda=${encodeURIComponent(busqueda)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarSugerenciasLibro(data.libros, tipo);
            }
        })
        .catch(error => {
            console.error('Error al buscar libros:', error);
        });
}

function mostrarSugerenciasLibro(libros, tipo) {
    const contenedorId = tipo === 'nombre' ? 'sugerencias-libro-nombre' : 'sugerencias-libro-isbn';
    const contenedor = document.getElementById(contenedorId);
    
    if (libros.length === 0) {
        contenedor.innerHTML = '<div class="p-2 text-gray-500 text-sm">No se encontraron libros disponibles</div>';
        contenedor.classList.remove('hidden');
        return;
    }
    
    let html = '';
    libros.forEach(libro => {
        html += `
            <div class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0" 
                 onclick="seleccionarLibro(${libro.id}, '${escapeHtml(libro.nombre)}', '${escapeHtml(libro.isbn)}', '${escapeHtml(libro.autor)}', ${libro.stockDisponible})">
                <div class="font-medium text-sm">${escapeHtml(libro.nombre)}</div>
                <div class="text-xs text-gray-600">ISBN: ${escapeHtml(libro.isbn)} | Autor: ${escapeHtml(libro.autor)}</div>
                <div class="text-xs text-green-600">Stock disponible: ${libro.stockDisponible}</div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    contenedor.classList.remove('hidden');
}

function seleccionarLibro(id, nombre, isbn, autor, stockDisponible) {
    libroSeleccionado = { id, nombre, isbn, autor, stockDisponible };
    
    // Limpiar ambos campos de búsqueda
    document.getElementById('input-buscar-libro-nombre').value = '';
    document.getElementById('input-buscar-libro-isbn').value = '';
    
    // Ocultar sugerencias
    document.getElementById('sugerencias-libro-nombre').classList.add('hidden');
    document.getElementById('sugerencias-libro-isbn').classList.add('hidden');
    
    // Mostrar el cuadro de confirmación con el libro seleccionado
    const infoDiv = document.getElementById('libro-seleccionado-info');
    infoDiv.querySelector('span').textContent = `✓ ${nombre} (ISBN: ${isbn}) - Stock: ${stockDisponible}`;
    infoDiv.classList.remove('hidden');
}

function limpiarLibroSeleccionado() {
    libroSeleccionado = null;
    document.getElementById('input-buscar-libro-nombre').value = '';
    document.getElementById('input-buscar-libro-isbn').value = '';
    document.getElementById('libro-seleccionado-info').classList.add('hidden');
}

function crearPrestamoValidado(usuarioId, libroId, diasPrestamo, observaciones) {
    const params = new URLSearchParams();
    params.append('accion', 'crear');
    params.append('usuarioId', usuarioId);
    params.append('libroId', libroId);
    params.append('diasPrestamo', diasPrestamo);
    if (observaciones) {
        params.append('observaciones', observaciones);
    }
    
    return fetch(`${window.CONTEXT_PATH}/prestamos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Préstamo creado!',
                text: data.message,
                confirmButtonColor: '#334155'
            }).then(() => {
                cargarDevolucionesPendientes();
            });
        } else {
            Swal.showValidationMessage(data.message || 'Error al crear préstamo');
        }
        return data.success;
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.showValidationMessage('Error de conexión al crear préstamo');
        return false;
    });
}

function abrirModalDevolucion(prestamoId) {
    Swal.fire({
        title: '<div class="text-lg sm:text-xl">Registrar Devolución</div>',
        width: '95%',
        customClass: {
            container: 'swal-container-devolucion',
            popup: 'swal-popup-devolucion'
        },
        html: `
            <style>
                @media (min-width: 640px) {
                    .swal-popup-devolucion {
                        max-width: 600px !important;
                    }
                }
                .swal-container-devolucion .swal2-html-container {
                    max-height: 70vh;
                    overflow-y: auto;
                }
            </style>
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Estado de la devolución</label>
                    <select id="swal-estado" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <option value="devuelto">Devuelto</option>
                        <option value="perdido">Perdido/Extraviado</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        <strong>Devuelto:</strong> Se sumará 1 al stock disponible | 
                        <strong>Perdido:</strong> Se descontará 1 del stock total
                    </p>
                </div>
                
                <div class="border-t pt-3">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="check-aplicar-multa" class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">Aplicar multa</span>
                    </label>
                    <p class="text-xs text-gray-500 mt-1 ml-6">
                        Marque si el libro está dañado, perdido o requiere penalización
                    </p>
                </div>
                
                <div id="campo-multa" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Monto de la multa (S/.)
                    </label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">S/.</span>
                        <input type="number" id="swal-multa" value="0.00" min="0" step="0.01" 
                               class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="0.00">
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Ingrese el monto de la penalización</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                        <span class="text-xs text-gray-500 font-normal ml-1">- Opcional</span>
                    </label>
                    <textarea id="swal-observaciones" rows="3"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="Ej: Libro devuelto con páginas dobladas, Libro extraviado por el usuario..."></textarea>
                    <p class="text-xs text-gray-500 mt-1">Describa el estado del libro o detalles relevantes</p>
                </div>
            </div>
        `,
        confirmButtonText: '<i class="fas fa-check mr-2"></i>Registrar Devolución',
        confirmButtonColor: '#16a34a',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const estadoSelect = document.getElementById('swal-estado');
            const checkMulta = document.getElementById('check-aplicar-multa');
            const campoMulta = document.getElementById('campo-multa');
            const inputMulta = document.getElementById('swal-multa');
            
            // Al cambiar el estado a "perdido", marcar automáticamente el checkbox de multa
            estadoSelect.addEventListener('change', function() {
                if (this.value === 'perdido') {
                    checkMulta.checked = true;
                    campoMulta.classList.remove('hidden');
                    inputMulta.value = '0.00';
                    inputMulta.focus();
                }
            });
            
            // Mostrar/ocultar campo de multa según el checkbox
            checkMulta.addEventListener('change', function() {
                if (this.checked) {
                    campoMulta.classList.remove('hidden');
                    inputMulta.focus();
                } else {
                    campoMulta.classList.add('hidden');
                    inputMulta.value = '0.00';
                }
            });
        },
        preConfirm: () => {
            const estado = document.getElementById('swal-estado').value;
            const aplicarMulta = document.getElementById('check-aplicar-multa').checked;
            const multa = aplicarMulta ? (document.getElementById('swal-multa').value || '0.00') : '0.00';
            const observaciones = document.getElementById('swal-observaciones').value.trim();
            
            // Validar que si es perdido y tiene multa, tenga observaciones
            if (estado === 'perdido' && !observaciones) {
                Swal.showValidationMessage('Por favor agregue observaciones sobre el libro perdido');
                return false;
            }
            
            // Validar que si aplica multa mayor a 0, tenga observaciones
            if (aplicarMulta && parseFloat(multa) > 0 && !observaciones) {
                Swal.showValidationMessage('Por favor agregue observaciones sobre el motivo de la multa');
                return false;
            }
            
            return { estado, multa, observaciones };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            registrarDevolucion(prestamoId, result.value.estado, result.value.multa, result.value.observaciones);
        }
    });
}

function registrarDevolucion(id, estado, multa, observaciones) {
    const params = new URLSearchParams();
    params.append('accion', 'registrarDevolucion');
    params.append('id', id);
    params.append('estado', estado);
    params.append('multa', multa);
    params.append('observaciones', observaciones);
    
    fetch(`${window.CONTEXT_PATH}/prestamos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito(data.message || 'Devolución registrada exitosamente');
            cargarDevolucionesPendientes();
        } else {
            mostrarError(data.message || 'Error al registrar devolución');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    });
}

function verDetallePrestamo(prestamoId) {
    fetch(`${window.CONTEXT_PATH}/prestamos?accion=obtener&id=${prestamoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const p = data.prestamo;
                const fechaPrestamo = formatearFecha(p.fechaPrestamo) + 
                    (p.fechaPrestamo.includes(' ') ? ' ' + p.fechaPrestamo.split(' ')[1] : '');
                const fechaDevolucionProgramada = formatearFecha(p.fechaDevolucionEsperada);
                const fechaDevolucionReal = p.fechaDevolucionReal 
                    ? formatearFecha(p.fechaDevolucionReal) + 
                      (p.fechaDevolucionReal.includes(' ') ? ' ' + p.fechaDevolucionReal.split(' ')[1] : '')
                    : 'No devuelto';
                
                Swal.fire({
                    title: '<i class="fas fa-info-circle text-indigo-600"></i> Detalle del Préstamo',
                    width: '700px',
                    html: `
                        <div class="text-left space-y-3">
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Libro</p>
                                <p class="text-sm text-gray-900">${escapeHtml(p.libroNombre)}</p>
                                <p class="text-xs text-gray-500 font-mono">ISBN: ${escapeHtml(p.libroIsbn)}</p>
                            </div>
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Usuario</p>
                                <p class="text-sm text-gray-900">${escapeHtml(p.usuarioNombre)}</p>
                                <p class="text-xs text-gray-500">DNI: ${escapeHtml(p.usuarioDni)}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-3 border-b pb-2">
                                <div>
                                    <p class="text-xs font-semibold text-gray-700">Fecha Préstamo</p>
                                    <p class="text-sm text-gray-900">${fechaPrestamo}</p>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-gray-700">Devolución Programada</p>
                                    <p class="text-sm text-gray-900">${fechaDevolucionProgramada}</p>
                                </div>
                            </div>
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Fecha Devolución Real</p>
                                <p class="text-sm text-gray-900">${fechaDevolucionReal}</p>
                            </div>
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Estado</p>
                                <p class="text-sm text-gray-900">${escapeHtml(p.estado)}</p>
                            </div>
                            ${p.observacionesEntrega ? `
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Observaciones de Entrega</p>
                                <p class="text-sm text-gray-900 whitespace-pre-wrap">${escapeHtml(p.observacionesEntrega)}</p>
                            </div>
                            ` : ''}
                            ${p.observacionesDevolucion ? `
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Observaciones de Devolución</p>
                                <p class="text-sm text-gray-900 whitespace-pre-wrap">${escapeHtml(p.observacionesDevolucion)}</p>
                            </div>
                            ` : ''}
                            ${p.multa > 0 ? `
                            <div class="bg-amber-50 p-3 rounded border border-amber-200">
                                <p class="text-sm font-semibold text-amber-700">Multa</p>
                                <p class="text-2xl font-bold text-amber-600">S/. ${parseFloat(p.multa).toFixed(2)}</p>
                                <p class="text-xs text-amber-600 mt-1">
                                    <i class="fas ${p.pagado ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> 
                                    Estado: ${p.pagado ? 'Pagado' : 'Pendiente'}
                                </p>
                            </div>
                            ` : ''}
                        </div>
                    `,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#6366f1'
                });
            } else {
                mostrarError(data.message || 'Error al obtener detalles');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function eliminarPrestamo(prestamoId, libroNombre) {
    Swal.fire({
        title: '¿Eliminar Préstamo?',
        html: `
            <div class="text-left">
                <p class="text-sm text-gray-700 mb-2">¿Estás seguro de eliminar este préstamo?</p>
                <div class="bg-gray-50 p-3 rounded border">
                    <p class="text-sm font-semibold text-gray-700">Libro:</p>
                    <p class="text-sm text-gray-900">${libroNombre}</p>
                </div>
                <p class="text-xs text-red-600 mt-3">
                    <i class="fas fa-exclamation-triangle"></i> Esta acción restaurará el stock del libro y no se puede deshacer.
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-trash mr-1"></i>Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const params = new URLSearchParams();
            params.append('accion', 'eliminarPrestamo');
            params.append('id', prestamoId);
            
            fetch(`${window.CONTEXT_PATH}/prestamos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: params.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    mostrarExito(data.message || 'Préstamo eliminado exitosamente');
                    cargarDevolucionesPendientes();
                } else {
                    mostrarError(data.message || 'Error al eliminar préstamo');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarError('Error de conexión');
            });
        }
    });
}

function abrirModalExtenderPlazo(prestamoId, libroNombre, usuarioNombre, fechaActual) {
    Swal.fire({
        title: 'Extender Plazo de Devolución',
        width: '600px',
        html: `
            <div class="text-left space-y-4">
                <div class="bg-gray-50 p-3 rounded border">
                    <p class="text-sm font-semibold text-gray-700">Libro:</p>
                    <p class="text-sm text-gray-900">${libroNombre}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded border">
                    <p class="text-sm font-semibold text-gray-700">Usuario:</p>
                    <p class="text-sm text-gray-900">${usuarioNombre}</p>
                </div>
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                    <p class="text-sm font-semibold text-blue-700">Fecha de devolución actual:</p>
                    <p class="text-sm text-blue-900">${fechaActual}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Días adicionales (1-30)</label>
                    <input type="number" id="dias-adicionales" class="swal2-input" min="1" max="30" value="7" 
                           style="width: 100%; margin: 0;">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Observaciones</label>
                    <textarea id="observaciones-extension" class="swal2-textarea" rows="3" 
                              placeholder="Motivo de la extensión..." style="width: 100%; margin: 0;"></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check mr-1"></i>Extender Plazo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        preConfirm: () => {
            const diasAdicionales = parseInt(document.getElementById('dias-adicionales').value);
            const observaciones = document.getElementById('observaciones-extension').value;
            
            if (!diasAdicionales || diasAdicionales < 1 || diasAdicionales > 30) {
                Swal.showValidationMessage('Los días adicionales deben estar entre 1 y 30');
                return false;
            }
            
            if (!observaciones.trim()) {
                Swal.showValidationMessage('Las observaciones son requeridas');
                return false;
            }
            
            return { diasAdicionales, observaciones };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            extenderPlazo(prestamoId, result.value.diasAdicionales, result.value.observaciones);
        }
    });
}

function extenderPlazo(id, diasAdicionales, observaciones) {
    const params = new URLSearchParams();
    params.append('accion', 'extenderPlazo');
    params.append('id', id);
    params.append('diasAdicionales', diasAdicionales);
    params.append('observaciones', observaciones);
    
    fetch(`${window.CONTEXT_PATH}/prestamos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito(data.message || 'Plazo extendido exitosamente');
            cargarDevolucionesPendientes();
        } else {
            mostrarError(data.message || 'Error al extender el plazo');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    });
}
