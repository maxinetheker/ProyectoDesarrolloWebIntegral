

// Obtener contexto de la aplicación
const contextPath = window.CONTEXT_PATH || '';


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
            height: 30,
            displayValue: true,
            fontSize: 9,
            margin: 2,
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
    ventanaImpresion.document.write('* { margin: 0; padding: 0; box-sizing: border-box; }');
    ventanaImpresion.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }');
    ventanaImpresion.document.write('.carnet { width: 10cm; height: 6cm; border: 2px solid #334155; border-radius: 8px; padding: 10px; background: linear-gradient(to bottom right, #f8fafc, white); box-sizing: border-box; display: flex; flex-direction: column; }');
    ventanaImpresion.document.write('.header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 4px; margin-bottom: 4px; flex-shrink: 0; }');
    ventanaImpresion.document.write('.header h2 { margin: 0; font-size: 13px; color: #1e293b; font-weight: bold; }');
    ventanaImpresion.document.write('.header p { margin: 2px 0 0 0; font-size: 10px; color: #475569; }');
    ventanaImpresion.document.write('.datos { margin-bottom: 4px; flex-shrink: 0; }');
    ventanaImpresion.document.write('.datos > div:first-child { text-align: center; margin-bottom: 2px; }');
    ventanaImpresion.document.write('.datos > div:first-child p { font-size: 10px; font-weight: bold; color: #1e293b; }');
    ventanaImpresion.document.write('.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; }');
    ventanaImpresion.document.write('.dato { font-size: 10px; line-height: 1.3; }');
    ventanaImpresion.document.write('.dato.col-span-2 { grid-column: span 2; }');
    ventanaImpresion.document.write('.dato strong { color: #334155; }');
    ventanaImpresion.document.write('.dato span { color: #475569; }');
    ventanaImpresion.document.write('.codigo { border-top: 2px solid #cbd5e1; padding-top: 4px; flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 0; }');
    ventanaImpresion.document.write('.codigo > div { text-align: center; flex-shrink: 0; }');
    ventanaImpresion.document.write('.codigo svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }');
    ventanaImpresion.document.write('.vencimiento { text-align: center; font-size: 9px; color: #475569; margin-top: 2px; flex-shrink: 0; }');
    ventanaImpresion.document.write('.vencimiento strong { color: #334155; }');
    ventanaImpresion.document.write('@media print { body { margin: 0; padding: 0; } .carnet { page-break-inside: avoid; } }');
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
