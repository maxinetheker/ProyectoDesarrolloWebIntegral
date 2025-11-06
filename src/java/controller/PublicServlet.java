package controller;

import dao.LibroDAO;
import dao.UsuarioDAO;
import model.Libro;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "PublicServlet", urlPatterns = {"/public"})
public class PublicServlet extends HttpServlet {
    
    private LibroDAO libroDAO;
    private UsuarioDAO usuarioDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        libroDAO = new LibroDAO();
        usuarioDAO = new UsuarioDAO();
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String accion = request.getParameter("accion");
        
        if (accion == null) {
            accion = "estadisticas";
        }
        
        switch (accion) {
            case "estadisticas":
                obtenerEstadisticas(request, response);
                break;
            case "librosMasPrestados":
                obtenerLibrosMasPrestados(request, response);
                break;
            default:
                enviarError(response, "Acción no válida");
        }
    }
    
    private void obtenerEstadisticas(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int totalLibros = libroDAO.contarTotal();
            int totalUsuariosActivos = usuarioDAO.contarUsuariosActivos();
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("totalLibros", totalLibros);
            resultado.put("totalUsuariosActivos", totalUsuariosActivos);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al obtener estadísticas");
        }
    }
    
    private void obtenerLibrosMasPrestados(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            List<Libro> libros = libroDAO.obtenerLibrosMasPrestados(10);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("libros", libros);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al obtener libros más prestados");
        }
    }
    
    private void enviarError(HttpServletResponse response, String mensaje) throws IOException {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("success", false);
        resultado.put("message", mensaje);
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), resultado);
    }
}
