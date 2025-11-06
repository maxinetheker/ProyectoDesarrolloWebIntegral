package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dao.CodigoBarrasDAO;
import dao.UsuarioDAO;
import model.CodigoBarras;
import model.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Servlet para gestionar carnets de biblioteca
 */
@WebServlet(name = "CarnetServlet", urlPatterns = {"/carnet"})
public class CarnetServlet extends HttpServlet {
    
    private CodigoBarrasDAO codigoBarrasDAO;
    private UsuarioDAO usuarioDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        codigoBarrasDAO = new CodigoBarrasDAO();
        usuarioDAO = new UsuarioDAO();
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        try {
            // Verificar sesión
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("usuario") == null) {
                enviarRespuestaError(response, "Sesión no válida", 401);
                return;
            }
            
            String accion = request.getParameter("accion");
            
            if (accion == null) {
                accion = "obtener"; // Por defecto obtener
            }
            
            // Para GET, solo permitir obtener el propio carnet
            if ("obtener".equals(accion) || "obtenerCodigo".equals(accion)) {
                obtenerCarnet(request, response);
            } else {
                enviarRespuestaError(response, "Acción no válida para GET", 400);
            }
        } catch (Exception e) {
            System.err.println("Error en CarnetServlet GET: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        try {
            // Verificar sesión
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("usuario") == null) {
                enviarRespuestaError(response, "Sesión no válida", 401);
                return;
            }
            
            Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");
            boolean esAdmin = "Administrador".equals(usuarioSesion.getNombreRol());
            
            // Solo administradores pueden generar carnets
            if (!esAdmin) {
                enviarRespuestaError(response, "No tiene permisos para esta acción", 403);
                return;
            }
            
            String accion = request.getParameter("accion");
            
            if (accion == null) {
                enviarRespuestaError(response, "Acción no especificada", 400);
                return;
            }
            
            switch (accion) {
                case "generar":
                    generarCarnet(request, response);
                    break;
                case "renovar":
                    renovarCarnet(request, response);
                    break;
                case "obtener":
                    obtenerCarnet(request, response);
                    break;
                default:
                    enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            System.err.println("Error en CarnetServlet: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    /**
     * Genera un nuevo carnet para un usuario
     */
    private void generarCarnet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String usuarioIdStr = request.getParameter("usuarioId");
            String tipo = request.getParameter("tipo"); // "permanente" o "temporal"
            
            if (usuarioIdStr == null || usuarioIdStr.trim().isEmpty()) {
                enviarRespuestaError(response, "ID de usuario requerido", 400);
                return;
            }
            
            // Validar tipo
            if (tipo == null || tipo.trim().isEmpty()) {
                tipo = "temporal"; // Por defecto temporal
            }
            
            if (!tipo.equals("permanente") && !tipo.equals("temporal")) {
                enviarRespuestaError(response, "Tipo de carnet inválido", 400);
                return;
            }
            
            int usuarioId = Integer.parseInt(usuarioIdStr);
            
            // Verificar que el usuario existe
            Usuario usuario = usuarioDAO.obtenerPorId(usuarioId);
            if (usuario == null) {
                enviarRespuestaError(response, "Usuario no encontrado", 404);
                return;
            }
            
            // Desactivar códigos anteriores
            codigoBarrasDAO.desactivarAnteriores(usuarioId);
            
            // Generar nuevo código único
            String codigo = generarCodigoUnico(usuarioId);
            
            // Fecha de caducidad: si es permanente, poner fecha muy lejana, sino 1 año
            LocalDateTime fechaCaducidad;
            if (tipo.equals("permanente")) {
                fechaCaducidad = LocalDateTime.of(9999, 12, 31, 23, 59, 59); // Fecha lejana
            } else {
                fechaCaducidad = LocalDateTime.now().plusYears(1);
            }
            
            // Crear nuevo código de barras
            CodigoBarras codigoBarras = new CodigoBarras();
            codigoBarras.setIdUsuario(usuarioId);
            codigoBarras.setCodigo(codigo);
            codigoBarras.setFechaCaducidad(fechaCaducidad);
            codigoBarras.setTipo(tipo);
            codigoBarras.setActivo(true);
            
            boolean creado = codigoBarrasDAO.crear(codigoBarras);
            
            if (creado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", "Carnet generado exitosamente");
                respuesta.put("codigo", codigo);
                respuesta.put("tipo", tipo);
                
                if (tipo.equals("permanente")) {
                    respuesta.put("fechaCaducidad", "permanente");
                } else {
                    respuesta.put("fechaCaducidad", fechaCaducidad.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                }
                
                // Datos del usuario para el carnet
                ObjectNode usuarioData = objectMapper.createObjectNode();
                usuarioData.put("id", usuario.getId());
                usuarioData.put("usuario", usuario.getUsuario());
                usuarioData.put("nombreCompleto", usuario.getNombreCompleto());
                usuarioData.put("email", usuario.getEmail());
                usuarioData.put("telefono", usuario.getTelefono());
                usuarioData.put("rol", usuario.getNombreRol());
                
                respuesta.set("usuario", usuarioData);
                
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al crear el carnet", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID de usuario inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al generar carnet: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error al generar carnet", 500);
        }
    }
    
    /**
     * Renueva el carnet de un usuario (extiende la fecha de caducidad y genera nuevo código)
     */
    private void renovarCarnet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String usuarioIdStr = request.getParameter("usuarioId");
            String tipo = request.getParameter("tipo"); // "permanente" o "temporal"
            
            if (usuarioIdStr == null || usuarioIdStr.trim().isEmpty()) {
                enviarRespuestaError(response, "ID de usuario requerido", 400);
                return;
            }
            
            // Validar tipo
            if (tipo == null || tipo.trim().isEmpty()) {
                tipo = "temporal"; // Por defecto temporal
            }
            
            if (!tipo.equals("permanente") && !tipo.equals("temporal")) {
                enviarRespuestaError(response, "Tipo de carnet inválido", 400);
                return;
            }
            
            int usuarioId = Integer.parseInt(usuarioIdStr);
            
            // Verificar que el usuario existe
            Usuario usuario = usuarioDAO.obtenerPorId(usuarioId);
            if (usuario == null) {
                enviarRespuestaError(response, "Usuario no encontrado", 404);
                return;
            }
            
            // Desactivar código anterior
            codigoBarrasDAO.desactivarAnteriores(usuarioId);
            
            // Generar nuevo código
            String nuevoCodigo = generarCodigoUnico(usuarioId);
            
            // Fecha de caducidad: si es permanente, poner fecha muy lejana, sino 1 año
            LocalDateTime nuevaFechaCaducidad;
            if (tipo.equals("permanente")) {
                nuevaFechaCaducidad = LocalDateTime.of(9999, 12, 31, 23, 59, 59);
            } else {
                nuevaFechaCaducidad = LocalDateTime.now().plusYears(1);
            }
            
            // Crear nuevo código de barras
            CodigoBarras codigoBarras = new CodigoBarras();
            codigoBarras.setIdUsuario(usuarioId);
            codigoBarras.setCodigo(nuevoCodigo);
            codigoBarras.setFechaCaducidad(nuevaFechaCaducidad);
            codigoBarras.setTipo(tipo);
            codigoBarras.setActivo(true);
            
            boolean renovado = codigoBarrasDAO.crear(codigoBarras);
            
            if (renovado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", "Carnet renovado exitosamente");
                respuesta.put("codigo", nuevoCodigo);
                respuesta.put("tipo", tipo);
                
                if (tipo.equals("permanente")) {
                    respuesta.put("fechaCaducidad", "permanente");
                } else {
                    respuesta.put("fechaCaducidad", nuevaFechaCaducidad.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                }
                
                // Datos del usuario
                ObjectNode usuarioData = objectMapper.createObjectNode();
                usuarioData.put("id", usuario.getId());
                usuarioData.put("usuario", usuario.getUsuario());
                usuarioData.put("nombreCompleto", usuario.getNombreCompleto());
                usuarioData.put("email", usuario.getEmail());
                usuarioData.put("telefono", usuario.getTelefono());
                usuarioData.put("rol", usuario.getNombreRol());
                
                respuesta.set("usuario", usuarioData);
                
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al renovar el carnet", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID de usuario inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al renovar carnet: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error al renovar carnet", 500);
        }
    }
    
    /**
     * Obtiene el carnet activo de un usuario
     */
    private void obtenerCarnet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String usuarioIdStr = request.getParameter("usuarioId");
            
            if (usuarioIdStr == null || usuarioIdStr.trim().isEmpty()) {
                enviarRespuestaError(response, "ID de usuario requerido", 400);
                return;
            }
            
            int usuarioId = Integer.parseInt(usuarioIdStr);
            
            // Buscar código activo
            CodigoBarras codigoBarras = codigoBarrasDAO.buscarPorUsuario(usuarioId);
            Usuario usuario = usuarioDAO.obtenerPorId(usuarioId);
            
            if (codigoBarras != null && usuario != null) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("tiene", true);
                respuesta.put("codigo", codigoBarras.getCodigo());
                respuesta.put("tipo", codigoBarras.getTipo());
                
                if (codigoBarras.getTipo().equals("permanente")) {
                    respuesta.put("fechaCaducidad", "permanente");
                } else {
                    respuesta.put("fechaCaducidad", codigoBarras.getFechaCaducidad().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                }
                
                respuesta.put("estaVencido", codigoBarras.estaVencido());
                
                // Datos del usuario
                ObjectNode usuarioData = objectMapper.createObjectNode();
                usuarioData.put("id", usuario.getId());
                usuarioData.put("usuario", usuario.getUsuario());
                usuarioData.put("nombreCompleto", usuario.getNombreCompleto());
                usuarioData.put("email", usuario.getEmail());
                usuarioData.put("telefono", usuario.getTelefono());
                usuarioData.put("rol", usuario.getNombreRol());
                
                respuesta.set("usuario", usuarioData);
                
                enviarRespuestaJSON(response, respuesta);
            } else {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("tiene", false);
                respuesta.put("mensaje", "El usuario no tiene carnet");
                
                enviarRespuestaJSON(response, respuesta);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID de usuario inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al obtener carnet: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error al obtener carnet", 500);
        }
    }
    
    /**
     * Genera un código único para el carnet
     * Formato: LIB-YYYY-NNNNN-TTTTTT 
     */
    private String generarCodigoUnico(int usuarioId) {
        int año = LocalDateTime.now().getYear();
        String idFormateado = String.format("%05d", usuarioId);
        // Agregar timestamp para garantizar unicidad en renovaciones
        long timestamp = System.currentTimeMillis() % 1000000; // Últimos 6 dígitos
        return String.format("LIB-%d-%s-%06d", año, idFormateado, timestamp);
    }
    
    /**
     * Envía una respuesta JSON
     */
    private void enviarRespuestaJSON(HttpServletResponse response, ObjectNode objeto)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        out.print(objectMapper.writeValueAsString(objeto));
        out.flush();
    }
    
    /**
     * Envía una respuesta de error
     */
    private void enviarRespuestaError(HttpServletResponse response, String mensaje, int codigo)
            throws IOException {
        response.setStatus(codigo);
        
        ObjectNode error = objectMapper.createObjectNode();
        error.put("success", false);
        error.put("mensaje", mensaje);
        
        enviarRespuestaJSON(response, error);
    }
}
