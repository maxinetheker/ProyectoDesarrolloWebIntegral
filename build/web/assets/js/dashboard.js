// Dashboard.js - Gestión de gráficos de estadísticas
let chartsInstances = {
    librosNuevos: null,
    cantidadUsuarios: null,
    librosPrestados: null,
    multasChart: null,
    carnetsGenerados: null,
    librosLeidos: null,
    prestamosDevueltos: null,
    deudasChart: null
};

// Configuración de colores - tonos celestes sobrios y profesionales
const colors = {
    primary: '#475569',        // Gris azulado oscuro
    secondary: '#64748b',      // Gris azulado medio
    celeste1: '#67a3d9',       // Celeste principal
    celeste2: '#7fb3e0',       // Celeste suave
    celeste3: '#96c3e7',       // Celeste claro
    celeste4: '#548bb8',       // Celeste oscuro
    celeste5: '#4a7ba7',       // Celeste profundo
    success: '#10b981',        // Verde éxito
    danger: '#dc2626',         // Rojo
    warning: '#f59e0b',        // Naranja
    gris: '#94a3b8'           // Gris neutro
};

// Función para destruir un gráfico si existe
function destroyChart(chartName) {
    if (chartsInstances[chartName]) {
        chartsInstances[chartName].destroy();
        chartsInstances[chartName] = null;
    }
}

// Función para cargar estadísticas de biblioteca (para admin y bibliotecario)
async function cargarEstadisticasBiblioteca() {
    try {
        const contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));
        const response = await fetch(`${contextPath}/dashboard?action=biblioteca`);
        if (!response.ok) {
            if (response.status === 403) {
                console.log('Acceso denegado a estadísticas de biblioteca');
                return;
            }
            throw new Error('Error al cargar estadísticas de biblioteca');
        }
        
        const data = await response.json();
        
        // Renderizar gráficos
        renderLibrosNuevos(data.librosNuevos);
        renderCantidadUsuarios(data.cantidadUsuarios);
        renderLibrosPrestados(data.librosPrestados);
        renderMultas(data.multas);
        renderCarnetsGenerados(data.carnetsGenerados);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para cargar estadísticas personales (para todos los usuarios)
async function cargarEstadisticasPersonales() {
    try {
        const contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));
        const response = await fetch(`${contextPath}/dashboard?action=personal`);
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas personales');
        }
        
        const data = await response.json();
        
        // Renderizar gráficos personales
        renderLibrosLeidos(data.librosLeidos);
        renderPrestamosDevueltos(data.prestamosDevueltos);
        renderDeudas(data.deudas);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== GRÁFICOS DE BIBLIOTECA ====================

// Gráfico de Libros Nuevos (gráfico creciente)
function renderLibrosNuevos(data) {
    const canvas = document.getElementById('chartLibrosNuevos');
    if (!canvas) return;
    
    destroyChart('librosNuevos');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.librosNuevos = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels.map(formatearMes),
            datasets: [{
                label: 'Libros Nuevos',
                data: data.data,
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalLibrosNuevos');
    if (totalEl) {
        totalEl.textContent = data.total.toLocaleString();
    }
}

// Gráfico de Cantidad de Usuarios (gráfico de líneas)
function renderCantidadUsuarios(data) {
    const canvas = document.getElementById('chartCantidadUsuarios');
    if (!canvas) return;
    
    destroyChart('cantidadUsuarios');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.cantidadUsuarios = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels.map(formatearMes),
            datasets: [{
                label: 'Usuarios Registrados',
                data: data.data,
                borderColor: colors.info,
                backgroundColor: colors.info + '20',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalCantidadUsuarios');
    if (totalEl) {
        totalEl.textContent = data.total.toLocaleString();
    }
}

// Gráfico de Libros Prestados (gráfico de barras)
function renderLibrosPrestados(data) {
    const canvas = document.getElementById('chartLibrosPrestados');
    if (!canvas) return;
    
    destroyChart('librosPrestados');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.librosPrestados = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels.map(formatearMes),
            datasets: [{
                label: 'Préstamos',
                data: data.data,
                backgroundColor: colors.success,
                borderColor: colors.success,
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalLibrosPrestados');
    if (totalEl) {
        totalEl.textContent = data.total.toLocaleString();
    }
}

// Gráfico de Multas (gráfico circular)
function renderMultas(data) {
    const canvas = document.getElementById('chartMultas');
    if (!canvas) return;
    
    destroyChart('multasChart');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.multasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pagadas', 'Pendientes'],
            datasets: [{
                data: [data.cantidadPagadas || 0, data.cantidadPendientes || 0],
                backgroundColor: [colors.success, colors.danger],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalMultas');
    if (totalEl) {
        totalEl.textContent = (data.total || 0).toLocaleString();
    }
}

// Gráfico de Carnets Generados (gráfico de área con picos)
function renderCarnetsGenerados(data) {
    const canvas = document.getElementById('chartCarnetsGenerados');
    if (!canvas) return;
    
    destroyChart('carnetsGenerados');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.carnetsGenerados = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels.map(formatearMes),
            datasets: [{
                label: 'Carnets Generados',
                data: data.data,
                borderColor: colors.purple,
                backgroundColor: colors.purple + '30',
                fill: true,
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: colors.purple,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalCarnetsGenerados');
    if (totalEl) {
        totalEl.textContent = data.total.toLocaleString();
    }
}


// Gráfico de Libros Prestados y Devueltos (acumulativo)
function renderLibrosLeidos(data) {
    const canvas = document.getElementById('chartLibrosLeidos');
    if (!canvas) return;
    
    destroyChart('librosLeidos');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.librosLeidos = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels.map(formatearMes),
            datasets: [
                {
                    label: 'Prestados',
                    data: data.prestadosData,
                    borderColor: '#67a3d9',
                    backgroundColor: 'rgba(103, 163, 217, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                },
                {
                    label: 'Devueltos',
                    data: data.devueltosData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalLibrosLeidos');
    if (totalEl) {
        totalEl.textContent = data.totalPrestados.toLocaleString();
    }
}

// Gráfico de Préstamos vs Devoluciones (gráfico circular)
function renderPrestamosDevueltos(data) {
    const canvas = document.getElementById('chartPrestamosDevueltos');
    if (!canvas) return;
    
    destroyChart('prestamosDevueltos');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.prestamosDevueltos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Prestados', 'Devueltos'],
            datasets: [{
                data: [data.prestados || 0, data.devueltos || 0],
                backgroundColor: [colors.warning, colors.success],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalPrestamosDevueltos');
    if (totalEl) {
        totalEl.textContent = (data.total || 0).toLocaleString();
    }
}

// Gráfico de Deudas 
function renderDeudas(data) {
    const canvas = document.getElementById('chartDeudas');
    if (!canvas) return;
    
    destroyChart('deudasChart');
    
    const ctx = canvas.getContext('2d');
    chartsInstances.deudasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pagada', 'Pendiente'],
            datasets: [{
                label: 'Deuda (S/.)',
                data: [data.pagada || 0, data.pendiente || 0],
                backgroundColor: [colors.success, colors.danger],
                borderColor: [colors.success, colors.danger],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': S/ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
    
    // Actualizar total
    const totalEl = document.getElementById('totalDeudas');
    if (totalEl) {
        totalEl.textContent = 'S/ ' + (data.total || 0).toFixed(2);
    }
}

function formatearMes(mes) {
    if (!mes) return '';
    const [year, month] = mes.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[parseInt(month) - 1]} ${year}`;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const seccionBiblioteca = document.getElementById('seccionEstadisticasBiblioteca');
    const seccionPersonal = document.getElementById('seccionEstadisticasPersonales');
    
    if (seccionBiblioteca) {
        cargarEstadisticasBiblioteca();
    }
    
    if (seccionPersonal) {
        cargarEstadisticasPersonales();
    }
});

// Recargar gráficos cuando la ventana cambia de tamaño
window.addEventListener('resize', function() {
    Object.keys(chartsInstances).forEach(key => {
        if (chartsInstances[key]) {
            chartsInstances[key].resize();
        }
    });
});
