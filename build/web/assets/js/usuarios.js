// Variables globales
let paginaActual = 1;
let roles = [];
let modoEdicion = false;
let terminoBusqueda = ''; // Término de búsqueda actual

// Cargar roles al iniciar
async function cargarRoles() {
    try {
        const response = await fetch(getContextPath() + '/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'accion=obtenerRoles'
        });

        const data = await response.json();
        
        if (data.success) {
            roles = data.roles;
            const select = document.getElementById('usuario-rol');
            select.innerHTML = '<option value="">Seleccione un rol</option>';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.rol;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarAlerta('Error al cargar roles', 'error');
    }
}

// Cargar usuarios con búsqueda opcional
async function cargarUsuarios(pagina, busqueda = '') {
    paginaActual = pagina;
    terminoBusqueda = busqueda;
    
    try {
        let body = 'accion=listar&pagina=' + pagina;
        if (busqueda && busqueda.trim()) {
            body += '&busqueda=' + encodeURIComponent(busqueda.trim());
        }
        
        const response = await fetch(getContextPath() + '/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        const data = await response.json();
        
        if (data.success) {
            mostrarUsuarios(data.usuarios);
            mostrarPaginacion(data.paginaActual, data.totalPaginas, data.totalUsuarios);
        } else {
            mostrarAlerta('Error al cargar usuarios', 'error');
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

// Filtrar usuarios en tiempo real (con debounce)
let timeoutBusqueda;
function filtrarUsuarios(termino) {
    clearTimeout(timeoutBusqueda);
    
    timeoutBusqueda = setTimeout(() => {
        cargarUsuarios(1, termino);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
}

// Inicializar campo de búsqueda
function initBusqueda() {
    const campoBusqueda = document.getElementById('buscar-usuario');
    if (campoBusqueda) {
        campoBusqueda.addEventListener('input', function(e) {
            filtrarUsuarios(e.target.value);
        });
    }
}

// Mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');
    
    if (usuarios.length === 0) {
        const mensaje = terminoBusqueda 
            ? '<i class="fas fa-search text-4xl mb-2"></i>' +
              '<p class="text-lg">No se encontraron usuarios con "' + escapeHtml(terminoBusqueda) + '"</p>' +
              '<p class="text-sm text-gray-400 mt-2">Intenta con otro término de búsqueda</p>'
            : '<i class="fas fa-users text-4xl mb-2"></i>' +
              '<p class="text-lg">No hay usuarios registrados</p>';
        
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">' +
            mensaje + '</td></tr>';
        return;
    }
    console.log(usuarios)

    tbody.innerHTML = usuarios.map(usuario => {
        const rolClass = usuario.nombreRol === 'Administrador' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800';
        
        const estadoClass = usuario.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        const estadoTexto = usuario.activo ? 'Activo' : 'Inactivo';
        const estadoIcono = usuario.activo ? 'check-circle' : 'times-circle';
        
        const botonEstado = usuario.activo
            ? '<button onclick="cambiarEstado(' + usuario.id + ', false, \'' + escapeHtml(usuario.usuario) + '\')" ' +
              'class="text-orange-600 hover:text-orange-900 transition duration-150" title="Desactivar usuario">' +
              '<i class="fas fa-ban text-xl"></i></button>'
            : '<button onclick="cambiarEstado(' + usuario.id + ', true, \'' + escapeHtml(usuario.usuario) + '\')" ' +
              'class="text-green-600 hover:text-green-900 transition duration-150" title="Activar usuario">' +
              '<i class="fas fa-check-circle text-xl"></i></button>';
        
        return '<tr class="hover:bg-gray-50 transition duration-150' + (usuario.activo ? '' : ' opacity-60') + '">' +
            '<td class="px-6 py-4 whitespace-nowrap">' +
                '<div class="flex items-center">' +
                    '<div class="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">' +
                        '<i class="fas fa-user text-slate-600"></i>' +
                    '</div>' +
                    '<div class="ml-3">' +
                        '<div class="text-sm font-medium text-gray-900">' + escapeHtml(usuario.usuario) + '</div>' +
                        '<div class="text-xs text-gray-500">' +
                            '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ' + estadoClass + '">' +
                                '<i class="fas fa-' + estadoIcono + ' mr-1"></i>' + estadoTexto +
                            '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' +
                '<div class="text-sm text-gray-900">' + escapeHtml(usuario.nombre) + ' ' + escapeHtml(usuario.apellido) + '</div>' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' +
                '<div class="text-sm text-gray-600">' + (usuario.email ? escapeHtml(usuario.email) : '-') + '</div>' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' +
                '<div class="text-sm text-gray-600">' + (usuario.telefono ? escapeHtml(usuario.telefono) : '-') + '</div>' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' +
                '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + rolClass + '">' +
                    escapeHtml(usuario.nombreRol) +
                '</span>' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">' +
                '<button onclick="abrirModalCarnet(' + usuario.id + ', \'' + escapeHtml(usuario.nombre + ' ' + usuario.apellido) + '\', \'' + 
                        escapeHtml(usuario.usuario) + '\', \'' + escapeHtml(usuario.email || '') + '\', \'' + 
                        escapeHtml(usuario.telefono || '') + '\', \'' + escapeHtml(usuario.nombreRol) + '\')" ' +
                        'class="text-purple-600 hover:text-purple-900 transition duration-150" title="Generar/Ver Carnet">' +
                    '<i class="fas fa-id-card text-xl"></i>' +
                '</button>' +
                '<button onclick=\'editarUsuario(' + JSON.stringify(usuario) + ')\' ' +
                        'class="text-blue-600 hover:text-blue-900 transition duration-150" title="Editar usuario">' +
                    '<i class="fas fa-edit text-xl"></i>' +
                '</button>' +
                botonEstado +
            '</td>' +
        '</tr>';
    }).join('');
}

// Mostrar paginación
function mostrarPaginacion(paginaActual, totalPaginas, totalUsuarios) {
    const inicio = (paginaActual - 1) * 10 + 1;
    const fin = Math.min(paginaActual * 10, totalUsuarios);
    
    document.getElementById('info-registros').textContent = 
        inicio + ' - ' + fin + ' de ' + totalUsuarios + ' usuarios';

    const contenedor = document.getElementById('botones-paginacion');
    let botones = '';

    // Botón anterior
    if (paginaActual > 1) {
        botones += '<button onclick="cargarUsuarios(' + (paginaActual - 1) + ', \'' + escapeHtml(terminoBusqueda) + '\')" ' +
                'class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150">' +
                '<i class="fas fa-chevron-left"></i>' +
            '</button>';
    }

    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            const esActual = i === paginaActual;
            const claseBoton = esActual 
                ? 'bg-slate-700 text-white border-slate-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50';
            
            botones += '<button onclick="cargarUsuarios(' + i + ', \'' + escapeHtml(terminoBusqueda) + '\')" ' +
                    'class="px-3 py-1 border rounded-md text-sm font-medium transition duration-150 ' + claseBoton + '">' +
                    i +
                '</button>';
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            botones += '<span class="px-2 text-gray-500">...</span>';
        }
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        botones += '<button onclick="cargarUsuarios(' + (paginaActual + 1) + ', \'' + escapeHtml(terminoBusqueda) + '\')" ' +
                'class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150">' +
                '<i class="fas fa-chevron-right"></i>' +
            '</button>';
    }

    contenedor.innerHTML = botones;
}

// Abrir modal para crear
function abrirModalCrear() {
    modoEdicion = false;
    document.getElementById('modal-titulo').innerHTML = 
        '<i class="fas fa-user-plus text-slate-600 mr-2"></i>Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('campo-contrasena').style.display = 'block';
    document.getElementById('usuario-contrasena').required = true;
    document.getElementById('required-contrasena').classList.remove('hidden');
    document.getElementById('texto-opcional').classList.add('hidden');
    document.getElementById('usuario-usuario').disabled = false;
    document.getElementById('modalUsuario').classList.remove('hidden');
}

// Editar usuario
function editarUsuario(usuario) {
    modoEdicion = true;
    document.getElementById('modal-titulo').innerHTML = 
        '<i class="fas fa-user-edit text-slate-600 mr-2"></i>Editar Usuario';
    
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuario-usuario').value = usuario.usuario;
    document.getElementById('usuario-nombre').value = usuario.nombre;
    document.getElementById('usuario-apellido').value = usuario.apellido;
    document.getElementById('usuario-email').value = usuario.email || '';
    document.getElementById('usuario-telefono').value = usuario.telefono || '';
    document.getElementById('usuario-direccion').value = usuario.direccion || '';
    document.getElementById('usuario-rol').value = usuario.idRol;
    
    // Mostrar campo de contraseña pero hacerlo opcional
    document.getElementById('campo-contrasena').style.display = 'block';
    document.getElementById('usuario-contrasena').value = '';
    document.getElementById('usuario-contrasena').required = false;
    document.getElementById('required-contrasena').classList.add('hidden');
    document.getElementById('texto-opcional').classList.remove('hidden');
    document.getElementById('usuario-usuario').disabled = true;
    
    document.getElementById('modalUsuario').classList.remove('hidden');
}

// Cambiar estado de usuario (activar/desactivar)
async function cambiarEstado(id, nuevoEstado, usuario) {
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea ' + accion + ' al usuario "' + usuario + '"?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#475569',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Sí, ' + accion,
        cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(getContextPath() + '/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'accion=cambiarEstado&id=' + id + '&activo=' + nuevoEstado
        });

        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: data.mensaje,
                confirmButtonColor: '#475569'
            });
            cargarUsuarios(paginaActual, terminoBusqueda);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.mensaje || 'Error al cambiar estado del usuario',
                confirmButtonColor: '#475569'
            });
        }
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error de conexión',
            confirmButtonColor: '#475569'
        });
    }
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modalUsuario').classList.add('hidden');
    document.getElementById('formUsuario').reset();
}

// Manejar envío del formulario
function initFormulario() {
    document.getElementById('formUsuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const accion = modoEdicion ? 'actualizar' : 'crear';
        formData.append('accion', accion);

        const btnGuardar = document.getElementById('btn-guardar');
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

        try {
            const response = await fetch(getContextPath() + '/usuarios', {
                method: 'POST',
                body: new URLSearchParams(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                mostrarAlerta(data.mensaje, 'success');
                cerrarModal();
                cargarUsuarios(paginaActual, terminoBusqueda);
            } else {
                mostrarAlerta(data.mensaje || 'Error al guardar usuario', 'error');
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            mostrarAlerta('Error de conexión', 'error');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar';
        }
    });
}

// Mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const color = tipo === 'success' ? 'green' : 'red';
    const icono = tipo === 'success' ? 'check-circle' : 'exclamation-circle';
    
    const alerta = document.createElement('div');
    alerta.className = 'fixed top-20 right-4 bg-' + color + '-100 border border-' + color + '-400 text-' + color + '-700 px-4 py-3 rounded shadow-lg z-50 flex items-center space-x-2';
    alerta.innerHTML = '<i class="fas fa-' + icono + '"></i><span>' + mensaje + '</span>';
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

// Escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Obtener contexto de la aplicación
function getContextPath() {
    return window.CONTEXT_PATH || '';
}

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    initFormulario();
    initBusqueda();
    cargarRoles();
    cargarUsuarios(1);
});
