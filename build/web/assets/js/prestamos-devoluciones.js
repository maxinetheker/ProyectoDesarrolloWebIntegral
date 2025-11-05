let paginaActualDevoluciones = 1;
let totalPaginasDevoluciones = 1;
let busquedaActualDevoluciones = '';

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
    
    let url = `${window.CONTEXT_PATH}/prestamo?accion=listarDevolucionesPendientes&pagina=${paginaActualDevoluciones}`;
    if (busquedaActualDevoluciones) {
        url += `&busqueda=${encodeURIComponent(busquedaActualDevoluciones)}`;
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

function abrirModalNuevoPrestamo() {
    Swal.fire({
        title: 'Nuevo Préstamo',
        html: `
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Usuario (DNI o Código de Barras)</label>
                    <input type="text" id="swal-usuario-dni" class="swal2-input w-full" placeholder="Escanea o ingresa DNI">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Libro (ISBN o Código de Barras)</label>
                    <input type="text" id="swal-libro-isbn" class="swal2-input w-full" placeholder="Escanea o ingresa ISBN">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Días de préstamo</label>
                    <input type="number" id="swal-dias-prestamo" class="swal2-input w-full" value="7" min="1" max="30">
                </div>
            </div>
        `,
        confirmButtonText: 'Crear Préstamo',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const usuarioDni = document.getElementById('swal-usuario-dni').value;
            const libroIsbn = document.getElementById('swal-libro-isbn').value;
            const diasPrestamo = document.getElementById('swal-dias-prestamo').value;
            
            if (!usuarioDni || !libroIsbn || !diasPrestamo) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }
            
            return { usuarioDni, libroIsbn, diasPrestamo };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Aquí se implementaría la lógica para buscar usuario y libro por DNI e ISBN
            // y luego crear el préstamo
            mostrarExito('Funcionalidad de búsqueda de usuario/libro por implementar');
        }
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
    const formData = new FormData();
    formData.append('accion', 'registrarDevolucion');
    formData.append('id', id);
    formData.append('estado', estado);
    formData.append('multa', multa);
    formData.append('observaciones', observaciones);
    
    fetch(`${window.CONTEXT_PATH}/prestamo`, {
        method: 'POST',
        body: formData
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
