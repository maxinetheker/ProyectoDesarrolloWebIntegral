let paginaActual = 1;
let totalPaginas = 1;
let busquedaActual = '';

document.addEventListener('DOMContentLoaded', function() {
    cargarCatalogo();
    
    const inputBuscar = document.getElementById('buscar-catalogo');
    if (inputBuscar) {
        let timeoutId;
        inputBuscar.addEventListener('input', function(e) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                busquedaActual = e.target.value.trim();
                paginaActual = 1;
                cargarCatalogo();
            }, 300);
        });
    }
});

function cargarCatalogo() {
    const grid = document.getElementById('catalogo-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const paginacion = document.getElementById('paginacion');
    
    grid.innerHTML = '';
    grid.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    paginacion.classList.add('hidden');
    
    let url = `${window.CONTEXT_PATH}/catalogo?accion=listar&pagina=${paginaActual}`;
    if (busquedaActual) {
        url += `&busqueda=${encodeURIComponent(busquedaActual)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingState.classList.add('hidden');
            
            if (data.success && data.libros && data.libros.length > 0) {
                renderizarLibros(data.libros);
                totalPaginas = data.totalPaginas;
                actualizarPaginacion(data.totalRegistros, data.registroInicio, data.registroFin);
                grid.classList.remove('hidden');
                paginacion.classList.remove('hidden');
            } else {
                emptyState.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
        });
}

function renderizarLibros(libros) {
    const grid = document.getElementById('catalogo-grid');
    
    grid.innerHTML = libros.map(libro => {
        const portada = libro.urlPortada || '../assets/images/portadas/portada.jpg';
        const descripcionCorta = libro.descripcion 
            ? (libro.descripcion.length > 120 
                ? libro.descripcion.substring(0, 120) + '...' 
                : libro.descripcion)
            : 'Sin descripción disponible';
        
        const disponibilidadClass = libro.stockDisponible > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
        const disponibilidadText = libro.stockDisponible > 0 
            ? `${libro.stockDisponible} disponible${libro.stockDisponible > 1 ? 's' : ''}`
            : 'No disponible';
        
        return `
            <div class="book-card bg-white rounded-lg shadow-md overflow-hidden" 
                 onclick="verDetalle(${libro.id})">
                <div class="book-image-container">
                    <img src="${window.CONTEXT_PATH}/${portada}" 
                         alt="${escapeHtml(libro.nombre)}" 
                         class="book-image"
                         onerror="this.src='${window.CONTEXT_PATH}/assets/images/portadas/portada.jpg'">
                    
                    <div class="book-overlay">
                        <h3 class="font-bold text-sm sm:text-base line-clamp-2 mb-1">${escapeHtml(libro.nombre)}</h3>
                        <p class="text-xs sm:text-sm text-gray-300 line-clamp-1">${escapeHtml(libro.autor)}</p>
                    </div>
                    
                    <div class="book-hover-info">
                        <h3 class="font-bold text-lg mb-2">${escapeHtml(libro.nombre)}</h3>
                        <p class="text-sm text-gray-300 mb-3">${escapeHtml(libro.autor)}</p>
                        
                        <div class="mb-3">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${disponibilidadClass}">
                                ${disponibilidadText}
                            </span>
                        </div>
                        
                        <p class="text-sm text-gray-300 mb-3 line-clamp-4">${escapeHtml(descripcionCorta)}</p>
                        
                        <div class="text-xs text-gray-400">
                            ${libro.genero ? `<span class="inline-block mr-2"><i class="fas fa-tag mr-1"></i>${escapeHtml(libro.genero)}</span>` : ''}
                            ${libro.anioPublicacion ? `<span class="inline-block"><i class="fas fa-calendar mr-1"></i>${libro.anioPublicacion}</span>` : ''}
                        </div>
                        
                        <div class="mt-4 text-center">
                            <span class="text-white text-sm">
                                <i class="fas fa-hand-pointer mr-1"></i>
                                Click para ver detalles
                            </span>
                        </div>
                    </div>
                </div>
            </div>
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
    
    infoRegistros.textContent = `${inicio} - ${fin} de ${total} libros`;
    
    let html = '';
    
    // Botón anterior
    html += `
        <button onclick="cambiarPagina(${paginaActual - 1})" 
            ${paginaActual === 1 ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-slate-600 hover:text-white'} border border-gray-300 transition duration-200">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Páginas
    const maxBotones = 5;
    let inicioPag = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let finPag = Math.min(totalPaginas, inicioPag + maxBotones - 1);
    
    if (finPag - inicioPag < maxBotones - 1) {
        inicioPag = Math.max(1, finPag - maxBotones + 1);
    }
    
    if (inicioPag > 1) {
        html += `
            <button onclick="cambiarPagina(1)" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-slate-600 hover:text-white border border-gray-300 transition duration-200">
                1
            </button>
        `;
        if (inicioPag > 2) {
            html += '<span class="px-2 text-gray-400">...</span>';
        }
    }
    
    for (let i = inicioPag; i <= finPag; i++) {
        html += `
            <button onclick="cambiarPagina(${i})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${i === paginaActual ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 hover:bg-slate-600 hover:text-white'} border border-gray-300 transition duration-200">
                ${i}
            </button>
        `;
    }
    
    if (finPag < totalPaginas) {
        if (finPag < totalPaginas - 1) {
            html += '<span class="px-2 text-gray-400">...</span>';
        }
        html += `
            <button onclick="cambiarPagina(${totalPaginas})" 
                class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-slate-600 hover:text-white border border-gray-300 transition duration-200">
                ${totalPaginas}
            </button>
        `;
    }
    
    // Botón siguiente
    html += `
        <button onclick="cambiarPagina(${paginaActual + 1})" 
            ${paginaActual === totalPaginas ? 'disabled' : ''} 
            class="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-slate-600 hover:text-white'} border border-gray-300 transition duration-200">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    botonesPaginacion.innerHTML = html;
}

function cambiarPagina(pagina) {
    if (pagina < 1 || pagina > totalPaginas || pagina === paginaActual) return;
    paginaActual = pagina;
    cargarCatalogo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verDetalle(id) {
    fetch(`${window.CONTEXT_PATH}/catalogo?accion=obtener&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.libro) {
                mostrarModal(data.libro);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function mostrarModal(libro) {
    const modal = document.getElementById('modalDetalle');
    const portada = libro.urlPortada || '../assets/images/portadas/portada.jpg';
    
    const imageSrc = `${window.CONTEXT_PATH}/${portada}`;
    const modalImage = document.getElementById('modal-image');
    
    // Set default image first, then try to load the actual image
    modalImage.src = `${window.CONTEXT_PATH}/assets/images/portadas/portada.jpg`;
    
    // Try to load the book's cover
    const img = new Image();
    img.onload = function() {
        modalImage.src = imageSrc;
    };
    img.onerror = function() {
        // Keep the default image if loading fails
        console.log('Failed to load image, using default');
    };
    img.src = imageSrc;
    
    document.getElementById('modal-titulo').textContent = libro.nombre;
    document.getElementById('modal-autor').textContent = libro.autor;
    document.getElementById('modal-isbn').textContent = libro.isbn;
    document.getElementById('modal-editorial').textContent = libro.editorial || 'No especificado';
    document.getElementById('modal-anio').textContent = libro.anioPublicacion || 'No especificado';
    document.getElementById('modal-ubicacion').textContent = libro.ubicacion || 'No especificado';
    document.getElementById('modal-descripcion').textContent = libro.descripcion || 'Sin descripción disponible';
    
    const generoSpan = document.getElementById('modal-genero');
    if (libro.genero) {
        generoSpan.textContent = libro.genero;
        generoSpan.classList.remove('hidden');
    } else {
        generoSpan.classList.add('hidden');
    }
    
    const disponibilidadSpan = document.getElementById('modal-disponibilidad');
    if (libro.stockDisponible > 0) {
        disponibilidadSpan.textContent = `${libro.stockDisponible} disponible${libro.stockDisponible > 1 ? 's' : ''}`;
        disponibilidadSpan.className = 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800';
    } else {
        disponibilidadSpan.textContent = 'No disponible';
        disponibilidadSpan.className = 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800';
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    setTimeout(() => {
        const imageWrapper = document.getElementById('modal-image-wrapper');
        imageWrapper.style.transform = 'scale(1.02)';
        setTimeout(() => {
            imageWrapper.style.transform = 'scale(1)';
        }, 500);
    }, 100);
}

function cerrarModal() {
    const modal = document.getElementById('modalDetalle');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModal();
    }
});

// Close modal on backdrop click
document.getElementById('modalDetalle')?.addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});
