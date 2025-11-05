let seccionActual = 'devoluciones-pendientes';

function cambiarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion-prestamo').forEach(s => s.classList.add('hidden'));
    
    // Quitar estilos activos de todos los tabs
    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.classList.remove('border-blue-600', 'text-blue-600', 'border-green-600', 'text-green-600', 
                             'border-yellow-600', 'text-yellow-600', 'border-purple-600', 'text-purple-600');
        tab.classList.add('border-transparent', 'text-gray-600');
    });
    
    // Mostrar sección seleccionada
    const seccionElement = document.getElementById(`seccion-${seccion}`);
    if (seccionElement) {
        seccionElement.classList.remove('hidden');
    }
    
    // Activar tab correspondiente
    const tab = document.getElementById(`tab-${seccion}`);
    if (tab) {
        tab.classList.remove('border-transparent', 'text-gray-600');
        
        switch(seccion) {
            case 'devoluciones-pendientes':
                tab.classList.add('border-blue-600', 'text-blue-600');
                break;
            case 'libros-devueltos':
                tab.classList.add('border-green-600', 'text-green-600');
                break;
            case 'multas-pendientes':
                tab.classList.add('border-yellow-600', 'text-yellow-600');
                break;
            case 'multas-pagadas':
                tab.classList.add('border-purple-600', 'text-purple-600');
                break;
        }
    }
    
    seccionActual = seccion;
    
    // Cargar datos de la sección
    switch(seccion) {
        case 'devoluciones-pendientes':
            if (typeof cargarDevolucionesPendientes === 'function') {
                cargarDevolucionesPendientes();
            }
            break;
        case 'libros-devueltos':
            if (typeof cargarLibrosDevueltos === 'function') {
                cargarLibrosDevueltos();
            }
            break;
        case 'multas-pendientes':
            if (typeof cargarMultasPendientes === 'function') {
                cargarMultasPendientes();
            }
            break;
        case 'multas-pagadas':
            if (typeof cargarMultasPagadas === 'function') {
                cargarMultasPagadas();
            }
            break;
    }
}

function mostrarExito(mensaje) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: mensaje,
        confirmButtonColor: '#334155',
        timer: 2000
    });
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        confirmButtonColor: '#334155'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    // Parsear la fecha correctamente sin conversión de zona horaria
    // Si viene en formato YYYY-MM-DD, parsear manualmente
    if (fechaStr.includes('-') && !fechaStr.includes('T')) {
        const [anio, mes, dia] = fechaStr.split(' ')[0].split('-');
        return `${dia}/${mes}/${anio}`;
    }
    // Si viene como timestamp (YYYY-MM-DD HH:MM:SS), extraer solo la fecha
    if (fechaStr.includes(' ')) {
        const [fechaParte] = fechaStr.split(' ');
        const [anio, mes, dia] = fechaParte.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    // Fallback para otros formatos
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function formatearMoneda(cantidad) {
    if (!cantidad || cantidad === 0) return 'S/. 0.00';
    return 'S/. ' + parseFloat(cantidad).toFixed(2);
}

function diasDesde(fechaStr) {
    if (!fechaStr) return 0;
    // Parsear la fecha correctamente para evitar problemas de timezone
    let fecha;
    if (fechaStr.includes('-') && !fechaStr.includes('T')) {
        const [fechaParte] = fechaStr.split(' ');
        const [anio, mes, dia] = fechaParte.split('-');
        fecha = new Date(anio, mes - 1, dia);
    } else {
        fecha = new Date(fechaStr);
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    const diff = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diff;
}

function diasHasta(fechaStr) {
    if (!fechaStr) return 0;
    // Parsear la fecha correctamente para evitar problemas de timezone
    let fecha;
    if (fechaStr.includes('-') && !fechaStr.includes('T')) {
        const [fechaParte] = fechaStr.split(' ');
        const [anio, mes, dia] = fechaParte.split('-');
        fecha = new Date(anio, mes - 1, dia);
    } else {
        fecha = new Date(fechaStr);
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    const diff = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
    return diff;
}

// Cargar la primera sección al inicio
document.addEventListener('DOMContentLoaded', function() {
    cambiarSeccion('devoluciones-pendientes');
});
