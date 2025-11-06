// Configuración global
let multasData = [];
let filtroActual = 'todas';
let terminoBusqueda = '';
let paginaActual = 1;
let totalPaginas = 1;
const elementosPorPagina = 10;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    cargarMultas();
});

function configurarEventos() {
    // Evento de búsqueda
    const campoBusqueda = document.getElementById('buscar-multas');
    if (campoBusqueda) {
        let timeoutBusqueda;
        campoBusqueda.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                terminoBusqueda = this.value;
                paginaActual = 1; // Reiniciar a la primera página
                cargarMultas();
            }, 300);
        });
    }

    // Evento de filtro
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            filtroActual = this.value;
            paginaActual = 1; // Reiniciar a la primera página
            cargarMultas();
        });
    }
}

function mostrarCarga() {
    const cargaMultas = document.getElementById('carga-multas');
    const cargaMultasMobile = document.getElementById('carga-multas-mobile');
    
    if (cargaMultas) cargaMultas.style.display = 'table-row';
    if (cargaMultasMobile) cargaMultasMobile.style.display = 'block';
}

function ocultarCarga() {
    const cargaMultas = document.getElementById('carga-multas');
    const cargaMultasMobile = document.getElementById('carga-multas-mobile');
    
    if (cargaMultas) cargaMultas.style.display = 'none';
    if (cargaMultasMobile) cargaMultasMobile.style.display = 'none';
}

async function cargarMultas() {
    try {
        // Mostrar indicador de carga
        mostrarCarga();
        
        // Construir URL con parámetros
        const params = new URLSearchParams({
            accion: 'obtener',
            estado: filtroActual,
            termino: terminoBusqueda,
            pagina: paginaActual,
            elementosPorPagina: elementosPorPagina
        });

        const response = await fetch(`${window.CONTEXT_PATH}/mis-multas?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        multasData = data.multas || [];
        totalPaginas = data.totalPaginas || 1;
        
        actualizarTabla();
        actualizarContadores(data.total || 0);
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error al cargar multas:', error);
        mostrarError('Error al cargar las multas: ' + error.message);
    } finally {
        ocultarCarga();
    }
}

function mostrarCarga(mostrar) {
    const filaCarga = document.getElementById('carga-multas');
    const cargaMobile = document.getElementById('carga-multas-mobile');
    
    if (filaCarga) {
        filaCarga.style.display = mostrar ? '' : 'none';
    }
    if (cargaMobile) {
        cargaMobile.style.display = mostrar ? 'block' : 'none';
    }
}

function actualizarTabla() {
    const tbody = document.getElementById('tabla-multas');
    const mobileContainer = document.getElementById('multas-mobile');
    
    if (!tbody || !mobileContainer) return;

    // Limpiar tabla excepto fila de carga
    const filas = tbody.querySelectorAll('tr:not(#carga-multas)');
    filas.forEach(fila => fila.remove());
    
    // Limpiar contenedor móvil excepto indicador de carga
    const cardsMobile = mobileContainer.querySelectorAll('.multa-card');
    cardsMobile.forEach(card => card.remove());

    if (multasData.length === 0) {
        mostrarFilaVacia();
        mostrarCardsVacios();
        return;
    }

    // Crear filas de datos para desktop
    multasData.forEach(multa => {
        const fila = crearFilaMulta(multa);
        tbody.appendChild(fila);
    });
    
    // Crear cards para móvil
    multasData.forEach(multa => {
        const card = crearCardMulta(multa);
        mobileContainer.appendChild(card);
    });
}

function crearFilaMulta(multa) {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';

    const fechaPrestamo = formatearFecha(multa.fechaEntrega || multa.fechaPrestamo);
    const fechaDevolucion = formatearFecha(multa.fechaDevolucionProgramada || multa.fechaDevolucionEsperada);
    const montoMulta = formatearMoneda(multa.multa);
    const estadoPago = multa.pagado ? 'Pagada' : 'Pendiente';
    const claseEstado = multa.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    fila.innerHTML = `
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
                <div class="text-sm font-medium text-gray-900">${escapeHtml(multa.libroTitulo || multa.libroNombre || 'N/A')}</div>
                <div class="text-sm text-gray-500">
                    <span>Por: ${escapeHtml(multa.libroAutor || 'N/A')}</span>
                    <br>
                    <span class="text-xs">ISBN: ${escapeHtml(multa.libroIsbn || 'N/A')}</span>
                </div>
            </div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${fechaPrestamo}</div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${fechaDevolucion}</div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${montoMulta}</div>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${claseEstado}">
                ${estadoPago}
            </span>
        </td>
        <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
            <button onclick="verDetalleMulta(${multa.id})" 
                    class="bg-slate-700 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded transition" 
                    title="Ver detalles">
                <i class="fas fa-info-circle text-sm sm:text-base"></i>
            </button>
        </td>
    `;

    return fila;
}

function crearCardMulta(multa) {
    const card = document.createElement('div');
    card.className = 'multa-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm';

    const fechaPrestamo = formatearFecha(multa.fechaEntrega || multa.fechaPrestamo);
    const fechaDevolucion = formatearFecha(multa.fechaDevolucionProgramada || multa.fechaDevolucionEsperada);
    const montoMulta = formatearMoneda(multa.multa);
    const estadoPago = multa.pagado ? 'Pagada' : 'Pendiente';
    const claseEstado = multa.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    card.innerHTML = `
        <div class="space-y-3">
            <!-- Título del libro -->
            <div class="border-b border-gray-100 pb-2">
                <h3 class="font-medium text-gray-900 text-sm">${escapeHtml(multa.libroTitulo || multa.libroNombre || 'N/A')}</h3>
                <p class="text-xs text-gray-500 mt-1">
                    Por: ${escapeHtml(multa.libroAutor || 'N/A')} • ISBN: ${escapeHtml(multa.libroIsbn || 'N/A')}
                </p>
            </div>
            
            <!-- Información de fechas y multa -->
            <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <span class="text-gray-500 block">Fecha Préstamo</span>
                    <span class="text-gray-900 font-medium">${fechaPrestamo}</span>
                </div>
                <div>
                    <span class="text-gray-500 block">Fecha Devolución</span>
                    <span class="text-gray-900 font-medium">${fechaDevolucion}</span>
                </div>
            </div>
            
            <!-- Multa y estado -->
            <div class="flex justify-between items-center pt-2">
                <div>
                    <span class="text-gray-500 text-xs block">Multa</span>
                    <span class="text-gray-900 font-bold text-sm">${montoMulta}</span>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${claseEstado}">
                    ${estadoPago}
                </span>
            </div>
            
            <!-- Botón ver detalles -->
            <div class="pt-2 border-t border-gray-100">
                <button onclick="verDetalleMulta(${multa.id})" 
                        class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-xs font-medium transition-colors duration-200 flex items-center justify-center">
                    <i class="fas fa-info-circle mr-2"></i>Ver Detalles
                </button>
            </div>
        </div>
    `;

    return card;
}

function mostrarCardsVacios() {
    const mobileContainer = document.getElementById('multas-mobile');
    if (!mobileContainer) return;

    const cardVacio = document.createElement('div');
    cardVacio.className = 'text-center py-8 text-gray-500';
    cardVacio.innerHTML = `
        <div class="flex flex-col items-center">
            <i class="fas fa-money-bill-wave text-4xl text-gray-300 mb-3"></i>
            <p class="text-lg font-medium">No se encontraron multas</p>
            <p class="text-sm">No tienes multas ${filtroActual === 'todas' ? '' : filtroActual} en este momento.</p>
        </div>
    `;
    mobileContainer.appendChild(cardVacio);
}

function mostrarFilaVacia() {
    const tbody = document.getElementById('tabla-multas');
    if (!tbody) return;

    const filaVacia = document.createElement('tr');
    filaVacia.innerHTML = `
        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center">
                <i class="fas fa-money-bill-wave text-4xl text-gray-300 mb-3"></i>
                <p class="text-lg font-medium">No se encontraron multas</p>
                <p class="text-sm">No tienes multas ${filtroActual === 'todas' ? '' : filtroActual} en este momento.</p>
            </div>
        </td>
    `;
    tbody.appendChild(filaVacia);
}

function actualizarContadores(total) {
    const elementoTotal = document.getElementById('total-multas');
    if (elementoTotal) {
        elementoTotal.textContent = total;
    }
    
    const elementoPaginaActual = document.getElementById('pagina-actual-multas');
    if (elementoPaginaActual) {
        elementoPaginaActual.textContent = paginaActual;
    }
    
    const elementoTotalPaginas = document.getElementById('total-paginas-multas');
    if (elementoTotalPaginas) {
        elementoTotalPaginas.textContent = totalPaginas;
    }
}

function actualizarPaginacion() {
    const contenedorPaginacion = document.getElementById('paginacion-multas');
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
        cargarMultas();
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
    cargarMultas();
}

// Función para ver detalles de la multa
function verDetalleMulta(id) {
    const multa = multasData.find(m => m.id === id);
    if (!multa) {
        mostrarError('No se encontró la multa');
        return;
    }
    
    // Llenar información del libro
    document.getElementById('detalle-libro-titulo').textContent = multa.libroTitulo || multa.libroNombre || 'N/A';
    document.getElementById('detalle-libro-autor').textContent = multa.libroAutor || 'N/A';
    document.getElementById('detalle-libro-isbn').textContent = multa.libroIsbn || 'N/A';
    
    // Llenar fechas
    document.getElementById('detalle-fecha-prestamo').textContent = formatearFecha(multa.fechaEntrega || multa.fechaPrestamo);
    document.getElementById('detalle-fecha-devolucion-esperada').textContent = formatearFecha(multa.fechaDevolucionProgramada || multa.fechaDevolucionEsperada);
    
    // Fecha de devolución real
    const fechaDevReal = multa.fechaDevolucionReal || multa.fechaDevolucion;
    if (fechaDevReal) {
        document.getElementById('detalle-fecha-devolucion-real').textContent = formatearFecha(fechaDevReal);
    } else {
        document.getElementById('detalle-fecha-devolucion-real').textContent = 'Pendiente';
    }
    
    // Multa
    document.getElementById('detalle-multa').textContent = formatearMoneda(multa.multa);
    
    // Estado de pago
    const estadoPago = multa.pagado ? 'Pagada' : 'Pendiente';
    const claseEstado = multa.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const estadoElement = document.getElementById('detalle-estado-pago');
    estadoElement.textContent = estadoPago;
    estadoElement.className = `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${claseEstado}`;
    
    // Calcular días de retraso
    const fechaPrestamo = new Date(multa.fechaEntrega || multa.fechaPrestamo);
    const fechaDevEsperada = new Date(multa.fechaDevolucionProgramada || multa.fechaDevolucionEsperada);
    const fechaDevRealDate = fechaDevReal ? new Date(fechaDevReal) : new Date();
    const diasRetraso = Math.max(0, Math.floor((fechaDevRealDate - fechaDevEsperada) / (1000 * 60 * 60 * 24)));
    document.getElementById('detalle-dias-retraso').textContent = `${diasRetraso} día${diasRetraso !== 1 ? 's' : ''}`;
    
    // Observaciones (si existen)
    const observaciones = multa.observacionesEntrega || multa.observacionesDevolucion;
    const containerObservaciones = document.getElementById('detalle-observaciones-container');
    if (observaciones) {
        document.getElementById('detalle-observaciones').textContent = observaciones;
        containerObservaciones.classList.remove('hidden');
    } else {
        containerObservaciones.classList.add('hidden');
    }
    
    // Mostrar modal
    document.getElementById('modalDetalleMulta').classList.remove('hidden');
}

function cerrarModalDetalle() {
    document.getElementById('modalDetalleMulta').classList.add('hidden');
}

// Exportar funciones para uso global si es necesario
window.cargarMultas = cargarMultas;
window.actualizarDatos = actualizarDatos;
window.cambiarPagina = cambiarPagina;
window.cambiarPagina = cambiarPagina;
window.verDetalleMulta = verDetalleMulta;
window.cerrarModalDetalle = cerrarModalDetalle;