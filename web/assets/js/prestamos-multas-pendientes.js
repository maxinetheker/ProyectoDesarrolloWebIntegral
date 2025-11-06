let paginaActualMultasPend = 1;
let totalPaginasMultasPend = 1;
let busquedaActualMultasPend = '';

document.addEventListener('DOMContentLoaded', function() {
    const inputBuscar = document.getElementById('buscar-multas-pendientes');
    if (inputBuscar) {
        let tiempoEspera;
        inputBuscar.addEventListener('input', function() {
            clearTimeout(tiempoEspera);
            tiempoEspera = setTimeout(() => {
                busquedaActualMultasPend = this.value.trim();
                paginaActualMultasPend = 1;
                cargarMultasPendientes();
            }, 500);
        });
    }
});

function cargarMultasPendientes() {
    const tbody = document.getElementById('tabla-multas-pendientes');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                <p class="text-sm">Cargando multas pendientes...</p>
            </td>
        </tr>
    `;
    
    let url = `${window.CONTEXT_PATH}/prestamos?accion=listarMultasPendientes&pagina=${paginaActualMultasPend}`;
    if (busquedaActualMultasPend) {
        url += `&busqueda=${encodeURIComponent(busquedaActualMultasPend)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarMultasPendientes(data.prestamos);
                totalPaginasMultasPend = data.totalPaginas;
                actualizarPaginacionMultasPendientes(data.totalRegistros, data.registroInicio, data.registroFin);
            } else {
                mostrarError(data.message || 'Error al cargar multas pendientes');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                            <i class="fas fa-exclamation-circle text-3xl mb-2 text-red-500"></i>
                            <p>Error al cargar las multas pendientes</p>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar multas');
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

function renderizarMultasPendientes(prestamos) {
    const tbody = document.getElementById('tabla-multas-pendientes');
    
    if (!prestamos || prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-smile text-3xl mb-2 text-green-500"></i>
                    <p>No hay multas pendientes</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamos.map(prestamo => {
        const fechaPrestamo = formatearFecha(prestamo.fechaPrestamo);
        const fechaDevolucionReal = prestamo.fechaDevolucionReal 
            ? formatearFecha(prestamo.fechaDevolucionReal)
            : 'No devuelto';
        const fechaDevolucionProgramada = prestamo.fechaDevolucionEsperada 
            ? formatearFecha(prestamo.fechaDevolucionEsperada)
            : 'N/A';
        
        // Calcular días de retraso
        let diasRetraso = 0;
        let estadoBadge = '';
        if (prestamo.fechaDevolucionReal && prestamo.fechaDevolucionEsperada) {
            diasRetraso = diasDesde(prestamo.fechaDevolucionEsperada);
            if (diasRetraso > 0) {
                estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">${diasRetraso} día(s) tarde</span>`;
            }
        } else if (prestamo.estado === 'prestado' || prestamo.estado === 'vencido') {
            diasRetraso = diasDesde(prestamo.fechaDevolucionEsperada);
            if (diasRetraso > 0) {
                estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">${diasRetraso} día(s) vencido</span>`;
            }
        }
        
        const multa = parseFloat(prestamo.multa);
        const multaBadge = multa > 100
            ? 'bg-red-100 text-red-800'
            : multa > 50
            ? 'bg-orange-100 text-orange-700'
            : 'bg-amber-100 text-amber-700';
        
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
                <td class="px-3 sm:px-6 py-4 hidden xl:table-cell">
                    <div class="text-sm text-gray-900">${fechaDevolucionReal}</div>
                    <div class="text-xs text-gray-500">Programado: ${fechaDevolucionProgramada}</div>
                    ${estadoBadge ? `<div class="mt-1">${estadoBadge}</div>` : ''}
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <span class="px-3 py-1.5 text-sm font-semibold rounded-full ${multaBadge}">
                        S/. ${multa.toFixed(2)}
                    </span>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <button onclick="verDetalleMultaPendiente(${prestamo.id})" 
                        class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition mr-2" 
                        title="Ver Detalle">
                        <i class="fas fa-info-circle text-sm sm:text-base"></i>
                    </button>
                    <button onclick="modificarMulta(${prestamo.id}, ${multa})" 
                        class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition mr-2" 
                        title="Modificar Multa">
                        <i class="fas fa-edit text-sm sm:text-base"></i>
                    </button>
                    <button onclick="marcarMultaComoPagada(${prestamo.id}, ${multa})" 
                        class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition" 
                        title="Marcar como Pagado">
                        <i class="fas fa-check-circle text-sm sm:text-base"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarPaginacionMultasPendientes(total, inicio, fin) {
    const infoRegistros = document.getElementById('info-registros-multas-pendientes');
    const botonesPaginacion = document.getElementById('botones-paginacion-multas-pendientes');
    
    if (total === 0) {
        infoRegistros.textContent = 'No hay registros';
        botonesPaginacion.innerHTML = '';
        return;
    }
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} registros`;
    
    let html = '';
    
    html += `
        <button onclick="cambiarPaginaMultasPend(${paginaActualMultasPend - 1})" 
            ${paginaActualMultasPend === 1 ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualMultasPend === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    const maxBotones = 5;
    let inicio_pag = Math.max(1, paginaActualMultasPend - Math.floor(maxBotones / 2));
    let fin_pag = Math.min(totalPaginasMultasPend, inicio_pag + maxBotones - 1);
    
    if (fin_pag - inicio_pag < maxBotones - 1) {
        inicio_pag = Math.max(1, fin_pag - maxBotones + 1);
    }
    
    if (inicio_pag > 1) {
        html += `
            <button onclick="cambiarPaginaMultasPend(1)" 
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
            <button onclick="cambiarPaginaMultasPend(${i})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${i === paginaActualMultasPend ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
                ${i}
            </button>
        `;
    }
    
    if (fin_pag < totalPaginasMultasPend) {
        if (fin_pag < totalPaginasMultasPend - 1) {
            html += '<span class="px-2 py-1 text-gray-500">...</span>';
        }
        html += `
            <button onclick="cambiarPaginaMultasPend(${totalPaginasMultasPend})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                ${totalPaginasMultasPend}
            </button>
        `;
    }
    
    html += `
        <button onclick="cambiarPaginaMultasPend(${paginaActualMultasPend + 1})" 
            ${paginaActualMultasPend === totalPaginasMultasPend ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualMultasPend === totalPaginasMultasPend ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPaginaMultasPend(pagina) {
    if (pagina < 1 || pagina > totalPaginasMultasPend || pagina === paginaActualMultasPend) return;
    paginaActualMultasPend = pagina;
    cargarMultasPendientes();
}

function marcarMultaComoPagada(id, monto) {
    Swal.fire({
        title: '¿Confirmar pago de multa?',
        html: `
            <div class="text-left space-y-2">
                <p class="text-sm text-gray-700">Se registrará el pago de la multa:</p>
                <p class="text-2xl font-bold text-green-600">S/. ${monto.toFixed(2)}</p>
                <p class="text-xs text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-check mr-1"></i> Confirmar Pago',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const params = new URLSearchParams();
            params.append('accion', 'marcarMultaPagada');
            params.append('id', id);
            
            fetch(`${window.CONTEXT_PATH}/prestamos`, {
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
                        title: '¡Pago Registrado!',
                        text: 'La multa ha sido marcada como pagada',
                        confirmButtonColor: '#334155',
                        timer: 2000
                    });
                    cargarMultasPendientes();
                } else {
                    mostrarError(data.message || 'Error al registrar el pago');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarError('Error de conexión');
            });
        }
    });
}

function modificarMulta(id, multaActual) {
    Swal.fire({
        title: 'Modificar Multa',
        html: `
            <div class="text-left space-y-3">
                <p class="text-sm text-gray-700">Multa actual: <strong>S/. ${multaActual.toFixed(2)}</strong></p>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nueva multa (S/.)</label>
                    <input type="number" id="swal-nueva-multa" value="${multaActual.toFixed(2)}" 
                           min="0" step="0.01" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-save mr-1"></i> Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nuevaMulta = parseFloat(document.getElementById('swal-nueva-multa').value);
            if (isNaN(nuevaMulta) || nuevaMulta < 0) {
                Swal.showValidationMessage('Ingrese un monto válido');
                return false;
            }
            return nuevaMulta;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const params = new URLSearchParams();
            params.append('accion', 'actualizarMulta');
            params.append('id', id);
            params.append('multa', result.value);
            
            fetch(`${window.CONTEXT_PATH}/prestamos`, {
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
                        title: '¡Multa Actualizada!',
                        text: `Nueva multa: S/. ${result.value.toFixed(2)}`,
                        confirmButtonColor: '#334155',
                        timer: 2000
                    });
                    cargarMultasPendientes();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo actualizar la multa',
                        confirmButtonColor: '#334155'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión al actualizar la multa',
                    confirmButtonColor: '#334155'
                });
            });
        }
    });
}

function verDetalleMultaPendiente(id) {
    fetch(`${window.CONTEXT_PATH}/prestamos?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const p = data.prestamo;
                const fechaPrestamo = formatearFecha(p.fechaPrestamo);
                const fechaDevolucionEsperada = formatearFecha(p.fechaDevolucionEsperada);
                const fechaDevolucionReal = p.fechaDevolucionReal 
                    ? formatearFecha(p.fechaDevolucionReal)
                    : 'No devuelto';
                
                Swal.fire({
                    title: '<i class="fas fa-exclamation-triangle text-slate-600"></i> Detalle de Multa Pendiente',
                    html: `
                        <div class="text-left space-y-3">
                            <div class="bg-slate-50 p-3 rounded border border-slate-200">
                                <p class="text-sm font-semibold text-gray-700">Multa Pendiente de Pago</p>
                                <p class="text-2xl font-bold text-gray-900">S/. ${parseFloat(p.multa).toFixed(2)}</p>
                                <p class="text-xs text-gray-600 mt-1">
                                    <i class="fas fa-exclamation-circle"></i> Estado: NO PAGADO
                                </p>
                            </div>
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
                                    <p class="text-xs font-semibold text-gray-700">Devolución Esperada</p>
                                    <p class="text-sm text-gray-900">${fechaDevolucionEsperada}</p>
                                </div>
                            </div>
                            <div class="border-b pb-2">
                                <p class="text-sm font-semibold text-gray-700">Fecha Devolución Real</p>
                                <p class="text-sm text-gray-900">${fechaDevolucionReal}</p>
                            </div>
                            ${p.observacionesDevolucion ? `
                            <div>
                                <p class="text-sm font-semibold text-gray-700">Observaciones de Devolución</p>
                                <p class="text-sm text-gray-600">${escapeHtml(p.observacionesDevolucion)}</p>
                            </div>
                            ` : ''}
                        </div>
                    `,
                    confirmButtonColor: '#334155',
                    confirmButtonText: 'Cerrar',
                    width: '600px'
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
