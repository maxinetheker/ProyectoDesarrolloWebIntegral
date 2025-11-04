/**
 * Módulo para gestión de carnets de biblioteca
 * Utiliza JsBarcode para generar códigos de barras
 */

// Obtener contexto de la aplicación
const contextPath = window.CONTEXT_PATH || '';

/**
 * Abre el modal para generar/mostrar carnet
 */
async function abrirModalCarnet(usuarioId, nombreCompleto, usuario, email, telefono, rol) {
    try {
        // Primero verificar si ya tiene carnet
        const response = await fetch(contextPath + '/carnet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'accion=obtener&usuarioId=' + usuarioId
        });

        const data = await response.json();

        if (data.success && data.tiene) {
            // Ya tiene carnet, mostrarlo
            mostrarCarnet(data.usuario, data.codigo, data.fechaCaducidad, data.estaVencido, data.tipo);
        } else {
            // No tiene carnet, mostrar selector de tipo
            mostrarSelectorTipoCarnet(usuarioId);
        }

    } catch (error) {
        console.error('Error al verificar carnet:', error);
        alert('Error al cargar el carnet');
    }
}

/**
 * Muestra el selector de tipo de carnet antes de generar
 */
async function mostrarSelectorTipoCarnet(usuarioId) {
    const { value: tipo } = await Swal.fire({
        title: 'Tipo de Carnet',
        text: 'Seleccione el tipo de carnet a generar:',
        icon: 'question',
        input: 'select',
        inputOptions: {
            'temporal': 'Temporal (1 año)',
            'permanente': 'Permanente'
        },
        inputPlaceholder: 'Seleccione una opción',
        showCancelButton: true,
        confirmButtonText: 'Generar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#475569',
        cancelButtonColor: '#9ca3af',
        inputValidator: (value) => {
            if (!value) {
                return 'Debe seleccionar un tipo de carnet';
            }
        }
    });

    if (tipo) {
        await generarNuevoCarnet(usuarioId, tipo);
    }
}

/**
 * Genera un nuevo carnet
 */
async function generarNuevoCarnet(usuarioId, tipo) {
    try {
        const response = await fetch(contextPath + '/carnet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'accion=generar&usuarioId=' + usuarioId + '&tipo=' + tipo
        });

        const data = await response.json();

        if (data.success) {
            mostrarCarnet(data.usuario, data.codigo, data.fechaCaducidad, false, data.tipo);
        } else {
            alert('Error: ' + data.mensaje);
        }

    } catch (error) {
        console.error('Error al generar carnet:', error);
        alert('Error al generar el carnet');
    }
}

/**
 * Muestra el carnet en el modal
 */
function mostrarCarnet(usuario, codigo, fechaCaducidad, estaVencido, tipo) {
    // Actualizar datos del usuario en el carnet
    document.getElementById('carnet-id').textContent = String(usuario.id).padStart(5, '0');
    document.getElementById('carnet-nombre').textContent = usuario.nombreCompleto;
    document.getElementById('carnet-usuario').textContent = usuario.usuario;
    document.getElementById('carnet-email').textContent = usuario.email;
    document.getElementById('carnet-telefono').textContent = usuario.telefono || 'N/A';
    document.getElementById('carnet-rol').textContent = usuario.rol;
    
    // Formatear y mostrar fecha de caducidad
    if (tipo === 'permanente' || fechaCaducidad === 'permanente') {
        document.getElementById('carnet-vencimiento').textContent = 'Permanente';
    } else {
        const fecha = new Date(fechaCaducidad);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        document.getElementById('carnet-vencimiento').textContent = fechaFormateada;
    }
    
    // Mostrar alerta si está vencido (solo para carnets temporales)
    const alertaVencido = document.getElementById('alerta-vencido');
    if (estaVencido && tipo !== 'permanente') {
        alertaVencido.classList.remove('hidden');
    } else {
        alertaVencido.classList.add('hidden');
    }
    
    // Generar código de barras con JsBarcode
    try {
        JsBarcode('#codigo-barras', codigo, {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 11,
            margin: 5,
            background: '#ffffff',
            lineColor: '#000000'
        });
    } catch (error) {
        console.error('Error al generar código de barras:', error);
        document.getElementById('codigo-barras').style.display = 'none';
    }
    
    // Guardar usuarioId para renovación
    document.getElementById('modal-carnet').setAttribute('data-usuario-id', usuario.id);
    
    // Mostrar modal
    document.getElementById('modal-carnet').classList.remove('hidden');
}

/**
 * Renueva el carnet de un usuario
 */
async function renovarCarnet() {
    const usuarioId = document.getElementById('modal-carnet').getAttribute('data-usuario-id');
    
    if (!usuarioId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el usuario',
            confirmButtonColor: '#475569'
        });
        return;
    }
    
    // Preguntar tipo de carnet antes de renovar
    const { value: tipo } = await Swal.fire({
        title: 'Renovar Carnet',
        text: 'Seleccione el tipo de carnet:',
        icon: 'question',
        input: 'select',
        inputOptions: {
            'temporal': 'Temporal (1 año)',
            'permanente': 'Permanente'
        },
        inputPlaceholder: 'Seleccione una opción',
        showCancelButton: true,
        confirmButtonText: 'Renovar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#9ca3af',
        inputValidator: (value) => {
            if (!value) {
                return 'Debe seleccionar un tipo de carnet';
            }
        }
    });
    
    if (!tipo) {
        return; // Usuario canceló
    }
    
    try {
        const response = await fetch(contextPath + '/carnet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'accion=renovar&usuarioId=' + usuarioId + '&tipo=' + tipo
        });

        const data = await response.json();

        if (data.success) {
            // Actualizar la vista con el nuevo carnet
            mostrarCarnet(data.usuario, data.codigo, data.fechaCaducidad, false, data.tipo);
            
            Swal.fire({
                icon: 'success',
                title: 'Carnet Renovado',
                text: 'El carnet ha sido renovado exitosamente',
                confirmButtonColor: '#475569'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.mensaje,
                confirmButtonColor: '#475569'
            });
        }

    } catch (error) {
        console.error('Error al renovar carnet:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al renovar el carnet',
            confirmButtonColor: '#475569'
        });
    }
}

/**
 * Cierra el modal del carnet
 */
function cerrarModalCarnet() {
    document.getElementById('modal-carnet').classList.add('hidden');
}

/**
 * Imprime el carnet
 */
function imprimirCarnet() {
    // Obtener el contenido del carnet
    const carnetContent = document.getElementById('carnet-contenido').innerHTML;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    ventanaImpresion.document.write('<html><head><title>Carnet de Biblioteca</title>');
    ventanaImpresion.document.write('<style>');
    ventanaImpresion.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
    ventanaImpresion.document.write('.carnet { width: 7cm; min-height: 4.5cm; border: 2px solid #334155; padding: 12px; margin: auto; background: white; }');
    ventanaImpresion.document.write('.header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 6px; margin-bottom: 8px; }');
    ventanaImpresion.document.write('.header h2 { margin: 0; font-size: 14px; color: #1e293b; }');
    ventanaImpresion.document.write('.header p { margin: 2px 0; font-size: 10px; color: #475569; }');
    ventanaImpresion.document.write('.datos { margin: 8px 0; }');
    ventanaImpresion.document.write('.dato { margin: 3px 0; font-size: 10px; }');
    ventanaImpresion.document.write('.dato strong { color: #334155; }');
    ventanaImpresion.document.write('.codigo { text-align: center; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 6px; }');
    ventanaImpresion.document.write('.vencimiento { text-align: center; font-size: 9px; color: #475569; margin-top: 4px; }');
    ventanaImpresion.document.write('@media print { body { margin: 0; padding: 0; } .carnet { border: 1px solid #000; } }');
    ventanaImpresion.document.write('</style>');
    ventanaImpresion.document.write('</head><body>');
    ventanaImpresion.document.write('<div class="carnet">' + carnetContent + '</div>');
    ventanaImpresion.document.write('</body></html>');
    
    ventanaImpresion.document.close();
    
    // Esperar a que cargue y luego imprimir
    ventanaImpresion.onload = function() {
        ventanaImpresion.focus();
        ventanaImpresion.print();
    };
}

/**
 * Muestra mensaje de éxito temporal
 */
function mostrarMensajeExito(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    alertDiv.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + mensaje;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(function() {
        alertDiv.remove();
    }, 3000);
}
