let paginaActualDevueltos = 1;
let totalPaginasDevueltos = 1;
let busquedaActualDevueltos = '';

document.addEventListener('DOMContentLoaded', function() {
    const inputBuscar = document.getElementById('buscar-devueltos');
    if (inputBuscar) {
        let tiempoEspera;
        inputBuscar.addEventListener('input', function() {
            clearTimeout(tiempoEspera);
            tiempoEspera = setTimeout(() => {
                busquedaActualDevueltos = this.value.trim();
                paginaActualDevueltos = 1;
                cargarLibrosDevueltos();
            }, 500);
        });
    }
});

function cargarLibrosDevueltos() {
    const tbody = document.getElementById('tabla-devueltos');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                <p class="text-sm">Cargando devoluciones...</p>
            </td>
        </tr>
    `;
    
    let url = `${window.CONTEXT_PATH}/prestamos?accion=listarLibrosDevueltos&pagina=${paginaActualDevueltos}`;
    if (busquedaActualDevueltos) {
        url += `&busqueda=${encodeURIComponent(busquedaActualDevueltos)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarLibrosDevueltos(data.prestamos);
                totalPaginasDevueltos = data.totalPaginas;
                actualizarPaginacionDevueltos(data.totalRegistros, data.registroInicio, data.registroFin);
            } else {
                mostrarError(data.message || 'Error al cargar devoluciones');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                            <i class="fas fa-exclamation-circle text-3xl mb-2 text-red-500"></i>
                            <p>Error al cargar las devoluciones</p>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar devoluciones');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-exclamation-triangle text-3xl mb-2 text-yellow-500"></i>
                        <p>Error de conexión</p>
                    </td>
                </tr>
            `;
        });
}

function renderizarLibrosDevueltos(prestamos) {
    const tbody = document.getElementById('tabla-devueltos');
    
    if (!prestamos || prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-check-circle text-3xl mb-2"></i>
                    <p>No hay libros devueltos</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamos.map(prestamo => {
        const fechaPrestamo = formatearFecha(prestamo.fechaPrestamo);
        const fechaDevolucionReal = prestamo.fechaDevolucionReal 
            ? formatearFecha(prestamo.fechaDevolucionReal)
            : 'N/A';
        const fechaDevolucionProgramada = prestamo.fechaDevolucionEsperada 
            ? formatearFecha(prestamo.fechaDevolucionEsperada)
            : 'N/A';
        
        // Verificar si se devolvió a tiempo
        let tiempoDevolucion = '';
        if (prestamo.fechaDevolucionReal && prestamo.fechaDevolucionEsperada) {
            const fechaReal = new Date(prestamo.fechaDevolucionReal);
            const fechaEsperada = new Date(prestamo.fechaDevolucionEsperada);
            const diffDias = Math.floor((fechaReal - fechaEsperada) / (1000 * 60 * 60 * 24));
            
            if (diffDias <= 0) {
                tiempoDevolucion = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">A tiempo</span>';
            } else {
                tiempoDevolucion = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">${diffDias} día(s) tarde</span>`;
            }
        }
        
        // Badge de estado
        let estadoBadge = '';
        if (prestamo.estado === 'perdido') {
            estadoBadge = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">PERDIDO</span>';
        } else if (prestamo.estado === 'devuelto') {
            estadoBadge = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">DEVUELTO</span>';
        }
        
        const multaBadge = prestamo.multa > 0
            ? `<span class="px-2 py-1 text-xs font-semibold rounded-full ${prestamo.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                S/. ${parseFloat(prestamo.multa).toFixed(2)} ${prestamo.pagado ? '(Pagado)' : '(Pendiente)'}
               </span>`
            : '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Sin multa</span>';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-3 sm:px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${escapeHtml(prestamo.libroNombre)}</div>
                    <div class="text-xs text-gray-500 font-mono">${escapeHtml(prestamo.libroIsbn)}</div>
                    <div class="text-xs text-gray-500 md:hidden mt-1">
                        <span class="font-medium">Usuario:</span> ${escapeHtml(prestamo.usuarioNombre)}
                    </div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden md:table-cell">
                    <div class="text-sm text-gray-900">${escapeHtml(prestamo.usuarioNombre)}</div>
                    <div class="text-xs text-gray-500">${escapeHtml(prestamo.usuarioDni)}</div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <div class="text-sm text-gray-900">${fechaPrestamo}</div>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${fechaDevolucionReal}</div>
                    <div class="text-xs text-gray-500 hidden sm:block">Programado: ${fechaDevolucionProgramada}</div>
                    <div class="mt-1 flex flex-wrap gap-1">
                        ${tiempoDevolucion}
                        ${estadoBadge}
                    </div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden xl:table-cell">
                    ${multaBadge}
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <button onclick="verDetalleDevolucion(${prestamo.id})" 
                        class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition mr-2" 
                        title="Ver Detalle">
                        <i class="fas fa-info-circle text-sm sm:text-base"></i>
                    </button>
                    <button onclick="deshacerDevolucion(${prestamo.id})" 
                        class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition" 
                        title="Deshacer Devolución">
                        <i class="fas fa-undo text-sm sm:text-base"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarPaginacionDevueltos(total, inicio, fin) {
    const infoRegistros = document.getElementById('info-registros-devueltos');
    const botonesPaginacion = document.getElementById('botones-paginacion-devueltos');
    
    if (total === 0) {
        infoRegistros.textContent = 'No hay registros';
        botonesPaginacion.innerHTML = '';
        return;
    }
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} registros`;
    
    let html = '';
    
    html += `
        <button onclick="cambiarPaginaDevueltos(${paginaActualDevueltos - 1})" 
            ${paginaActualDevueltos === 1 ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualDevueltos === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    const maxBotones = 5;
    let inicio_pag = Math.max(1, paginaActualDevueltos - Math.floor(maxBotones / 2));
    let fin_pag = Math.min(totalPaginasDevueltos, inicio_pag + maxBotones - 1);
    
    if (fin_pag - inicio_pag < maxBotones - 1) {
        inicio_pag = Math.max(1, fin_pag - maxBotones + 1);
    }
    
    if (inicio_pag > 1) {
        html += `
            <button onclick="cambiarPaginaDevueltos(1)" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                1
            </button>
        `;
        if (inicio_pag > 2) {
            html += '<span class="px-2 py-1 text-gray-500">...</span>';
        }
    }
    
    for (let i = inicio_pag; i <= fin_pag; i++) {
        html += `
            <button onclick="cambiarPaginaDevueltos(${i})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${i === paginaActualDevueltos ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
                ${i}
            </button>
        `;
    }
    
    if (fin_pag < totalPaginasDevueltos) {
        if (fin_pag < totalPaginasDevueltos - 1) {
            html += '<span class="px-2 py-1 text-gray-500">...</span>';
        }
        html += `
            <button onclick="cambiarPaginaDevueltos(${totalPaginasDevueltos})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                ${totalPaginasDevueltos}
            </button>
        `;
    }
    
    html += `
        <button onclick="cambiarPaginaDevueltos(${paginaActualDevueltos + 1})" 
            ${paginaActualDevueltos === totalPaginasDevueltos ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualDevueltos === totalPaginasDevueltos ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPaginaDevueltos(pagina) {
    if (pagina < 1 || pagina > totalPaginasDevueltos || pagina === paginaActualDevueltos) return;
    paginaActualDevueltos = pagina;
    cargarLibrosDevueltos();
}

function verDetalleDevolucion(id) {
    fetch(`${window.CONTEXT_PATH}/prestamos?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const prestamo = data.prestamo;
                const fechaPrestamo = formatearFecha(prestamo.fechaPrestamo) + 
                    (prestamo.fechaPrestamo.includes(' ') ? ' ' + prestamo.fechaPrestamo.split(' ')[1] : '');
                const fechaDevolucionProgramada = formatearFecha(prestamo.fechaDevolucionEsperada);
                const fechaDevolucionReal = prestamo.fechaDevolucionReal 
                    ? formatearFecha(prestamo.fechaDevolucionReal) + 
                      (prestamo.fechaDevolucionReal.includes(' ') ? ' ' + prestamo.fechaDevolucionReal.split(' ')[1] : '')
                    : 'No devuelto';
                
                Swal.fire({
                    title: '<i class="fas fa-book text-slate-600"></i> Detalle de Devolución',
                    html: `
                        <div class="text-left space-y-3">
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Libro</p>
                                <p class="text-sm text-gray-900">${escapeHtml(prestamo.libroNombre)}</p>
                                <p class="text-xs text-gray-500 font-mono">ISBN: ${escapeHtml(prestamo.libroIsbn)}</p>
                            </div>
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Usuario</p>
                                <p class="text-sm text-gray-900">${escapeHtml(prestamo.usuarioNombre)}</p>
                                <p class="text-xs text-gray-500">DNI: ${escapeHtml(prestamo.usuarioDni)}</p>
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
                            ${prestamo.multa > 0 ? `
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Multa</p>
                                <p class="text-sm text-gray-900">S/. ${parseFloat(prestamo.multa).toFixed(2)}</p>
                                <p class="text-xs ${prestamo.pagado ? 'text-green-600' : 'text-red-600'}">
                                    ${prestamo.pagado ? 'Pagado' : 'Pendiente de pago'}
                                </p>
                            </div>
                            ` : ''}
                            ${prestamo.observacionesEntrega ? `
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Observaciones de Entrega</p>
                                <p class="text-sm text-gray-600">${escapeHtml(prestamo.observacionesEntrega)}</p>
                            </div>
                            ` : ''}
                            ${prestamo.observacionesDevolucion ? `
                            <div>
                                <p class="text-sm font-semibold text-gray-700">Observaciones de Devolución</p>
                                <p class="text-sm text-gray-600">${escapeHtml(prestamo.observacionesDevolucion)}</p>
                            </div>
                            ` : ''}
                        </div>
                    `,
                    confirmButtonColor: '#334155',
                    confirmButtonText: 'Cerrar',
                    width: '600px'
                });
            } else {
                mostrarError(data.message || 'Error al cargar el detalle');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function deshacerDevolucion(id) {
    Swal.fire({
        title: '¿Deshacer devolución?',
        text: 'Esta acción marcará el préstamo como pendiente nuevamente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, deshacer',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const params = new URLSearchParams();
            params.append('accion', 'deshacerDevolucion');
            params.append('id', id);
            
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
                    mostrarExito(data.message || 'Devolución deshecha correctamente');
                    cargarLibrosDevueltos();
                } else {
                    mostrarError(data.message || 'Error al deshacer devolución');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarError('Error de conexión');
            });
        }
    });
}
