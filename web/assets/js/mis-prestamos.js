let prestamosData = [];
let filtroActual = 'todos';
let terminoBusqueda = '';
let paginaActual = 1;
let totalPaginas = 1;
const elementosPorPagina = 10;

document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    cargarPrestamos();
});

function configurarEventos() {
    const campoBusqueda = document.getElementById('buscar-prestamos');
    if (campoBusqueda) {
        let timeoutBusqueda;
        campoBusqueda.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                terminoBusqueda = this.value;
                paginaActual = 1;
                cargarPrestamos();
            }, 300);
        });
    }

    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            filtroActual = this.value;
            paginaActual = 1;
            cargarPrestamos();
        });
    }
}

function mostrarCarga() {
    const cargaPrestamos = document.getElementById('carga-prestamos');
    const cargaPrestamosMobile = document.getElementById('carga-prestamos-mobile');
    
    if (cargaPrestamos) cargaPrestamos.style.display = 'table-row';
    if (cargaPrestamosMobile) cargaPrestamosMobile.style.display = 'block';
}

function ocultarCarga() {
    const cargaPrestamos = document.getElementById('carga-prestamos');
    const cargaPrestamosMobile = document.getElementById('carga-prestamos-mobile');
    
    if (cargaPrestamos) cargaPrestamos.style.display = 'none';
    if (cargaPrestamosMobile) cargaPrestamosMobile.style.display = 'none';
}

async function cargarPrestamos() {
    try {
        mostrarCarga();
        
        const params = new URLSearchParams({
            accion: 'obtener',
            estado: filtroActual,
            termino: terminoBusqueda,
            pagina: paginaActual,
            elementosPorPagina: elementosPorPagina
        });

        const response = await fetch(`${window.CONTEXT_PATH}/mis-prestamos?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        prestamosData = data.prestamos || [];
        totalPaginas = data.totalPaginas || 1;
        
        actualizarTabla(prestamosData);
        actualizarContadores(data.total || 0);
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error al cargar préstamos:', error);
        mostrarError('Error al cargar los préstamos: ' + error.message);
    } finally {
        ocultarCarga();
    }
}

function actualizarTabla(prestamos) {
    const tbody = document.getElementById('tabla-prestamos');
    const containerMobile = document.getElementById('prestamos-mobile');
    
    if (!tbody) {
        console.error('No se encontró el elemento tabla-prestamos');
        return;
    }
    
    if (!containerMobile) {
        console.error('No se encontró el elemento prestamos-mobile');
        return;
    }
    
    tbody.innerHTML = '';
    containerMobile.innerHTML = '';
    
    if (prestamos.length === 0) {
        mostrarFilaVacia();
        mostrarCardsVacios();
        return;
    }

    prestamos.forEach(prestamo => {
        const fila = crearFilaPrestamo(prestamo);
        tbody.appendChild(fila);
        
        const card = crearCardPrestamo(prestamo);
        containerMobile.appendChild(card);
    });
}

function crearFilaPrestamo(prestamo) {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';

    const fechaPrestamo = formatearFecha(prestamo.fechaEntrega || prestamo.fechaPrestamo);
    const fechaDevolucion = formatearFecha(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada || prestamo.fechaLimite);
    const fechaDevolucionReal = formatearFecha(prestamo.fechaDevolucionReal || prestamo.fechaDevolucion);
    const montoMulta = formatearMoneda(prestamo.multa);
    const diasInfo = calcularDiasInfo(prestamo);
    const estadoInfo = obtenerEstadoInfo(prestamo);

    fila.innerHTML = `
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
                <div class="text-sm font-medium text-gray-900">${escapeHtml(prestamo.libroTitulo || prestamo.libroNombre || 'N/A')}</div>
                <div class="text-sm text-gray-500">
                    <span>Por: ${escapeHtml(prestamo.libroAutor || 'N/A')}</span>
                    <br>
                    <span class="text-xs">ISBN: ${escapeHtml(prestamo.libroIsbn || 'N/A')}</span>
                </div>
            </div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${fechaPrestamo}</div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
                <div class="text-sm text-gray-900">Esperada: ${fechaDevolucion}</div>
                ${fechaDevolucionReal !== 'N/A' ? `<div class="text-sm text-gray-500">Real: ${fechaDevolucionReal}</div>` : ''}
            </div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.clase}">
                ${estadoInfo.texto}
            </span>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${montoMulta}</div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
                <span class="text-sm ${diasInfo.clase}">${diasInfo.texto}</span>
                <span class="text-xs text-gray-500">${diasInfo.descripcion}</span>
            </div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
            <button onclick="verDetallePrestamo(${prestamo.id})" 
                    class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition" 
                    title="Ver detalles">
                <i class="fas fa-info-circle text-sm sm:text-base"></i>
            </button>
        </td>
    `;

    return fila;
}

function crearCardPrestamo(prestamo) {
    const card = document.createElement('div');
    card.className = 'prestamo-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4';

    const fechaPrestamo = formatearFecha(prestamo.fechaEntrega || prestamo.fechaPrestamo);
    const fechaDevolucion = formatearFecha(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada || prestamo.fechaLimite);
    const fechaDevolucionReal = formatearFecha(prestamo.fechaDevolucionReal || prestamo.fechaDevolucion);
    const montoMulta = formatearMoneda(prestamo.multa);
    const diasInfo = calcularDiasInfo(prestamo);
    const estadoInfo = obtenerEstadoInfo(prestamo);

    card.innerHTML = `
        <div class="space-y-3">
            <!-- Título del libro -->
            <div class="border-b border-gray-100 pb-2">
                <h3 class="font-medium text-gray-900 text-sm">${escapeHtml(prestamo.libroTitulo || prestamo.libroNombre || 'N/A')}</h3>
                <p class="text-xs text-gray-500 mt-1">
                    Por: ${escapeHtml(prestamo.libroAutor || 'N/A')} • ISBN: ${escapeHtml(prestamo.libroIsbn || 'N/A')}
                </p>
            </div>
            
            <!-- Estado y días -->
            <div class="flex justify-between items-center">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.clase}">
                    ${estadoInfo.texto}
                </span>
                <div class="text-right">
                    <div class="text-xs ${diasInfo.clase} font-medium">${diasInfo.texto}</div>
                    <div class="text-xs text-gray-500">${diasInfo.descripcion}</div>
                </div>
            </div>
            
            <!-- Información de fechas -->
            <div class="grid grid-cols-1 gap-2 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-500">Préstamo:</span>
                    <span class="text-gray-900 font-medium">${fechaPrestamo}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Devolución esperada:</span>
                    <span class="text-gray-900 font-medium">${fechaDevolucion}</span>
                </div>
                ${fechaDevolucionReal !== 'N/A' ? `
                <div class="flex justify-between">
                    <span class="text-gray-500">Devolución real:</span>
                    <span class="text-gray-900 font-medium">${fechaDevolucionReal}</span>
                </div>
                ` : ''}
            </div>
            
            <!-- Multa -->
            ${prestamo.multa && parseFloat(prestamo.multa) > 0 ? `
            <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                <span class="text-gray-500 text-xs">Multa:</span>
                <span class="text-red-600 font-bold text-sm">${montoMulta}</span>
            </div>
            ` : ''}
            
            <!-- Botón ver detalles -->
            <div class="pt-2 border-t border-gray-100">
                <button onclick="verDetallePrestamo(${prestamo.id})" 
                        class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-xs font-medium transition-colors duration-200 flex items-center justify-center">
                    <i class="fas fa-info-circle mr-2"></i>Ver Detalles
                </button>
            </div>
        </div>
    `;

    return card;
}

function mostrarFilaVacia() {
    const tbody = document.getElementById('tabla-prestamos');
    if (!tbody) return;
    
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No se encontraron préstamos
        </td>
    `;
    tbody.appendChild(fila);
}

function mostrarCardsVacios() {
    const containerMobile = document.getElementById('prestamos-mobile');
    const emptyState = document.createElement('div');
    emptyState.className = 'text-center py-8 text-gray-500';
    emptyState.innerHTML = `
        <i class="fas fa-search mb-2 text-3xl text-gray-400"></i>
        <p>No se encontraron préstamos</p>
    `;
    containerMobile.appendChild(emptyState);
}

function obtenerEstadoInfo(prestamo) {
    const estado = prestamo.estado;
    
    switch (estado) {
        case 'prestado':
            return {
                texto: 'Activo',
                clase: 'bg-blue-100 text-blue-800'
            };
        case 'vencido':
            return {
                texto: 'Vencido',
                clase: 'bg-red-100 text-red-800'
            };
        case 'devuelto':
            return {
                texto: 'Devuelto',
                clase: 'bg-green-100 text-green-800'
            };
        case 'perdido':
            return {
                texto: 'Perdido',
                clase: 'bg-gray-100 text-gray-800'
            };
        default:
            return {
                texto: estado || 'Desconocido',
                clase: 'bg-gray-100 text-gray-800'
            };
    }
}

function calcularDiasInfo(prestamo) {
    const fechaDevolucion = new Date(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada || prestamo.fechaLimite);
    const fechaActual = new Date();
    const fechaDevReal = prestamo.fechaDevolucionReal || prestamo.fechaDevolucion ? new Date(prestamo.fechaDevolucionReal || prestamo.fechaDevolucion) : null;
    
    if (isNaN(fechaDevolucion.getTime())) {
        return {
            texto: 'N/A',
            descripcion: '',
            clase: 'text-gray-500'
        };
    }

    // Si ya fue devuelto
    if (prestamo.estado === 'devuelto' && fechaDevReal) {
        const diferenciaDias = Math.floor((fechaDevReal - fechaDevolucion) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias <= 0) {
            return {
                texto: 'A tiempo',
                descripcion: `Devuelto ${Math.abs(diferenciaDias)} días antes`,
                clase: 'text-green-600'
            };
        } else {
            return {
                texto: `${diferenciaDias} días tarde`,
                descripcion: 'Devuelto con retraso',
                clase: 'text-red-600'
            };
        }
    }

    // Para préstamos activos o vencidos
    const diferenciaDias = Math.floor((fechaActual - fechaDevolucion) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) {
        return {
            texto: `${Math.abs(diferenciaDias)} días restantes`,
            descripcion: 'Para devolución',
            clase: 'text-blue-600'
        };
    } else if (diferenciaDias === 0) {
        return {
            texto: 'Vence hoy',
            descripcion: 'Debe devolverse',
            clase: 'text-orange-600'
        };
    } else {
        return {
            texto: `${diferenciaDias} días vencido`,
            descripcion: 'Requiere devolución',
            clase: 'text-red-600'
        };
    }
}

function actualizarContadores(total) {
    const elementoTotal = document.getElementById('total-prestamos');
    if (elementoTotal) {
        elementoTotal.textContent = total;
    }
    
    const elementoPaginaActual = document.getElementById('pagina-actual');
    if (elementoPaginaActual) {
        elementoPaginaActual.textContent = paginaActual;
    }
    
    const elementoTotalPaginas = document.getElementById('total-paginas');
    if (elementoTotalPaginas) {
        elementoTotalPaginas.textContent = totalPaginas;
    }
}

function actualizarPaginacion() {
    const contenedorPaginacion = document.getElementById('paginacion-prestamos');
    if (!contenedorPaginacion) return;

    let html = '';
    
    // Botón anterior
    if (paginaActual > 1) {
        html += `<button onclick="cambiarPagina(${paginaActual - 1})" class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    } else {
        html += `<button disabled class="px-3 py-2 ml-0 leading-tight text-gray-300 bg-gray-100 border border-gray-300 rounded-l-lg cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }

    // Números de página
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);
    
    if (fin - inicio + 1 < maxPaginasVisibles) {
        inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
        if (i === paginaActual) {
            html += `<button onclick="cambiarPagina(${i})" class="px-3 py-2 leading-tight text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700">${i}</button>`;
        } else {
            html += `<button onclick="cambiarPagina(${i})" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">${i}</button>`;
        }
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        html += `<button onclick="cambiarPagina(${paginaActual + 1})" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    } else {
        html += `<button disabled class="px-3 py-2 leading-tight text-gray-300 bg-gray-100 border border-gray-300 rounded-r-lg cursor-not-allowed">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    contenedorPaginacion.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas && nuevaPagina !== paginaActual) {
        paginaActual = nuevaPagina;
        cargarPrestamos();
    }
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return 'N/A';
        
        return fechaObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'N/A';
    }
}

function formatearMoneda(monto) {
    if (!monto || monto === 0) return 'S/ 0.00';
    
    try {
        const numero = typeof monto === 'string' ? parseFloat(monto) : monto;
        if (isNaN(numero)) return 'S/ 0.00';
        
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(numero);
    } catch (error) {
        console.error('Error al formatear moneda:', error);
        return 'S/ 0.00';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#475569'
    });
}

function mostrarExito(mensaje) {
    Swal.fire({
        title: 'Éxito',
        text: mensaje,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#475569'
    });
}

// Función para recargar datos
function actualizarDatos() {
    cargarPrestamos();
}

// Función para ver detalles del préstamo
function verDetallePrestamo(id) {
    const prestamo = prestamosData.find(p => p.id === id);
    if (!prestamo) {
        mostrarError('No se encontró el préstamo');
        return;
    }
    
    // Llenar información del libro
    document.getElementById('detalle-libro-titulo').textContent = prestamo.libroTitulo || prestamo.libroNombre || 'N/A';
    document.getElementById('detalle-libro-autor').textContent = prestamo.libroAutor || 'N/A';
    document.getElementById('detalle-libro-isbn').textContent = prestamo.libroIsbn || 'N/A';
    
    // Llenar fechas
    document.getElementById('detalle-fecha-prestamo').textContent = formatearFecha(prestamo.fechaEntrega || prestamo.fechaPrestamo);
    document.getElementById('detalle-fecha-devolucion-esperada').textContent = formatearFecha(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada || prestamo.fechaLimite);
    
    // Fecha de devolución real (solo si existe)
    const fechaDevReal = prestamo.fechaDevolucionReal || prestamo.fechaDevolucion;
    const containerDevReal = document.getElementById('detalle-fecha-devolucion-real-container');
    if (fechaDevReal) {
        document.getElementById('detalle-fecha-devolucion-real').textContent = formatearFecha(fechaDevReal);
        containerDevReal.classList.remove('hidden');
    } else {
        containerDevReal.classList.add('hidden');
    }
    
    // Estado
    const estadoInfo = obtenerEstadoInfo(prestamo);
    const estadoElement = document.getElementById('detalle-estado');
    estadoElement.textContent = estadoInfo.texto;
    estadoElement.className = `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${estadoInfo.clase}`;
    
    // Multa
    document.getElementById('detalle-multa').textContent = formatearMoneda(prestamo.multa);
    
    // Días (solo mostrar para préstamos activos o vencidos)
    const containerDias = document.getElementById('detalle-dias-container');
    if (prestamo.estado === 'prestado' || prestamo.estado === 'vencido') {
        const diasInfo = calcularDiasInfo(prestamo);
        document.getElementById('detalle-dias-info').textContent = diasInfo.texto;
        document.getElementById('detalle-dias-info').className = `text-gray-900 font-semibold ${diasInfo.clase}`;
        document.getElementById('detalle-dias-descripcion').textContent = diasInfo.descripcion;
        containerDias.classList.remove('hidden');
    } else {
        containerDias.classList.add('hidden');
    }
    
    // Observaciones (si existen)
    const observaciones = prestamo.observacionesEntrega || prestamo.observacionesDevolucion;
    const containerObservaciones = document.getElementById('detalle-observaciones-container');
    if (observaciones) {
        document.getElementById('detalle-observaciones').textContent = observaciones;
        containerObservaciones.classList.remove('hidden');
    } else {
        containerObservaciones.classList.add('hidden');
    }
    
    // Mostrar modal
    document.getElementById('modalDetallePrestamo').classList.remove('hidden');
}

function cerrarModalDetalle() {
    document.getElementById('modalDetallePrestamo').classList.add('hidden');
}

// Exportar funciones para uso global si es necesario
window.cargarPrestamos = cargarPrestamos;
window.actualizarDatos = actualizarDatos;
window.cambiarPagina = cambiarPagina;
window.verDetallePrestamo = verDetallePrestamo;
window.cerrarModalDetalle = cerrarModalDetalle;