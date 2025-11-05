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
                estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">${diasRetraso} día(s) tarde</span>`;
            }
        } else if (prestamo.estado === 'prestado' || prestamo.estado === 'vencido') {
            const hoy = new Date();
            const esperada = new Date(prestamo.fechaDevolucionEsperada);
            diasRetraso = Math.ceil((hoy - esperada) / (1000 * 60 * 60 * 24));
            if (diasRetraso > 0) {
                estadoBadge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">${diasRetraso} día(s) vencido</span>`;
            }
        }
        
        const multa = parseFloat(prestamo.multa);
        const multaBadge = multa > 100
            ? 'bg-red-100 text-red-800'
            : multa > 50
            ? 'bg-orange-100 text-orange-800'
            : 'bg-yellow-100 text-yellow-800';
        
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
                    <button onclick="marcarMultaComoPagada(${prestamo.id}, ${multa})" 
                        class="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition" 
                        title="Marcar como Pagado">
                        <i class="fas fa-check-circle"></i>
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
            const formData = new FormData();
            formData.append('accion', 'marcarMultaPagada');
            formData.append('id', id);
            
            fetch(`${window.CONTEXT_PATH}/prestamos`, {
                method: 'POST',
                body: formData
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
