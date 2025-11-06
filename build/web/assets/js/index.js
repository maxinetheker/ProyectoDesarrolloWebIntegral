// Obtener el context path dinámicamente
const CONTEXT_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));

let swiper = null;

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// funcion especifica para scroll a nosotros
function scrollToNosotros() {
    const nosotrosSection = document.getElementById('nosotros');
    if (nosotrosSection) {
        nosotrosSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// funciones para que los enlaces hagan scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cargar libros más prestados
function cargarLibrosMasPrestados() {
    fetch(`${CONTEXT_PATH}/public?accion=librosMasPrestados`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('libros-container');
            
            if (data.success && data.libros && data.libros.length > 0) {
                container.innerHTML = data.libros.map(libro => {
                    const portada = libro.urlPortada || 'assets/images/portadas/portada.jpg';
                    const disponibilidadBadge = libro.stockDisponible > 0 
                        ? `<span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-300">Disponible</span>`
                        : `<span class="px-3 py-1 bg-rose-100 text-rose-800 text-sm font-semibold rounded-full border border-rose-300">Prestado</span>`;
                    
                    return `
                        <div class="swiper-slide">
                            <div class="group bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-gray-200">
                                <div class="relative w-full overflow-hidden bg-gray-50" style="padding-bottom: 140%;">
                                    <img src="${portada}" 
                                         alt="${libro.nombre}" 
                                         class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                         onerror="this.src='assets/images/portadas/portada.jpg'">
                                </div>
                                <div class="p-4 bg-white border-t border-gray-200">
                                    <h3 class="font-semibold text-base text-gray-800 line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors min-h-[3rem]">
                                        ${libro.nombre}
                                    </h3>
                                    <p class="text-sm text-gray-500 line-clamp-1 mb-3">${libro.autor}</p>
                                    <div class="flex items-center justify-between">
                                        ${disponibilidadBadge}
                                        <span class="text-xs text-gray-400">${libro.anioPublicacion || ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                if (swiper) {
                    swiper.update();
                } else {
                    initSwiper();
                }
            } else {
                container.innerHTML = `
                    <div class="swiper-slide">
                        <div class="flex items-center justify-center h-96">
                            <p class="text-gray-500">No hay libros disponibles en este momento</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error al cargar libros:', error);
            document.getElementById('libros-container').innerHTML = `
                <div class="swiper-slide">
                    <div class="flex items-center justify-center h-96">
                        <p class="text-red-500">Error al cargar los libros</p>
                    </div>
                </div>
            `;
        });
}

// Cargar estadísticas
function cargarEstadisticas() {
    fetch(`${CONTEXT_PATH}/public?accion=estadisticas`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('total-libros').textContent = data.totalLibros || 0;
                document.getElementById('usuarios-activos').textContent = data.totalUsuariosActivos || 0;
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
        });
}

// Inicializar Swiper
function initSwiper() {
    swiper = new Swiper('.bookSwiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1280: {
                slidesPerView: 4,
                spaceBetween: 30,
            }
        }
    });
}

// Cargar datos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarLibrosMasPrestados();
    cargarEstadisticas();
});

// agregando animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 1s ease-out; }
    
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .swiper-pagination-bullet {
        background: #475569 !important;
        opacity: 0.4 !important;
    }

    .swiper-pagination-bullet-active {
        background: #1e293b !important;
        opacity: 1 !important;
    }

    .swiper-button-next:after,
    .swiper-button-prev:after {
        font-size: 24px !important;
        font-weight: bold !important;
        color: #475569 !important;
    }
`;
document.head.appendChild(style);
