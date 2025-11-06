package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.ChatbotDAO;
import dao.LibroDAO;
import model.Chatbot;
import model.Libro;
import model.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

@WebServlet("/chatbot")
public class ChatbotServlet extends HttpServlet {
    
    private static final String GEMINI_API_KEY = "AIzaSyAY2A63pCwTaR0OfjhYM8VLO19eiMRYp48";
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    private ChatbotDAO chatbotDAO;
    private LibroDAO libroDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        chatbotDAO = new ChatbotDAO();
        libroDAO = new LibroDAO();
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Leer el mensaje del usuario
        StringBuilder sb = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        
        Map<String, Object> requestData = objectMapper.readValue(sb.toString(), Map.class);
        String mensajeUsuario = (String) requestData.get("mensaje");
        
        if (mensajeUsuario == null || mensajeUsuario.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Mensaje vacío\"}");
            return;
        }
        
        // Obtener información del usuario si está logueado
        HttpSession session = request.getSession(false);
        Usuario usuario = null;
        String nombreUsuario = "Usuario";
        Integer idUsuario = null;
        
        if (session != null && session.getAttribute("usuario") != null) {
            usuario = (Usuario) session.getAttribute("usuario");
            nombreUsuario = usuario.getNombre();
            idUsuario = usuario.getId();
        }
        
        // Obtener IP del usuario
        String ipOrigen = obtenerIpCliente(request);
        
        try {
            String contextoLibros = obtenerContextoLibros();
            
            String prompt = construirPrompt(mensajeUsuario, nombreUsuario, contextoLibros, usuario != null);
            
            String respuestaIA = llamarGeminiAPI(prompt);
            
            Chatbot chatbot = new Chatbot(idUsuario, mensajeUsuario, respuestaIA, ipOrigen);
            chatbotDAO.guardarConversacion(chatbot);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("respuesta", respuestaIA);
            responseData.put("nombreUsuario", nombreUsuario);
            responseData.put("timestamp", new Date().getTime());
            
            response.getWriter().write(objectMapper.writeValueAsString(responseData));
            
        } catch (Exception e) {
            System.err.println("Error en chatbot: " + e.getMessage());
            e.printStackTrace();
            
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.");
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }
    
    // Construir el contexto de libros disponibles
    private String obtenerContextoLibros() {
        List<Libro> librosDisponibles = libroDAO.listarConPaginacion(1, 50); // Top 50 libros
        
        StringBuilder contexto = new StringBuilder();
        contexto.append("\n\nLIBROS DISPONIBLES EN LA BIBLIOTECA:\n");
        
        for (Libro libro : librosDisponibles) {
            contexto.append(String.format(
                "- '%s' por %s (Género: %s, Stock disponible: %d)\n",
                libro.getNombre(),
                libro.getAutor(),
                libro.getGenero(),
                libro.getStockDisponible()
            ));
        }
        
        return contexto.toString();
    }
    
    // Construir el prompt para Gemini
    private String construirPrompt(String mensajeUsuario, String nombreUsuario, 
                                   String contextoLibros, boolean usuarioAutenticado) {
        
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Eres un asistente virtual amigable de una biblioteca llamado BiblioBot. ");
        prompt.append("Tu función es ayudar a los usuarios a encontrar libros y responder preguntas sobre la biblioteca.\n\n");
        
        if (usuarioAutenticado) {
            prompt.append("El usuario está registrado y su nombre es: ").append(nombreUsuario).append(".\n");
            prompt.append("Dirígete a él por su nombre de manera natural y amigable.\n\n");
        } else {
            prompt.append("El usuario no está registrado actualmente.\n");
            prompt.append("Puedes sugerirle que se registre para tener acceso a más funciones.\n\n");
        }
        
        prompt.append("INSTRUCCIONES:\n");
        prompt.append("1. Sé conversacional, amable y útil\n");
        prompt.append("2. Si preguntan por libros, recomienda basándote en la lista proporcionada\n");
        prompt.append("3. Si un libro no tiene stock disponible, menciona que está agotado temporalmente\n");
        prompt.append("4. Puedes recomendar libros por género, autor o título\n");
        prompt.append("5. Si preguntan sobre cómo usar la biblioteca, explica que pueden registrarse, buscar libros y solicitar préstamos\n");
        prompt.append("6. Mantén respuestas concisas (máximo 150 palabras)\n");
        prompt.append("7. Usa emojis ocasionalmente para ser más amigable 📚\n\n");
        
        prompt.append(contextoLibros);
        
        prompt.append("\n\nPREGUNTA DEL USUARIO:\n");
        prompt.append(mensajeUsuario);
        
        prompt.append("\n\nRespuesta (directo, sin prefijos):");
        
        return prompt.toString();
    }
    
    // Llamar a Gemini API
    private String llamarGeminiAPI(String prompt) throws IOException {
        URL url = new URL(GEMINI_API_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("x-goog-api-key", GEMINI_API_KEY);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        
        // Construir el body de la petición
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        content.put("parts", Collections.singletonList(part));
        requestBody.put("contents", Collections.singletonList(content));
        
        // Enviar la petición
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = objectMapper.writeValueAsBytes(requestBody);
            os.write(input, 0, input.length);
        }
        
        // Leer la respuesta
        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new IOException("Error en Gemini API: " + responseCode);
        }
        
        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }
        
        // Parsear la respuesta de Gemini
        Map<String, Object> responseData = objectMapper.readValue(response.toString(), Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseData.get("candidates");
        
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResponse.get("parts");
            
            if (parts != null && !parts.isEmpty()) {
                return (String) parts.get(0).get("text");
            }
        }
        
        return "Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.";
    }
    
    // Obtener la IP del cliente
    private String obtenerIpCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
