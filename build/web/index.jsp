<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="model.Usuario"%>
<!DOCTYPE html>
<!--
aca va el codigo de la biblioteca del colegio
-->
<html class="scroll-smooth">
    <head>
        <title>Biblioteca Escolar - I.E. Sagrado Corazón de María</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <!-- Swiper CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
    </head>
    <body class="bg-gray-50">
        <%
            // Obtener el context path
            String contextPath = request.getContextPath();
            
            // Verificar si el usuario tiene sesión activa
            boolean usuarioLogueado = session.getAttribute("usuario") != null;
            String nombreUsuario = "";
            if (usuarioLogueado) {
                Usuario usuario = (Usuario) session.getAttribute("usuario");
                nombreUsuario = usuario.getNombre();
            }
        %>
        
        <!-- cabecera -->
        <header class="bg-white/95 backdrop-blur-sm shadow-lg fixed w-full top-0 z-50">
            <nav class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <!-- logo del colegio mejorado -->
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <img src="<%= contextPath %>/assets/images/logo.png" alt="I.E. Sagrado Corazón de María" class="h-14 w-14 ">
                            
                        </div>
                        <div class="font-bold">
                            <div class="text-lg bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                                I.E. 5128
                            </div>
                            <div class="text-sm bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent font-medium">
                                Sagrado Corazón de María
                            </div>
                        </div>
                    </div>

                    <!-- botones de navegacion -->
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#inicio" class="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                            Inicio
                            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <a href="#nosotros" class="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                            Nosotros
                            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <a href="#libros" class="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                            Nuestros Libros
                            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        
                        <% if (usuarioLogueado) { %>
                            <!-- Botón Dashboard para usuario logueado -->
                            <a href="<%= contextPath %>/pages/dashboard.jsp" class="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-sm shadow-lg hover:shadow-xl">
                                <span class="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span class="absolute top-0 left-0 w-full bg-gradient-to-b from-white/20 to-transparent opacity-50 h-1/3"></span>
                                <span class="relative flex items-center">
                                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                    </svg>
                                    Dashboard
                                </span>
                            </a>
                        <% } else { %>
                            <!-- Botón de inicio de sesión -->
                            <a href="<%= contextPath %>/pages/login.jsp" class="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-sm shadow-lg hover:shadow-xl">
                                <span class="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span class="absolute top-0 left-0 w-full bg-gradient-to-b from-white/20 to-transparent opacity-50 h-1/3"></span>
                                <span class="relative flex items-center">
                                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    Iniciar Sesión
                                </span>
                            </a>
                        <% } %>
                    </div>

                    <!-- boton hamburguesa para celulares -->
                    <div class="md:hidden">
                        <button class="text-gray-700 hover:text-red-600 p-2" onclick="toggleMobileMenu()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- menu para telefonos -->
                <div id="mobileMenu" class="hidden md:hidden mt-4 pb-4">
                    <div class="flex flex-col space-y-3">
                        <a href="#inicio" class="text-gray-700 hover:text-red-600 transition-colors duration-300 font-medium">Inicio</a>
                        <a href="#nosotros" class="text-gray-700 hover:text-red-600 transition-colors duration-300 font-medium">Nosotros</a>
                        <a href="#libros" class="text-gray-700 hover:text-red-600 transition-colors duration-300 font-medium">Nuestros Libros</a>
                        
                        <% if (usuarioLogueado) { %>
                            <a href="<%= contextPath %>/pages/dashboard.jsp" class="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg w-fit">
                                <span class="relative">Dashboard</span>
                            </a>
                        <% } else { %>
                            <a href="<%= contextPath %>/pages/login.jsp" class="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg w-fit">
                                <span class="relative">Iniciar Sesión</span>
                            </a>
                        <% } %>
                    </div>
                </div>
            </nav>
        </header>

        <!-- seccion principal con la imagen -->
        <section id="inicio" class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
            <!-- imagen de fondo -->
            <div class="absolute inset-0 z-0">
                <img src="<%= contextPath %>/assets/images/fondo.jpg" alt="Biblioteca" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-teal-800/70 to-red-900/60"></div>
            </div>

            <!-- el texto principal -->
            <div class="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    Bienvenidos a Nuestra
                    <span class="text-teal-300">Biblioteca Digital</span>
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
                    "El conocimiento es el tesoro más valioso que podemos adquirir.
                    En nuestra biblioteca encontrarás las llaves para abrir todas las puertas del saber."
                </p>
                <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
                    <a href="<%= contextPath %>/pages/catalogo.jsp" class="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
                        Explorar Catálogo
                    </a>
                    <a href="#nosotros" class="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                        Conocer Más
                    </a>
                </div>
            </div>

            <!-- flecha para hacer scroll mejorada -->
            <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button onclick="scrollToNosotros()" class="animate-bounce hover:animate-pulse transition-all duration-300 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </button>
            </div>
        </section>

        <!-- seccion donde hablamos del colegio -->
        <section id="nosotros" class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                        <span class="text-red-600">Nosotros</span>
                    </h2>
                    <div class="grid md:grid-cols-2 gap-12 items-center">
                        <div class="text-left">
                            <h3 class="text-2xl font-semibold text-teal-600 mb-4">Nuestra Misión</h3>
                            <p class="text-gray-600 text-lg leading-relaxed mb-6">
                                Brindar un servicio de calidad efectiva proyectado a una educación en valores,
                                impulsando un aprendizaje holístico, con un clima de armonía y democracia para
                                el desarrollo de la inteligencia emocional y afectiva.
                            </p>
                            <h3 class="text-2xl font-semibold text-teal-600 mb-4">Nuestra Visión</h3>
                            <p class="text-gray-600 text-lg leading-relaxed">
                                Consolidarse mediante una educación democrática y productiva fundamentada en valores,
                                formando líderes creativos, críticos, emprendedores y comprometidos ecológicamente,
                                apoyados por docentes que impulsen una educación humanista, científica y tecnológica.
                            </p>
                        </div>
                        <div class="bg-gradient-to-br from-teal-50 to-red-50 p-8 rounded-sm shadow-xl">
                            <div class="text-center">
                                <div class="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                                <h4 class="text-xl font-bold text-gray-800 mb-3">Sistema Innovador</h4>
                                <p class="text-gray-600">
                                    Nuestro sistema web automatiza la gestión de préstamos y devoluciones,
                                    ofreciendo una experiencia moderna y eficiente para toda la comunidad educativa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- seccion de libros modernizada -->
        <section id="libros" class="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            <div class="container mx-auto px-4">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-6">
                        <span class="bg-gradient-to-r from-slate-800 via-gray-700 to-slate-900 bg-clip-text text-transparent">
                            Nuestros Libros
                        </span>
                    </h2>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Descubre los títulos favoritos de nuestra comunidad educativa
                    </p>
                </div>

                <!-- Carrusel de libros más prestados -->
                <div class="max-w-7xl mx-auto mb-16">
                    <div class="swiper bookSwiper">
                        <div class="swiper-wrapper" id="libros-container">
                            <!-- Loader inicial -->
                            <div class="swiper-slide">
                                <div class="flex items-center justify-center h-96">
                                    <div>
                                        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
                                        <p class="mt-4 text-gray-600">Cargando libros...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- controles del swiper -->
                        <div class="swiper-pagination !bottom-0"></div>
                        <div class="swiper-button-next !text-slate-600"></div>
                        <div class="swiper-button-prev !text-slate-600"></div>
                    </div>
                </div>

                <!-- estadisticas -->
                <div class="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div class="bg-gradient-to-br from-slate-50 to-slate-100  rounded-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-slate-600 font-semibold text-sm uppercase tracking-wide mb-2">Total de Libros</p>
                                <p id="total-libros" class="text-5xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-slate-200 p-4 rounded-full">
                                <svg class="w-10 h-10 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100  rounded-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-700 font-semibold text-sm uppercase tracking-wide mb-2">Usuarios Activos</p>
                                <p id="usuarios-activos" class="text-5xl font-bold text-blue-900">0</p>
                            </div>
                            <div class="bg-blue-200 p-4 rounded-full">
                                <svg class="w-10 h-10 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- el footer -->
        <footer class="bg-gray-800 text-white py-12">
            <div class="container mx-auto px-4">
                <div class="grid md:grid-cols-3 gap-8">
                    <div>
                        <div class="flex items-center space-x-3 mb-4">
                            <img src="<%= contextPath %>/assets/images/logo.png" alt="Logo" class="h-10 w-10">
                            <div>
                                <h3 class="font-bold text-lg">I.E. 5128</h3>
                                <p class="text-teal-300 text-sm">Sagrado Corazón de María</p>
                            </div>
                        </div>
                        <p class="text-gray-300 leading-relaxed">
                            Formando líderes con valores, conocimiento y compromiso social
                            para construir un futuro mejor.
                        </p>
                    </div>

                    <div>
                        <h4 class="font-semibold text-lg mb-4 text-teal-300">Enlaces Rápidos</h4>
                        <ul class="space-y-2">
                            <li><a href="#inicio" class="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
                            <li><a href="#nosotros" class="text-gray-300 hover:text-white transition-colors">Nosotros</a></li>
                            <li><a href="#libros" class="text-gray-300 hover:text-white transition-colors">Nuestros Libros</a></li>
                            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Contacto</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-semibold text-lg mb-4 text-teal-300">Contacto</h4>
                        <div class="space-y-2 text-gray-300">
                            <p>📍 Colegio 5128, Calle Los Chasquis, Ventanilla 07071</p>
                            <!--Facebook-->
                            <p>🔵 <a href="https://www.facebook.com/p/IE-5128-Sagrado-Coraz%C3%B3n-de-Mar%C3%ADa-100068142510728/?locale=es_LA" target="_blank" class="hover:underline">facebook.com/IE-5128-Sagrado-Corazón-de-María</a></p>
              <%--               <p>📞 +51 XXX XXX XXX</p>
                            <p>✉️ biblioteca@sagradocorazon.edu.pe</p> --%>
                        </div>
                    </div>
                </div>

                <div class="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p class="text-gray-400">
                        © 2025 I.E. Sagrado Corazón de María. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>

        <!-- Chatbot flotante -->
        <div id="chatbot-container">
            <!-- Botón flotante circular -->
            <button id="chatbot-toggle" class="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <img src="<%= contextPath %>/assets/images/bot.jpg" alt="Chatbot" class="w-full h-full object-cover relative z-10">
                <div class="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/0 transition-all z-20"></div>
            </button>
            
            <!-- Ventana del chat -->
            <div id="chatbot-window" class="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl transform translate-y-8 opacity-0 pointer-events-none transition-all duration-300">
                <!-- Header del chat -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50">
                            <img src="<%= contextPath %>/assets/images/bot.jpg" alt="BiblioBot" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">BiblioBot</h3>
                            <p class="text-xs text-blue-100">Asistente virtual 🤖</p>
                        </div>
                    </div>
                    <button id="chatbot-close" class="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Mensajes del chat -->
                <div id="chatbot-messages" class="h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">
                    <!-- Mensaje de bienvenida -->
                    <div class="flex items-start space-x-2">
                        <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-200">
                            <img src="<%= contextPath %>/assets/images/bot.jpg" alt="Bot" class="w-full h-full object-cover">
                        </div>
                        <div class="bg-white rounded-lg rounded-tl-none shadow-md p-3 max-w-[80%]">
                            <p class="text-sm text-gray-800">
                                <% if (usuarioLogueado) { %>
                                    ¡Hola <%= nombreUsuario %>! 👋 Soy BiblioBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?
                                <% } else { %>
                                    ¡Hola! 👋 Soy BiblioBot, tu asistente virtual. ¿En qué puedo ayudarte? Puedes preguntarme sobre nuestros libros disponibles.
                                <% } %>
                            </p>
                            <p class="text-xs text-gray-400 mt-1">Ahora</p>
                        </div>
                    </div>
                </div>
                
                <!-- Input para escribir -->
                <div class="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                    <form id="chatbot-form" class="flex items-center space-x-2">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Escribe tu mensaje..."
                            class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autocomplete="off"
                        >
                        <button 
                            type="submit" 
                            id="chatbot-send"
                            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-2 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </form>
                    <p class="text-xs text-gray-400 mt-2 text-center">Powered by Gemini AI</p>
                </div>
            </div>
        </div>

        <!-- Swiper JS -->
        <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
        
        <!-- Script principal -->
        <script src="<%= contextPath %>/assets/js/index.js"></script>
        
        <!-- Script del chatbot -->
        <script src="<%= contextPath %>/assets/js/chatbot.js"></script>
    </body>
</html>
