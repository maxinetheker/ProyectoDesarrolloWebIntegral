// Chatbot - BiblioBot
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotSend = document.getElementById('chatbot-send');
    
    // Obtener contextPath
    const contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));
    
    let isOpen = false;
    
    // Abrir/Cerrar chatbot
    function toggleChatbot() {
        isOpen = !isOpen;
        
        if (isOpen) {
            chatbotWindow.classList.remove('translate-y-8', 'opacity-0', 'pointer-events-none');
            chatbotWindow.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
            chatbotInput.focus();
        } else {
            chatbotWindow.classList.add('translate-y-8', 'opacity-0', 'pointer-events-none');
            chatbotWindow.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        }
    }
    
    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    
    // Enviar mensaje
    chatbotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const mensaje = chatbotInput.value.trim();
        if (!mensaje) return;
        
        // Agregar mensaje del usuario
        agregarMensajeUsuario(mensaje);
        
        // Limpiar input
        chatbotInput.value = '';
        
        // Deshabilitar input mientras se procesa
        chatbotInput.disabled = true;
        chatbotSend.disabled = true;
        
        // Mostrar indicador de escritura
        const typingIndicator = mostrarIndicadorEscritura();
        
        try {
            // Enviar mensaje al servidor
            const response = await fetch(contextPath + '/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mensaje: mensaje })
            });
            
            const data = await response.json();
            
            // Remover indicador de escritura
            typingIndicator.remove();
            
            if (data.error) {
                agregarMensajeBot('Lo siento, hubo un error. Por favor intenta de nuevo.');
            } else {
                agregarMensajeBot(data.respuesta);
            }
            
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            typingIndicator.remove();
            agregarMensajeBot('Lo siento, no pude conectarme con el servidor. Por favor intenta de nuevo.');
        } finally {
            // Rehabilitar input
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            chatbotInput.focus();
        }
    });
    
    // Agregar mensaje del usuario
    function agregarMensajeUsuario(mensaje) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-2 justify-end';
        
        const tiempo = obtenerHoraActual();
        
        messageDiv.innerHTML = `
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg rounded-tr-none shadow-md p-3 max-w-[80%]">
                <p class="text-sm">${escapeHtml(mensaje)}</p>
                <p class="text-xs text-blue-100 mt-1 text-right">${tiempo}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        `;
        
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Agregar mensaje del bot
    function agregarMensajeBot(mensaje) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-2';
        
        const tiempo = obtenerHoraActual();
        
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-200">
                <img src="${contextPath}/assets/images/bot.jpg" alt="Bot" class="w-full h-full object-cover">
            </div>
            <div class="bg-white rounded-lg rounded-tl-none shadow-md p-3 max-w-[80%]">
                <p class="text-sm text-gray-800 whitespace-pre-line">${formatearMensaje(mensaje)}</p>
                <p class="text-xs text-gray-400 mt-1">${tiempo}</p>
            </div>
        `;
        
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Mostrar indicador de escritura
    function mostrarIndicadorEscritura() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'flex items-start space-x-2';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-200">
                <img src="${contextPath}/assets/images/bot.jpg" alt="Bot" class="w-full h-full object-cover">
            </div>
            <div class="bg-white rounded-lg rounded-tl-none shadow-md p-3">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        
        chatbotMessages.appendChild(typingDiv);
        scrollToBottom();
        
        return typingDiv;
    }
    
    // Formatear mensaje (convertir saltos de línea)
    function formatearMensaje(mensaje) {
        // Escapar HTML pero permitir saltos de línea
        return escapeHtml(mensaje);
    }
    
    // Escapar HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Obtener hora actual
    function obtenerHoraActual() {
        const now = new Date();
        const horas = now.getHours().toString().padStart(2, '0');
        const minutos = now.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }
    
    // Scroll al final del chat
    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});
