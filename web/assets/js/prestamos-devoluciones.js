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
            estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                <i class="fas fa-clock mr-1"></i>Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}
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
                    <button onclick="abrirModalDevolucion(${prestamo.id})" 
                        class="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition">
                        <i class="fas fa-undo mr-1"></i>Registrar Devolución
                    </button>
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

function abrirModalNuevoPrestamo() {
    usuarioSeleccionado = null;
    libroSeleccionado = null;
    
    Swal.fire({
        title: 'Nuevo Préstamo',
        width: '800px',
        html: `
            <div class="text-left space-y-6">
                <!-- Sección Usuario -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">1. Seleccionar Usuario</h3>
                    
                    <div class="flex gap-2 mb-3">
                        <button type="button" id="btn-metodo-usuario-buscar" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>Buscar por Nombre
                        </button>
                        <button type="button" id="btn-metodo-usuario-codigo" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400">
                            <i class="fas fa-barcode mr-2"></i>Código de Barras
                        </button>
                    </div>
                    
                    <!-- Búsqueda por nombre -->
                    <div id="metodo-usuario-buscar" class="metodo-usuario">
                        <div class="relative">
                            <input type="text" id="input-buscar-usuario" class="w-full px-3 py-2 border rounded" 
                                   placeholder="Escribe nombre, apellido o usuario...">
                            <div id="sugerencias-usuario" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                        <div id="usuario-seleccionado-info" class="mt-2 p-2 bg-green-50 border border-green-200 rounded hidden">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-green-700"></span>
                                <button type="button" onclick="limpiarUsuarioSeleccionado()" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Código de barras -->
                    <div id="metodo-usuario-codigo" class="metodo-usuario hidden">
                        <input type="text" id="input-codigo-usuario" class="w-full px-3 py-2 border rounded" 
                               placeholder="Escanea el código de barras del usuario...">
                    </div>
                </div>
                
                <!-- Sección Libro -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">2. Seleccionar Libro</h3>
                    
                    <div class="flex gap-2 mb-3">
                        <button type="button" id="btn-metodo-libro-nombre" class="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700">
                            <i class="fas fa-book mr-2"></i>Buscar por Nombre
                        </button>
                        <button type="button" id="btn-metodo-libro-isbn" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400">
                            <i class="fas fa-hashtag mr-2"></i>Buscar por ISBN
                        </button>
                    </div>
                    
                    <!-- Búsqueda por nombre -->
                    <div id="metodo-libro-nombre" class="metodo-libro">
                        <div class="relative">
                            <input type="text" id="input-buscar-libro-nombre" class="w-full px-3 py-2 border rounded" 
                                   placeholder="Escribe el nombre del libro...">
                            <div id="sugerencias-libro-nombre" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                        <div id="libro-seleccionado-info" class="mt-2 p-2 bg-green-50 border border-green-200 rounded hidden">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-green-700"></span>
                                <button type="button" onclick="limpiarLibroSeleccionado()" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Búsqueda por ISBN -->
                    <div id="metodo-libro-isbn" class="metodo-libro hidden">
                        <div class="relative">
                            <input type="text" id="input-buscar-libro-isbn" class="w-full px-3 py-2 border rounded" 
                                   placeholder="Escribe o escanea el ISBN del libro...">
                            <div id="sugerencias-libro-isbn" class="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-48 overflow-y-auto hidden"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Detalles del préstamo -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">3. Detalles del Préstamo</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium mb-1">Días de préstamo</label>
                            <input type="number" id="input-dias-prestamo" class="w-full px-3 py-2 border rounded" 
                                   value="7" min="1" max="30">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Observaciones (opcional)</label>
                            <textarea id="input-observaciones-entrega" class="w-full px-3 py-2 border rounded" 
                                      rows="2" placeholder="Condición del libro al momento de entrega, estado del carnet, etc."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Crear Préstamo',
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
    // Actualizar botones
    document.getElementById('btn-metodo-usuario-buscar').className = metodo === 'buscar' 
        ? 'flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700'
        : 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    document.getElementById('btn-metodo-usuario-codigo').className = metodo === 'codigo' 
        ? 'flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700'
        : 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    
    // Mostrar/ocultar secciones
    document.getElementById('metodo-usuario-buscar').classList.toggle('hidden', metodo !== 'buscar');
    document.getElementById('metodo-usuario-codigo').classList.toggle('hidden', metodo !== 'codigo');
}

function mostrarMetodoLibro(metodo) {
    // Actualizar botones
    document.getElementById('btn-metodo-libro-nombre').className = metodo === 'nombre'
        ? 'flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700'
        : 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    document.getElementById('btn-metodo-libro-isbn').className = metodo === 'isbn'
        ? 'flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700'
        : 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400';
    
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
    
    document.getElementById('input-buscar-usuario').value = nombreCompleto;
    document.getElementById('sugerencias-usuario').classList.add('hidden');
    
    const infoDiv = document.getElementById('usuario-seleccionado-info');
    infoDiv.querySelector('span').textContent = `✓ ${nombreCompleto} (${usuario})`;
    infoDiv.classList.remove('hidden');
}

function limpiarUsuarioSeleccionado() {
    usuarioSeleccionado = null;
    document.getElementById('input-buscar-usuario').value = '';
    document.getElementById('usuario-seleccionado-info').classList.add('hidden');
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
    
    // Llenar ambos campos de búsqueda
    document.getElementById('input-buscar-libro-nombre').value = nombre;
    document.getElementById('input-buscar-libro-isbn').value = isbn;
    
    // Ocultar sugerencias
    document.getElementById('sugerencias-libro-nombre').classList.add('hidden');
    document.getElementById('sugerencias-libro-isbn').classList.add('hidden');
    
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
        title: 'Registrar Devolución',
        html: `
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Estado de la devolución</label>
                    <select id="swal-estado" class="swal2-input w-full">
                        <option value="devuelto">Devuelto en buen estado</option>
                        <option value="vencido">Devuelto con retraso</option>
                        <option value="perdido">Libro perdido/extraviado</option>
                    </select>
                </div>
                <div id="campo-multa" style="display:none;">
                    <label class="block text-sm font-medium mb-1">Multa (S/.)</label>
                    <input type="number" id="swal-multa" class="swal2-input w-full" value="0" min="0" step="0.01">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Observaciones</label>
                    <textarea id="swal-observaciones" class="swal2-textarea w-full" placeholder="Observaciones opcionales"></textarea>
                </div>
            </div>
        `,
        confirmButtonText: 'Registrar Devolución',
        confirmButtonColor: '#16a34a',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const estadoSelect = document.getElementById('swal-estado');
            const campoMulta = document.getElementById('campo-multa');
            
            estadoSelect.addEventListener('change', function() {
                if (this.value === 'vencido' || this.value === 'perdido') {
                    campoMulta.style.display = 'block';
                } else {
                    campoMulta.style.display = 'none';
                    document.getElementById('swal-multa').value = '0';
                }
            });
        },
        preConfirm: () => {
            const estado = document.getElementById('swal-estado').value;
            const multa = document.getElementById('swal-multa').value;
            const observaciones = document.getElementById('swal-observaciones').value;
            
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
