// Configuración global
let prestamosData = [];
let filtroActual = 'todos';
let terminoBusqueda = '';

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    cargarPrestamos();
});

function configurarEventos() {
    // Evento de búsqueda
    const campoBusqueda = document.getElementById('buscar-prestamos');
    if (campoBusqueda) {
        let timeoutBusqueda;
        campoBusqueda.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                terminoBusqueda = this.value;
                cargarPrestamos();
            }, 300);
        });
    }

    // Evento de filtro
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            filtroActual = this.value;
            cargarPrestamos();
        });
    }
}

async function cargarPrestamos() {
    try {
        // Mostrar indicador de carga
        mostrarCarga(true);
        
        // Construir URL con parámetros
        const params = new URLSearchParams({
            accion: 'obtener',
            estado: filtroActual,
            termino: terminoBusqueda
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
        actualizarTabla();
        actualizarContadores(data.total || 0);
        
    } catch (error) {
        console.error('Error al cargar préstamos:', error);
        mostrarError('Error al cargar los préstamos: ' + error.message);
    } finally {
        mostrarCarga(false);
    }
}

function mostrarCarga(mostrar) {
    const filaCarga = document.getElementById('carga-prestamos');
    if (filaCarga) {
        filaCarga.style.display = mostrar ? '' : 'none';
    }
}

function actualizarTabla() {
    const tbody = document.getElementById('tabla-prestamos');
    if (!tbody) return;

    // Limpiar tabla excepto fila de carga
    const filas = tbody.querySelectorAll('tr:not(#carga-prestamos)');
    filas.forEach(fila => fila.remove());

    if (prestamosData.length === 0) {
        mostrarFilaVacia();
        return;
    }

    // Crear filas de datos
    prestamosData.forEach(prestamo => {
        const fila = crearFilaPrestamo(prestamo);
        tbody.appendChild(fila);
    });
}

function crearFilaPrestamo(prestamo) {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';

    const fechaPrestamo = formatearFecha(prestamo.fechaEntrega || prestamo.fechaPrestamo);
    const fechaDevolucion = formatearFecha(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada);
    const fechaDevolucionReal = formatearFecha(prestamo.fechaDevolucionReal);
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
    `;

    return fila;
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
    const fechaDevolucion = new Date(prestamo.fechaDevolucionProgramada || prestamo.fechaDevolucionEsperada);
    const fechaActual = new Date();
    const fechaDevReal = prestamo.fechaDevolucionReal ? new Date(prestamo.fechaDevolucionReal) : null;
    
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

function mostrarFilaVacia() {
    const tbody = document.getElementById('tabla-prestamos');
    if (!tbody) return;

    const filaVacia = document.createElement('tr');
    filaVacia.innerHTML = `
        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center">
                <i class="fas fa-book-reader text-4xl text-gray-300 mb-3"></i>
                <p class="text-lg font-medium">No se encontraron préstamos</p>
                <p class="text-sm">No tienes préstamos ${filtroActual === 'todos' ? '' : filtroActual + 's'} en este momento.</p>
            </div>
        </td>
    `;
    tbody.appendChild(filaVacia);
}

function actualizarContadores(total) {
    const elementoTotal = document.getElementById('total-prestamos');
    if (elementoTotal) {
        elementoTotal.textContent = total;
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

// Exportar funciones para uso global si es necesario
window.cargarPrestamos = cargarPrestamos;
window.actualizarDatos = actualizarDatos;