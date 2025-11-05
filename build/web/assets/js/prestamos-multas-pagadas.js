let paginaActualMultasPag = 1;
let totalPaginasMultasPag = 1;
let busquedaActualMultasPag = '';

document.addEventListener('DOMContentLoaded', function() {
    const inputBuscar = document.getElementById('buscar-multas-pagadas');
    if (inputBuscar) {
        let tiempoEspera;
        inputBuscar.addEventListener('input', function() {
            clearTimeout(tiempoEspera);
            tiempoEspera = setTimeout(() => {
                busquedaActualMultasPag = this.value.trim();
                paginaActualMultasPag = 1;
                cargarMultasPagadas();
            }, 500);
        });
    }
});

function cargarMultasPagadas() {
    const tbody = document.getElementById('tabla-multas-pagadas');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                <p class="text-sm">Cargando multas pagadas...</p>
            </td>
        </tr>
    `;
    
    let url = `${window.CONTEXT_PATH}/prestamos?accion=listarMultasPagadas&pagina=${paginaActualMultasPag}`;
    if (busquedaActualMultasPag) {
        url += `&busqueda=${encodeURIComponent(busquedaActualMultasPag)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarMultasPagadas(data.prestamos);
                totalPaginasMultasPag = data.totalPaginas;
                actualizarPaginacionMultasPagadas(data.totalRegistros, data.registroInicio, data.registroFin);
            } else {
                mostrarError(data.message || 'Error al cargar multas pagadas');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                            <i class="fas fa-exclamation-circle text-3xl mb-2 text-red-500"></i>
                            <p>Error al cargar las multas pagadas</p>
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

function renderizarMultasPagadas(prestamos) {
    const tbody = document.getElementById('tabla-multas-pagadas');
    
    if (!prestamos || prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-inbox text-3xl mb-2"></i>
                    <p>No hay multas pagadas registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Calcular total de multas pagadas
    const totalMultas = prestamos.reduce((sum, p) => sum + parseFloat(p.multa), 0);
    
    tbody.innerHTML = prestamos.map(prestamo => {
        const fechaPrestamo = new Date(prestamo.fechaPrestamo).toLocaleDateString('es-PE');
        const fechaDevolucionReal = prestamo.fechaDevolucionReal 
            ? new Date(prestamo.fechaDevolucionReal).toLocaleDateString('es-PE') 
            : 'No devuelto';
        const fechaDevolucionProgramada = prestamo.fechaDevolucionEsperada 
            ? new Date(prestamo.fechaDevolucionEsperada).toLocaleDateString('es-PE') 
            : 'N/A';
        
        // Calcular días de retraso
        let diasRetraso = 0;
        let estadoBadge = '';
        if (prestamo.fechaDevolucionReal && prestamo.fechaDevolucionEsperada) {
            const real = new Date(prestamo.fechaDevolucionReal);
            const esperada = new Date(prestamo.fechaDevolucionEsperada);
            diasRetraso = Math.ceil((real - esperada) / (1000 * 60 * 60 * 24));
            if (diasRetraso > 0) {
                estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">${diasRetraso} día(s) tarde</span>`;
            }
        }
        
        const multa = parseFloat(prestamo.multa);
        
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
                    <div class="flex items-center">
                        <span class="px-3 py-1.5 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                            S/. ${multa.toFixed(2)}
                        </span>
                        <i class="fas fa-check-circle text-green-600 ml-2" title="Pagado"></i>
                    </div>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <button onclick="verDetalleMulta(${prestamo.id})" 
                        class="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition" 
                        title="Ver Detalle">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Agregar fila de total al final
    const totalRow = `
        <tr class="bg-gray-100 font-semibold">
            <td colspan="4" class="px-3 sm:px-6 py-3 text-right text-sm text-gray-700">
                TOTAL MULTAS PAGADAS (Página actual):
            </td>
            <td colspan="2" class="px-3 sm:px-6 py-3 text-sm text-green-700">
                S/. ${totalMultas.toFixed(2)}
            </td>
        </tr>
    `;
    tbody.innerHTML += totalRow;
}

function actualizarPaginacionMultasPagadas(total, inicio, fin) {
    const infoRegistros = document.getElementById('info-registros-multas-pagadas');
    const botonesPaginacion = document.getElementById('botones-paginacion-multas-pagadas');
    
    if (total === 0) {
        infoRegistros.textContent = 'No hay registros';
        botonesPaginacion.innerHTML = '';
        return;
    }
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} registros`;
    
    let html = '';
    
    html += `
        <button onclick="cambiarPaginaMultasPag(${paginaActualMultasPag - 1})" 
            ${paginaActualMultasPag === 1 ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualMultasPag === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    const maxBotones = 5;
    let inicio_pag = Math.max(1, paginaActualMultasPag - Math.floor(maxBotones / 2));
    let fin_pag = Math.min(totalPaginasMultasPag, inicio_pag + maxBotones - 1);
    
    if (fin_pag - inicio_pag < maxBotones - 1) {
        inicio_pag = Math.max(1, fin_pag - maxBotones + 1);
    }
    
    if (inicio_pag > 1) {
        html += `
            <button onclick="cambiarPaginaMultasPag(1)" 
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
            <button onclick="cambiarPaginaMultasPag(${i})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${i === paginaActualMultasPag ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
                ${i}
            </button>
        `;
    }
    
    if (fin_pag < totalPaginasMultasPag) {
        if (fin_pag < totalPaginasMultasPag - 1) {
            html += '<span class="px-2 py-1 text-gray-500">...</span>';
        }
        html += `
            <button onclick="cambiarPaginaMultasPag(${totalPaginasMultasPag})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                ${totalPaginasMultasPag}
            </button>
        `;
    }
    
    html += `
        <button onclick="cambiarPaginaMultasPag(${paginaActualMultasPag + 1})" 
            ${paginaActualMultasPag === totalPaginasMultasPag ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActualMultasPag === totalPaginasMultasPag ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPaginaMultasPag(pagina) {
    if (pagina < 1 || pagina > totalPaginasMultasPag || pagina === paginaActualMultasPag) return;
    paginaActualMultasPag = pagina;
    cargarMultasPagadas();
}

function verDetalleMulta(id) {
    fetch(`${window.CONTEXT_PATH}/prestamos?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const prestamo = data.prestamo;
                const fechaPrestamo = new Date(prestamo.fechaPrestamo).toLocaleString('es-PE');
                const fechaDevolucionProgramada = new Date(prestamo.fechaDevolucionEsperada).toLocaleDateString('es-PE');
                const fechaDevolucionReal = prestamo.fechaDevolucionReal 
                    ? new Date(prestamo.fechaDevolucionReal).toLocaleString('es-PE') 
                    : 'No devuelto';
                
                // Calcular días de retraso
                let diasRetraso = 0;
                if (prestamo.fechaDevolucionReal && prestamo.fechaDevolucionEsperada) {
                    const real = new Date(prestamo.fechaDevolucionReal);
                    const esperada = new Date(prestamo.fechaDevolucionEsperada);
                    diasRetraso = Math.ceil((real - esperada) / (1000 * 60 * 60 * 24));
                }
                
                Swal.fire({
                    title: '<i class="fas fa-receipt text-green-600"></i> Detalle de Multa Pagada',
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
                                ${diasRetraso > 0 ? `<p class="text-xs text-orange-600 mt-1">Retrasado ${diasRetraso} día(s)</p>` : ''}
                            </div>
                            <div class="bg-green-50 p-3 rounded border border-green-200">
                                <p class="text-sm font-semibold text-green-700">Multa Pagada</p>
                                <p class="text-2xl font-bold text-green-600">S/. ${parseFloat(prestamo.multa).toFixed(2)}</p>
                                <p class="text-xs text-green-600 mt-1">
                                    <i class="fas fa-check-circle"></i> Estado: Pagado
                                </p>
                            </div>
                            ${prestamo.observaciones ? `
                            <div>
                                <p class="text-sm font-semibold text-gray-700">Observaciones</p>
                                <p class="text-sm text-gray-600">${escapeHtml(prestamo.observaciones)}</p>
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
