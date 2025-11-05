let paginaActual = 1;
let totalPaginas = 1;
let busquedaActual = '';
let libroActual = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarLibros();
    
    const inputBuscar = document.getElementById('buscar-libro');
    if (inputBuscar) {
        let tiempoEspera;
        inputBuscar.addEventListener('input', function() {
            clearTimeout(tiempoEspera);
            tiempoEspera = setTimeout(() => {
                busquedaActual = this.value.trim();
                paginaActual = 1;
                cargarLibros();
            }, 300); // Búsqueda más rápida: 300ms
        });
    }
    
    const formLibro = document.getElementById('formLibro');
    if (formLibro) {
        formLibro.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarLibro();
        });
    }
    
    const formStock = document.getElementById('formStock');
    if (formStock) {
        formStock.addEventListener('submit', function(e) {
            e.preventDefault();
            actualizarStock();
        });
    }
});

function cargarLibros() {
    const tbody = document.getElementById('tabla-libros');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-3 sm:px-6 py-12 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl mb-2"></i>
                <p class="text-sm">Cargando libros...</p>
            </td>
        </tr>
    `;
    
    let url = `${window.CONTEXT_PATH}/libros?accion=listar&pagina=${paginaActual}`;
    if (busquedaActual) {
        url += `&busqueda=${encodeURIComponent(busquedaActual)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarLibros(data.libros);
                totalPaginas = data.totalPaginas;
                actualizarPaginacion(data.totalRegistros, data.registroInicio, data.registroFin);
            } else {
                mostrarError(data.message || 'Error al cargar libros');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                            <i class="fas fa-exclamation-circle text-3xl mb-2 text-red-500"></i>
                            <p>Error al cargar los libros</p>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar libros');
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-exclamation-triangle text-3xl mb-2 text-yellow-500"></i>
                        <p>Error de conexión</p>
                    </td>
                </tr>
            `;
        });
}

function renderizarLibros(libros) {
    const tbody = document.getElementById('tabla-libros');
    
    if (!libros || libros.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-book text-3xl mb-2"></i>
                    <p>No se encontraron libros</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = libros.map(libro => {
        const stockBadge = libro.stockDisponible === 0 
            ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>'
            : libro.stockDisponible < 5
            ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Bajo</span>'
            : '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-3 sm:px-6 py-4">
                    <div class="flex items-center">
                        <div class="ml-0">
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(libro.nombre)}</div>
                            <div class="text-xs text-gray-500 lg:hidden">
                                <span class="font-medium">Autor:</span> ${escapeHtml(libro.autor)}
                            </div>
                            <div class="text-xs text-gray-500 md:hidden mt-1">
                                <span class="font-medium">ISBN:</span> ${escapeHtml(libro.isbn)}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <div class="text-sm text-gray-900">${escapeHtml(libro.autor)}</div>
                    ${libro.editorial ? `<div class="text-xs text-gray-500">${escapeHtml(libro.editorial)}</div>` : ''}
                </td>
                <td class="px-3 sm:px-6 py-4 hidden md:table-cell">
                    <div class="text-sm text-gray-900 font-mono">${escapeHtml(libro.isbn)}</div>
                    ${libro.anioPublicacion ? `<div class="text-xs text-gray-500">Año: ${libro.anioPublicacion}</div>` : ''}
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${libro.stockDisponible} / ${libro.stock}
                    </div>
                    <div class="mt-1">${stockBadge}</div>
                </td>
                <td class="px-3 sm:px-6 py-4">
                    <div class="flex flex-wrap gap-1 sm:gap-2">
                        <button onclick="abrirModalEditar(${libro.id})" 
                            class="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded hover:bg-blue-50 transition" 
                            title="Editar">
                            <i class="fas fa-edit text-sm sm:text-xl"></i>
                        </button>
                        <button onclick="abrirModalStock(${libro.id})" 
                            class="text-green-600 hover:text-green-800 p-1.5 sm:p-2 rounded hover:bg-green-50 transition" 
                            title="Stock">
                            <i class="fas fa-boxes text-sm sm:text-xl"></i>
                        </button>
                        <button onclick="generarCodigoBarras('${escapeHtml(libro.isbn)}')" 
                            class="text-purple-600 hover:text-purple-800 p-1.5 sm:p-2 rounded hover:bg-purple-50 transition" 
                            title="Código de Barras">
                            <i class="fas fa-barcode text-sm sm:text-xl"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarPaginacion(total, inicio, fin) {
    const infoRegistros = document.getElementById('info-registros');
    const botonesPaginacion = document.getElementById('botones-paginacion');
    
    if (total === 0) {
        infoRegistros.textContent = 'No hay registros';
        botonesPaginacion.innerHTML = '';
        return;
    }
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} registros`;
    
    let html = '';
    
    // Botón anterior
    html += `
        <button onclick="cambiarPagina(${paginaActual - 1})" 
            ${paginaActual === 1 ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300 transition duration-200">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Páginas
    const maxBotones = 5;
    let inicio_pag = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin_pag = Math.min(totalPaginas, inicio_pag + maxBotones - 1);
    
    if (fin_pag - inicio_pag < maxBotones - 1) {
        inicio_pag = Math.max(1, fin_pag - maxBotones + 1);
    }
    
    if (inicio_pag > 1) {
        html += `
            <button onclick="cambiarPagina(1)" 
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
            <button onclick="cambiarPagina(${i})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${i === paginaActual ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
                ${i}
            </button>
        `;
    }
    
    if (fin_pag < totalPaginas) {
        if (fin_pag < totalPaginas - 1) {
            html += '<span class="px-2 py-1 text-gray-500">...</span>';
        }
        html += `
            <button onclick="cambiarPagina(${totalPaginas})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                ${totalPaginas}
            </button>
        `;
    }
    
    // Botón siguiente
    html += `
        <button onclick="cambiarPagina(${paginaActual + 1})" 
            ${paginaActual === totalPaginas ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPagina(pagina) {
    if (pagina < 1 || pagina > totalPaginas || pagina === paginaActual) return;
    paginaActual = pagina;
    cargarLibros();
}

function abrirModalCrear() {
    document.getElementById('modal-titulo').innerHTML = '<i class="fas fa-book text-slate-600 mr-2"></i>Nuevo Libro';
    document.getElementById('formLibro').reset();
    document.getElementById('libro-id').value = '';
    const campoStock = document.getElementById('campo-stock');
    const inputStock = document.getElementById('libro-stock');
    campoStock.style.display = 'block';
    inputStock.setAttribute('required', 'required');
    document.getElementById('modalLibro').classList.remove('hidden');
}

function abrirModalEditar(id) {
    fetch(`${window.CONTEXT_PATH}/libros?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const libro = data.libro;
                document.getElementById('modal-titulo').innerHTML = '<i class="fas fa-edit text-slate-600 mr-2"></i>Editar Libro';
                document.getElementById('libro-id').value = libro.id;
                document.getElementById('libro-nombre').value = libro.nombre;
                document.getElementById('libro-autor').value = libro.autor;
                document.getElementById('libro-isbn').value = libro.isbn;
                document.getElementById('libro-editorial').value = libro.editorial || '';
                document.getElementById('libro-anio').value = libro.anioPublicacion || '';
                document.getElementById('libro-genero').value = libro.genero || '';
                document.getElementById('libro-ubicacion').value = libro.ubicacion || '';
                document.getElementById('libro-descripcion').value = libro.descripcion || '';
                // Ocultar campo stock y quitar required al editar
                const campoStock = document.getElementById('campo-stock');
                const inputStock = document.getElementById('libro-stock');
                campoStock.style.display = 'none';
                inputStock.removeAttribute('required');
                document.getElementById('modalLibro').classList.remove('hidden');
            } else {
                mostrarError(data.message || 'Error al cargar el libro');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function cerrarModal() {
    document.getElementById('modalLibro').classList.add('hidden');
    document.getElementById('formLibro').reset();
}

function guardarLibro() {
    const form = document.getElementById('formLibro');
    const id = document.getElementById('libro-id').value;
    
    // Crear URLSearchParams para enviar como application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('accion', id ? 'actualizar' : 'crear');
    
    // Agregar todos los campos del formulario
    const formElements = form.elements;
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.name !== 'accion') {
            formData.append(element.name, element.value || '');
        }
    }
    
    fetch(`${window.CONTEXT_PATH}/libros`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito(data.message || (id ? 'Libro actualizado' : 'Libro creado'));
            cerrarModal();
            cargarLibros();
        } else {
            mostrarError(data.message || 'Error al guardar');
        }
    })
    .catch(error => {
        console.error('Error completo:', error);
        mostrarError('Error de conexión');
    });
}

function abrirModalStock(id) {
    fetch(`${window.CONTEXT_PATH}/libros?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const libro = data.libro;
                document.getElementById('stock-libro-id').value = libro.id;
                document.getElementById('stock-libro-nombre').textContent = libro.nombre;
                document.getElementById('stock-actual').value = libro.stock;
                document.getElementById('stock-disponible-actual').value = libro.stockDisponible;
                document.getElementById('stock-total-actual').textContent = libro.stock;
                document.getElementById('stock-disponible-mostrar').textContent = libro.stockDisponible;
                document.getElementById('stock-ajuste').value = '';
                document.getElementById('modalStock').classList.remove('hidden');
            } else {
                mostrarError(data.message || 'Error al cargar el libro');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function cerrarModalStock() {
    document.getElementById('modalStock').classList.add('hidden');
    document.getElementById('formStock').reset();
}

function actualizarStock() {
    const id = document.getElementById('stock-libro-id').value;
    const stockActual = parseInt(document.getElementById('stock-actual').value);
    const stockDisponibleActual = parseInt(document.getElementById('stock-disponible-actual').value);
    const ajuste = parseInt(document.getElementById('stock-ajuste').value);
    
    if (isNaN(ajuste) || ajuste === 0) {
        mostrarError('Ingresa una cantidad válida diferente de cero');
        return;
    }
    
    const nuevoStock = stockActual + ajuste;
    const nuevoStockDisponible = stockDisponibleActual + ajuste;
    
    if (nuevoStock < 0) {
        mostrarError('El stock total no puede ser negativo');
        return;
    }
    
    if (nuevoStockDisponible < 0) {
        mostrarError('El stock disponible no puede ser negativo. Hay libros prestados.');
        return;
    }
    
    const formData = new URLSearchParams();
    formData.append('accion', 'actualizarStock');
    formData.append('id', id);
    formData.append('stock', nuevoStock);
    formData.append('stockDisponible', nuevoStockDisponible);
    
    fetch(`${window.CONTEXT_PATH}/libros`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito(data.message || 'Stock actualizado');
            cerrarModalStock();
            cargarLibros();
        } else {
            mostrarError(data.message || 'Error al actualizar stock');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    });
}

function generarISBN() {
    fetch(`${window.CONTEXT_PATH}/libros?accion=generarIsbn`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('libro-isbn').value = data.isbn;
                mostrarExito('ISBN generado correctamente');
            } else {
                mostrarError(data.message || 'Error al generar ISBN');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión');
        });
}

function generarCodigoBarras(isbn) {
    document.getElementById('isbn-codigo').textContent = isbn;
    
    try {
        JsBarcode("#codigo-barras-isbn", isbn, {
            format: "EAN13",
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 14,
            margin: 10
        });
        document.getElementById('modalISBN').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al generar código de barras');
    }
}

function cerrarModalISBN() {
    document.getElementById('modalISBN').classList.add('hidden');
}

function descargarCodigoBarras() {
    const svg = document.getElementById('codigo-barras-isbn');
    const isbn = document.getElementById('isbn-codigo').textContent;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ISBN_${isbn}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            mostrarExito('Código de barras descargado');
        }, 'image/jpeg', 0.95);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function cambiarEstado(id, activo) {
    const accion = activo ? 'activar' : 'desactivar';
    const mensaje = activo ? '¿Activar este libro?' : '¿Desactivar este libro?';
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#334155',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, ' + accion,
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new URLSearchParams();
            formData.append('accion', 'cambiarEstado');
            formData.append('id', id);
            formData.append('activo', activo);
            
            fetch(`${window.CONTEXT_PATH}/libros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: formData.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    mostrarExito(data.message || 'Estado actualizado');
                    cargarLibros();
                } else {
                    mostrarError(data.message || 'Error al cambiar estado');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarError('Error de conexión');
            });
        }
    });
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
