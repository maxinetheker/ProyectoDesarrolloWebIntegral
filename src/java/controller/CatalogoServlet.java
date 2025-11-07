package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import dao.LibroDAO;
import model.Libro;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "CatalogoServlet", urlPatterns = {"/catalogo"})
public class CatalogoServlet extends HttpServlet {
    
    private LibroDAO libroDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        libroDAO = new LibroDAO();
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        // Validar que el usuario esté autenticado
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            enviarRespuestaError(response, "Sesión expirada", 401);
            return;
        }
        
        String accion = request.getParameter("accion");
        //hola
        try {
            if ("listar".equals(accion)) {
                listarCatalogo(request, response);
            } else if ("obtener".equals(accion)) {
                obtenerDetalleLibro(request, response);
            } else {
                enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            e.printStackTrace();
            enviarRespuestaError(response, "Error en el servidor: " + e.getMessage(), 500);
        }
    }
    
    private void listarCatalogo(HttpServletRequest request, HttpServletResponse response)
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
        
        List<Libro> libros;
        int totalLibros;
        
        if (hayBusqueda) {
            libros = libroDAO.buscarActivosConPaginacion(busqueda.trim(), pagina, registrosPorPagina);
            totalLibros = libroDAO.contarLibrosActivosPorBusqueda(busqueda.trim());
        } else {
            libros = libroDAO.listarActivosConPaginacion(pagina, registrosPorPagina);
            totalLibros = libroDAO.contarLibrosActivos();
        }
        
        int totalPaginas = (int) Math.ceil((double) totalLibros / registrosPorPagina);
        int registroInicio = totalLibros > 0 ? ((pagina - 1) * registrosPorPagina) + 1 : 0;
        int registroFin = Math.min(pagina * registrosPorPagina, totalLibros);
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        respuesta.put("success", true);
        
        ArrayNode librosArray = objectMapper.createArrayNode();
        for (Libro libro : libros) {
            ObjectNode libroNode = objectMapper.createObjectNode();
            libroNode.put("id", libro.getId());
            libroNode.put("nombre", libro.getNombre());
            libroNode.put("autor", libro.getAutor());
            libroNode.put("isbn", libro.getIsbn());
            libroNode.put("editorial", libro.getEditorial());
            libroNode.put("anioPublicacion", libro.getAnioPublicacion());
            libroNode.put("genero", libro.getGenero());
            libroNode.put("descripcion", libro.getDescripcion());
            libroNode.put("stockDisponible", libro.getStockDisponible());
            libroNode.put("ubicacion", libro.getUbicacion());
            libroNode.put("urlPortada", libro.getUrlPortada() != null ? libro.getUrlPortada() : "../assets/images/portadas/portada.jpg");
            librosArray.add(libroNode);
        }
        
        respuesta.set("libros", librosArray);
        respuesta.put("paginaActual", pagina);
        respuesta.put("totalPaginas", totalPaginas);
        respuesta.put("totalRegistros", totalLibros);
        respuesta.put("registroInicio", registroInicio);
        respuesta.put("registroFin", registroFin);
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void obtenerDetalleLibro(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Libro libro = libroDAO.obtenerPorId(id);
            
            if (libro != null && libro.isActivo()) {
                ObjectNode libroNode = objectMapper.createObjectNode();
                libroNode.put("id", libro.getId());
                libroNode.put("nombre", libro.getNombre());
                libroNode.put("autor", libro.getAutor());
                libroNode.put("isbn", libro.getIsbn());
                libroNode.put("editorial", libro.getEditorial());
                libroNode.put("anioPublicacion", libro.getAnioPublicacion());
                libroNode.put("genero", libro.getGenero());
                libroNode.put("descripcion", libro.getDescripcion());
                libroNode.put("stockDisponible", libro.getStockDisponible());
                libroNode.put("ubicacion", libro.getUbicacion());
                libroNode.put("urlPortada", libro.getUrlPortada() != null ? libro.getUrlPortada() : "../assets/images/portadas/portada.jpg");
                
                respuesta.put("success", true);
                respuesta.set("libro", libroNode);
            } else {
                respuesta.put("success", false);
                respuesta.put("message", "Libro no encontrado");
            }
        } catch (Exception e) {
            respuesta.put("success", false);
            respuesta.put("message", "Error: " + e.getMessage());
        }
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void enviarRespuestaJSON(HttpServletResponse response, ObjectNode objeto)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(objeto));
    }
    
    private void enviarRespuestaError(HttpServletResponse response, String mensaje, int codigo)
            throws IOException {
        response.setStatus(codigo);
        ObjectNode error = objectMapper.createObjectNode();
        error.put("success", false);
        error.put("message", mensaje);
        enviarRespuestaJSON(response, error);
    }
}
