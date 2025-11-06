// Configuración global
let multasData = [];
let filtroActual = 'todas';
let terminoBusqueda = '';

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
                cargarMultas();
            }, 300);
        });
    }

    // Evento de filtro
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            filtroActual = this.value;
            cargarMultas();
        });
    }
}

async function cargarMultas() {
    try {
        // Mostrar indicador de carga
        mostrarCarga(true);
        
        // Construir URL con parámetros
        const params = new URLSearchParams({
            accion: 'obtener',
            filtro: filtroActual,
            termino: terminoBusqueda
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
        actualizarTabla();
        actualizarContadores(data.total || 0);
        
    } catch (error) {
        console.error('Error al cargar multas:', error);
        mostrarError('Error al cargar las multas: ' + error.message);
    } finally {
        mostrarCarga(false);
    }
}

function mostrarCarga(mostrar) {
    const filaCarga = document.getElementById('carga-multas');
    if (filaCarga) {
        filaCarga.style.display = mostrar ? '' : 'none';
    }
}

function actualizarTabla() {
    const tbody = document.getElementById('tabla-multas');
    if (!tbody) return;

    // Limpiar tabla excepto fila de carga
    const filas = tbody.querySelectorAll('tr:not(#carga-multas)');
    filas.forEach(fila => fila.remove());

    if (multasData.length === 0) {
        mostrarFilaVacia();
        return;
    }

    // Crear filas de datos
    multasData.forEach(multa => {
        const fila = crearFilaMulta(multa);
        tbody.appendChild(fila);
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
    `;

    return fila;
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

// Exportar funciones para uso global si es necesario
window.cargarMultas = cargarMultas;
window.actualizarDatos = actualizarDatos;