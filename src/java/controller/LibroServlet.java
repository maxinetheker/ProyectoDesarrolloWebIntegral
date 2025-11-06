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
import java.io.IOException;
import java.util.List;
import java.util.Random;

@WebServlet(name = "LibroServlet", urlPatterns = {"/libros"})
public class LibroServlet extends HttpServlet {
    
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
        
        String accion = request.getParameter("accion");
        
        try {
            switch (accion != null ? accion : "") {
                case "listar":
                    listarLibros(request, response);
                    break;
                case "obtener":
                    obtenerDetalles(request, response);
                    break;
                case "generarIsbn":
                    generarIsbn(request, response);
                    break;
                case "buscarAutocompletado":
                    buscarParaAutocompletado(request, response);
                    break;
                default:
                    enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            e.printStackTrace();
            enviarRespuestaError(response, "Error en el servidor: " + e.getMessage(), 500);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        String accion = request.getParameter("accion");
        
        try {
            switch (accion != null ? accion : "") {
                case "crear":
                    crearLibro(request, response);
                    break;
                case "actualizar":
                    actualizarLibro(request, response);
                    break;
                case "cambiarEstado":
                    cambiarEstadoLibro(request, response);
                    break;
                case "actualizarStock":
                    actualizarStock(request, response);
                    break;
                default:
                    enviarRespuestaError(response, "Acción no válida", 400);
            }
        } catch (Exception e) {
            e.printStackTrace();
            enviarRespuestaError(response, "Error en el servidor: " + e.getMessage(), 500);
        }
    }
    
    private void listarLibros(HttpServletRequest request, HttpServletResponse response)
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
            libros = libroDAO.buscarConPaginacion(busqueda.trim(), pagina, registrosPorPagina);
            totalLibros = libroDAO.contarLibrosPorBusqueda(busqueda.trim());
        } else {
            libros = libroDAO.listarConPaginacion(pagina, registrosPorPagina);
            totalLibros = libroDAO.contarLibros();
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
            libroNode.put("stock", libro.getStock());
            libroNode.put("stockDisponible", libro.getStockDisponible());
            libroNode.put("ubicacion", libro.getUbicacion());
            libroNode.put("activo", libro.isActivo());
            librosArray.add(libroNode);
        }
        
        respuesta.set("libros", librosArray);
        respuesta.put("paginaActual", pagina);
        respuesta.put("totalPaginas", totalPaginas);
        respuesta.put("totalRegistros", totalLibros);
        respuesta.put("registroInicio", registroInicio);
        respuesta.put("registroFin", registroFin);
        respuesta.put("busqueda", hayBusqueda ? busqueda : "");
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void crearLibro(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            // Validar campos requeridos
            String nombre = request.getParameter("nombre");
            String autor = request.getParameter("autor");
            String isbn = request.getParameter("isbn");
            String anioStr = request.getParameter("anioPublicacion");
            String stockStr = request.getParameter("stock");
            
            if (nombre == null || nombre.trim().isEmpty()) {
                respuesta.put("success", false);
                respuesta.put("message", "El nombre es requerido");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            if (autor == null || autor.trim().isEmpty()) {
                respuesta.put("success", false);
                respuesta.put("message", "El autor es requerido");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            if (isbn == null || isbn.trim().isEmpty()) {
                respuesta.put("success", false);
                respuesta.put("message", "El ISBN es requerido");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            Libro libro = new Libro();
            libro.setNombre(nombre.trim());
            libro.setAutor(autor.trim());
            libro.setIsbn(isbn.trim());
            
            String editorial = request.getParameter("editorial");
            libro.setEditorial(editorial != null && !editorial.trim().isEmpty() ? editorial.trim() : "");
            
            int anio = 0;
            if (anioStr != null && !anioStr.trim().isEmpty()) {
                try {
                    anio = Integer.parseInt(anioStr.trim());
                } catch (NumberFormatException e) {
                    respuesta.put("success", false);
                    respuesta.put("message", "El año debe ser un número válido");
                    enviarRespuestaJSON(response, respuesta);
                    return;
                }
            }
            libro.setAnioPublicacion(anio);
            
            String genero = request.getParameter("genero");
            libro.setGenero(genero != null && !genero.trim().isEmpty() ? genero.trim() : "");
            
            String descripcion = request.getParameter("descripcion");
            libro.setDescripcion(descripcion != null && !descripcion.trim().isEmpty() ? descripcion.trim() : "");
            
            String ubicacion = request.getParameter("ubicacion");
            libro.setUbicacion(ubicacion != null && !ubicacion.trim().isEmpty() ? ubicacion.trim() : "");
            
            String urlPortada = request.getParameter("urlPortada");
            libro.setUrlPortada(urlPortada != null && !urlPortada.trim().isEmpty() ? urlPortada.trim() : null);
            
            int stock = 0;
            if (stockStr != null && !stockStr.trim().isEmpty()) {
                try {
                    stock = Integer.parseInt(stockStr.trim());
                } catch (NumberFormatException e) {
                    respuesta.put("success", false);
                    respuesta.put("message", "El stock debe ser un número válido");
                    enviarRespuestaJSON(response, respuesta);
                    return;
                }
            }
            libro.setStock(stock);
            libro.setStockDisponible(stock);
            
            if (libroDAO.existeIsbn(libro.getIsbn(), null)) {
                respuesta.put("success", false);
                respuesta.put("message", "El ISBN ya está registrado");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            boolean creado = libroDAO.crear(libro);
            
            respuesta.put("success", creado);
            respuesta.put("message", creado ? "Libro creado exitosamente" : "Error al crear el libro");
            
        } catch (Exception e) {
            e.printStackTrace();
            respuesta.put("success", false);
            respuesta.put("message", "Error: " + e.getMessage());
        }
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void actualizarLibro(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            Libro libro = libroDAO.obtenerPorId(id);
            if (libro == null) {
                respuesta.put("success", false);
                respuesta.put("message", "Libro no encontrado");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            libro.setNombre(request.getParameter("nombre"));
            libro.setAutor(request.getParameter("autor"));
            libro.setIsbn(request.getParameter("isbn"));
            libro.setEditorial(request.getParameter("editorial"));
            libro.setAnioPublicacion(Integer.parseInt(request.getParameter("anioPublicacion")));
            libro.setGenero(request.getParameter("genero"));
            libro.setDescripcion(request.getParameter("descripcion"));
            libro.setUbicacion(request.getParameter("ubicacion"));
            
            String urlPortada = request.getParameter("urlPortada");
            libro.setUrlPortada(urlPortada != null && !urlPortada.trim().isEmpty() ? urlPortada.trim() : null);
            
            if (libroDAO.existeIsbn(libro.getIsbn(), id)) {
                respuesta.put("success", false);
                respuesta.put("message", "El ISBN ya está registrado en otro libro");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            boolean actualizado = libroDAO.actualizar(libro);
            
            respuesta.put("success", actualizado);
            respuesta.put("message", actualizado ? "Libro actualizado exitosamente" : "Error al actualizar el libro");
            
        } catch (Exception e) {
            respuesta.put("success", false);
            respuesta.put("message", "Error: " + e.getMessage());
        }
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void cambiarEstadoLibro(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean activo = Boolean.parseBoolean(request.getParameter("activo"));
            
            boolean cambiado = libroDAO.cambiarEstado(id, activo);
            
            respuesta.put("success", cambiado);
            respuesta.put("message", cambiado ? 
                "Libro " + (activo ? "activado" : "desactivado") + " exitosamente" : 
                "Error al cambiar el estado del libro");
            
        } catch (Exception e) {
            respuesta.put("success", false);
            respuesta.put("message", "Error: " + e.getMessage());
        }
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void actualizarStock(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            int nuevoStock = Integer.parseInt(request.getParameter("stock"));
            int nuevoStockDisponible = Integer.parseInt(request.getParameter("stockDisponible"));
            
            if (nuevoStock < 0 || nuevoStockDisponible < 0) {
                respuesta.put("success", false);
                respuesta.put("message", "Los valores de stock no pueden ser negativos");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            if (nuevoStockDisponible > nuevoStock) {
                respuesta.put("success", false);
                respuesta.put("message", "El stock disponible no puede ser mayor al stock total");
                enviarRespuestaJSON(response, respuesta);
                return;
            }
            
            boolean actualizado = libroDAO.actualizarStock(id, nuevoStock, nuevoStockDisponible);
            
            respuesta.put("success", actualizado);
            respuesta.put("message", actualizado ? "Stock actualizado exitosamente" : "Error al actualizar el stock");
            
        } catch (Exception e) {
            respuesta.put("success", false);
            respuesta.put("message", "Error: " + e.getMessage());
        }
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private void generarIsbn(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        String isbn = generarIsbnAleatorio();
        
        respuesta.put("success", true);
        respuesta.put("isbn", isbn);
        
        enviarRespuestaJSON(response, respuesta);
    }
    
    private String generarIsbnAleatorio() {
        Random random = new Random();
        StringBuilder isbn = new StringBuilder("978");
        
        for (int i = 0; i < 9; i++) {
            isbn.append(random.nextInt(10));
        }
        
        int checkDigit = calcularDigitoControlISBN13(isbn.toString());
        isbn.append(checkDigit);
        
        return isbn.toString();
    }
    
    private int calcularDigitoControlISBN13(String isbn12) {
        int suma = 0;
        for (int i = 0; i < 12; i++) {
            int digito = Character.getNumericValue(isbn12.charAt(i));
            suma += (i % 2 == 0) ? digito : digito * 3;
        }
        int modulo = suma % 10;
        return (modulo == 0) ? 0 : 10 - modulo;
    }
    
    private void obtenerDetalles(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Libro libro = libroDAO.obtenerPorId(id);
            
            if (libro != null) {
                ObjectNode libroNode = objectMapper.createObjectNode();
                libroNode.put("id", libro.getId());
                libroNode.put("nombre", libro.getNombre());
                libroNode.put("autor", libro.getAutor());
                libroNode.put("isbn", libro.getIsbn());
                libroNode.put("editorial", libro.getEditorial());
                libroNode.put("anioPublicacion", libro.getAnioPublicacion());
                libroNode.put("genero", libro.getGenero());
                libroNode.put("descripcion", libro.getDescripcion());
                libroNode.put("stock", libro.getStock());
                libroNode.put("stockDisponible", libro.getStockDisponible());
                libroNode.put("ubicacion", libro.getUbicacion());
                libroNode.put("urlPortada", libro.getUrlPortada());
                libroNode.put("activo", libro.isActivo());
                
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
    
    private void buscarParaAutocompletado(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        String busqueda = request.getParameter("busqueda");
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        if (busqueda == null || busqueda.trim().isEmpty()) {
            respuesta.put("success", true);
            respuesta.set("libros", objectMapper.createArrayNode());
            enviarRespuestaJSON(response, respuesta);
            return;
        }
        
        List<Libro> libros = libroDAO.buscarParaAutocompletado(busqueda.trim());
        
        respuesta.put("success", true);
        
        ArrayNode librosArray = objectMapper.createArrayNode();
        for (Libro libro : libros) {
            ObjectNode libroNode = objectMapper.createObjectNode();
            libroNode.put("id", libro.getId());
            libroNode.put("isbn", libro.getIsbn());
            libroNode.put("nombre", libro.getNombre());
            libroNode.put("autor", libro.getAutor());
            libroNode.put("stockDisponible", libro.getStockDisponible());
            librosArray.add(libroNode);
        }
        
        respuesta.set("libros", librosArray);
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
