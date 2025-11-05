package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import dao.RolDAO;
import dao.UsuarioDAO;
import model.Rol;
import model.Usuario;
import util.PasswordUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet para gestionar usuarios (CRUD)
 */
@WebServlet(name = "UsuarioServlet", urlPatterns = {"/usuarios"})
public class UsuarioServlet extends HttpServlet {
    
    private UsuarioDAO usuarioDAO;
    private RolDAO rolDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        usuarioDAO = new UsuarioDAO();
        rolDAO = new RolDAO();
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        try {
            // Verificar sesión
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("usuario") == null) {
                enviarRespuestaError(response, "Sesión expirada", 401);
                return;
            }
            
            Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");
            boolean esAdmin = "Administrador".equals(usuarioSesion.getNombreRol());
            
            // Solo administradores pueden gestionar usuarios
            if (!esAdmin) {
                enviarRespuestaError(response, "No tiene permisos para realizar esta acción", 403);
                return;
            }
            
            String accion = request.getParameter("accion");
            
            if (accion == null) {
                enviarRespuestaError(response, "Acción no especificada", 400);
                return;
            }
            
            switch (accion) {
                case "listar":
                    listarUsuarios(request, response);
                    break;
                case "crear":
                    crearUsuario(request, response);
                    break;
                case "actualizar":
                    actualizarUsuario(request, response);
                    break;
                case "eliminar":
                    eliminarUsuario(request, response);
                    break;
                case "cambiarEstado":
                    cambiarEstadoUsuario(request, response);
                    break;
                case "obtenerRoles":
                    obtenerRoles(request, response);
                    break;
                default:
                    enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            System.err.println("Error no capturado en UsuarioServlet: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error interno del servidor: " + e.getMessage(), 500);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        try {
            // Verificar sesión
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("usuario") == null) {
                enviarRespuestaError(response, "Sesión expirada", 401);
                return;
            }
            
            String accion = request.getParameter("accion");
            
            if (accion == null) {
                enviarRespuestaError(response, "Acción no especificada", 400);
                return;
            }
            
            switch (accion) {
                case "buscarAutocompletado":
                    buscarParaAutocompletado(request, response);
                    break;
                case "buscarPorCodigoBarras":
                    buscarPorCodigoBarras(request, response);
                    break;
                default:
                    enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            System.err.println("Error en UsuarioServlet GET: " + e.getMessage());
            e.printStackTrace();
            enviarRespuestaError(response, "Error interno del servidor: " + e.getMessage(), 500);
        }
    }
    
    /**
     * Lista usuarios con paginación y búsqueda opcional
     */
    private void listarUsuarios(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        int pagina = 1;
        int registrosPorPagina = 10;
        
        String paginaParam = request.getParameter("pagina");
        if (paginaParam != null && !paginaParam.isEmpty()) {
            try {
                pagina = Integer.parseInt(paginaParam);
            } catch (NumberFormatException e) {
                pagina = 1;
            }
        }
        
        String busqueda = request.getParameter("busqueda");
        boolean hayBusqueda = busqueda != null && !busqueda.trim().isEmpty();
        
        List<Usuario> usuarios;
        int totalUsuarios;
        
        if (hayBusqueda) {
            // Buscar con filtro
            usuarios = usuarioDAO.buscarConPaginacion(busqueda.trim(), pagina, registrosPorPagina);
            totalUsuarios = usuarioDAO.contarUsuariosPorBusqueda(busqueda.trim());
        } else {
            // Listar todos
            usuarios = usuarioDAO.listarConPaginacion(pagina, registrosPorPagina);
            totalUsuarios = usuarioDAO.contarUsuarios();
        }
        
        int totalPaginas = (int) Math.ceil((double) totalUsuarios / registrosPorPagina);
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        respuesta.put("success", true);
        
        ArrayNode usuariosArray = objectMapper.createArrayNode();
        for (Usuario u : usuarios) {
            ObjectNode usuarioNode = objectMapper.createObjectNode();
            usuarioNode.put("id", u.getId());
            usuarioNode.put("usuario", u.getUsuario());
            usuarioNode.put("nombre", u.getNombre());
            usuarioNode.put("apellido", u.getApellido());
            usuarioNode.put("email", u.getEmail());
            usuarioNode.put("telefono", u.getTelefono());
            usuarioNode.put("direccion", u.getDireccion());
            usuarioNode.put("idRol", u.getIdRol());
            usuarioNode.put("nombreRol", u.getNombreRol());
            usuarioNode.put("activo", u.isActivo());
            usuariosArray.add(usuarioNode);
        }
        
        respuesta.set("usuarios", usuariosArray);
        respuesta.put("paginaActual", pagina);
        respuesta.put("totalPaginas", totalPaginas);
        respuesta.put("totalUsuarios", totalUsuarios);
        respuesta.put("busqueda", hayBusqueda ? busqueda : "");
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    /**
     * Crea un nuevo usuario
     */
    private void crearUsuario(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String usuario = request.getParameter("usuario");
            String nombre = request.getParameter("nombre");
            String apellido = request.getParameter("apellido");
            String email = request.getParameter("email");
            String contrasena = request.getParameter("contrasena");
            String telefono = request.getParameter("telefono");
            String direccion = request.getParameter("direccion");
            String idRolStr = request.getParameter("idRol");
            
            // Validaciones básicas
            if (usuario == null || usuario.trim().isEmpty() ||
                nombre == null || nombre.trim().isEmpty() ||
                apellido == null || apellido.trim().isEmpty() ||
                contrasena == null || contrasena.trim().isEmpty() ||
                idRolStr == null || idRolStr.trim().isEmpty()) {
                
                enviarRespuestaError(response, "Faltan campos obligatorios", 400);
                return;
            }
            
            // Verificar si el usuario ya existe
            Usuario usuarioExistente = usuarioDAO.buscarPorUsuario(usuario);
            if (usuarioExistente != null) {
                enviarRespuestaError(response, "El nombre de usuario ya existe", 400);
                return;
            }
            
            int idRol = Integer.parseInt(idRolStr);
            
            // Crear nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsuario(usuario);
            nuevoUsuario.setNombre(nombre);
            nuevoUsuario.setApellido(apellido);
            nuevoUsuario.setEmail(email);
            nuevoUsuario.setContrasena(PasswordUtil.hashPassword(contrasena));
            nuevoUsuario.setTelefono(telefono);
            nuevoUsuario.setDireccion(direccion);
            nuevoUsuario.setIdRol(idRol);
            nuevoUsuario.setActivo(true);
            
            boolean creado = usuarioDAO.crear(nuevoUsuario);
            
            if (creado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", "Usuario creado exitosamente");
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al crear usuario", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID de rol inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al crear usuario: " + e.getMessage());
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    /**
     * Actualiza un usuario existente
     */
    private void actualizarUsuario(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String idStr = request.getParameter("id");
            String nombre = request.getParameter("nombre");
            String apellido = request.getParameter("apellido");
            String email = request.getParameter("email");
            String telefono = request.getParameter("telefono");
            String direccion = request.getParameter("direccion");
            String idRolStr = request.getParameter("idRol");
            String nuevaContrasena = request.getParameter("contrasena");
            
            // Validaciones básicas
            if (idStr == null || idStr.trim().isEmpty() ||
                nombre == null || nombre.trim().isEmpty() ||
                apellido == null || apellido.trim().isEmpty() ||
                idRolStr == null || idRolStr.trim().isEmpty()) {
                
                enviarRespuestaError(response, "Faltan campos obligatorios", 400);
                return;
            }
            
            int id = Integer.parseInt(idStr);
            int idRol = Integer.parseInt(idRolStr);
            
            // Obtener usuario existente
            Usuario usuario = usuarioDAO.obtenerPorId(id);
            if (usuario == null) {
                enviarRespuestaError(response, "Usuario no encontrado", 404);
                return;
            }
            
            // Actualizar datos
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setEmail(email);
            usuario.setTelefono(telefono);
            usuario.setDireccion(direccion);
            usuario.setIdRol(idRol);
            
            boolean actualizado = usuarioDAO.actualizar(usuario);
            
            // Si se proporcionó una nueva contraseña, actualizarla
            if (nuevaContrasena != null && !nuevaContrasena.trim().isEmpty()) {
                String contrasenaHash = PasswordUtil.hashPassword(nuevaContrasena);
                boolean contrasenaActualizada = usuarioDAO.actualizarContrasena(id, contrasenaHash);
                
                if (!contrasenaActualizada) {
                    enviarRespuestaError(response, "Usuario actualizado pero falló el cambio de contraseña", 500);
                    return;
                }
            }
            
            if (actualizado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", "Usuario actualizado exitosamente");
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al actualizar usuario", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    /**
     * Elimina  un usuario
     */
    private void eliminarUsuario(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String idStr = request.getParameter("id");
            
            if (idStr == null || idStr.trim().isEmpty()) {
                enviarRespuestaError(response, "ID de usuario no especificado", 400);
                return;
            }
            
            int id = Integer.parseInt(idStr);
            
            // Verificar que no sea el usuario de la sesión
            HttpSession session = request.getSession();
            Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");
            if (usuarioSesion.getId() == id) {
                enviarRespuestaError(response, "No puede eliminar su propia cuenta", 400);
                return;
            }
            
            boolean eliminado = usuarioDAO.desactivar(id);
            
            if (eliminado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", "Usuario eliminado exitosamente");
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al eliminar usuario", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al eliminar usuario: " + e.getMessage());
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    /**
     * Cambia el estado (activo/inactivo) de un usuario
     */
    private void cambiarEstadoUsuario(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        try {
            String idStr = request.getParameter("id");
            String activoStr = request.getParameter("activo");
            
            if (idStr == null || idStr.trim().isEmpty() || activoStr == null) {
                enviarRespuestaError(response, "Parámetros incompletos", 400);
                return;
            }
            
            int id = Integer.parseInt(idStr);
            boolean activo = Boolean.parseBoolean(activoStr);
            
            // Verificar que no sea el usuario de la sesión
            HttpSession session = request.getSession();
            Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");
            if (usuarioSesion.getId() == id) {
                enviarRespuestaError(response, "No puede cambiar el estado de su propia cuenta", 400);
                return;
            }
            
            boolean cambiado = usuarioDAO.cambiarEstado(id, activo);
            
            if (cambiado) {
                ObjectNode respuesta = objectMapper.createObjectNode();
                respuesta.put("success", true);
                respuesta.put("mensaje", activo ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente");
                enviarRespuestaJSON(response, respuesta);
            } else {
                enviarRespuestaError(response, "Error al cambiar estado del usuario", 500);
            }
            
        } catch (NumberFormatException e) {
            enviarRespuestaError(response, "ID inválido", 400);
        } catch (Exception e) {
            System.err.println("Error al cambiar estado de usuario: " + e.getMessage());
            enviarRespuestaError(response, "Error interno del servidor", 500);
        }
    }
    
    /**
     * Obtiene la lista de roles disponibles
     */
    private void obtenerRoles(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        List<Rol> roles = rolDAO.listarTodos();
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        respuesta.put("success", true);
        
        ArrayNode rolesArray = objectMapper.createArrayNode();
        for (Rol r : roles) {
            ObjectNode rolNode = objectMapper.createObjectNode();
            rolNode.put("id", r.getId());
            rolNode.put("rol", r.getRol());
            rolNode.put("descripcion", r.getDescripcion());
            rolesArray.add(rolNode);
        }
        
        respuesta.set("roles", rolesArray);
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    /**
     * Busca usuarios para autocompletado
     */
    private void buscarParaAutocompletado(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        String busqueda = request.getParameter("busqueda");
        
        if (busqueda == null || busqueda.trim().isEmpty()) {
            ObjectNode respuesta = objectMapper.createObjectNode();
            respuesta.put("success", true);
            respuesta.set("usuarios", objectMapper.createArrayNode());
            enviarRespuestaJSON(response, respuesta);
            return;
        }
        
        List<Usuario> usuarios = usuarioDAO.buscarParaAutocompletado(busqueda.trim());
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        respuesta.put("success", true);
        
        ArrayNode usuariosArray = objectMapper.createArrayNode();
        for (Usuario u : usuarios) {
            ObjectNode usuarioNode = objectMapper.createObjectNode();
            usuarioNode.put("id", u.getId());
            usuarioNode.put("usuario", u.getUsuario());
            usuarioNode.put("nombre", u.getNombre());
            usuarioNode.put("apellido", u.getApellido());
            usuarioNode.put("nombreCompleto", u.getNombre() + " " + u.getApellido());
            usuariosArray.add(usuarioNode);
        }
        
        respuesta.set("usuarios", usuariosArray);
        enviarRespuestaJSON(response, respuesta);
    }
    
    /**
     * Busca usuarios por código de barras con sugerencias y validación de caducidad
     */
    private void buscarPorCodigoBarras(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        String codigo = request.getParameter("codigo");
        
        if (codigo == null || codigo.trim().isEmpty()) {
            ObjectNode respuesta = objectMapper.createObjectNode();
            respuesta.put("success", true);
            respuesta.set("usuarios", objectMapper.createArrayNode());
            enviarRespuestaJSON(response, respuesta);
            return;
        }
        
        // Buscar usuarios por código de barras (activos solamente)
        List<java.util.Map<String, Object>> resultados = usuarioDAO.buscarPorCodigoBarras(codigo.trim());
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        respuesta.put("success", true);
        
        ArrayNode usuariosArray = objectMapper.createArrayNode();
        for (java.util.Map<String, Object> resultado : resultados) {
            ObjectNode usuarioNode = objectMapper.createObjectNode();
            usuarioNode.put("id", (Integer) resultado.get("id"));
            usuarioNode.put("usuario", (String) resultado.get("usuario"));
            usuarioNode.put("nombre", (String) resultado.get("nombre"));
            usuarioNode.put("apellido", (String) resultado.get("apellido"));
            usuarioNode.put("nombreCompleto", resultado.get("nombre") + " " + resultado.get("apellido"));
            usuarioNode.put("codigo", (String) resultado.get("codigo"));
            usuarioNode.put("estaVencido", (Boolean) resultado.get("estaVencido"));
            usuariosArray.add(usuarioNode);
        }
        
        respuesta.set("usuarios", usuariosArray);
        enviarRespuestaJSON(response, respuesta);
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
