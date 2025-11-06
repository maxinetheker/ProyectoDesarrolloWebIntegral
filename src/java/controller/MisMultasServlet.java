package controller;

import dao.PrestamoDAO;
import model.Prestamo;
import model.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/mis-multas")
public class MisMultasServlet extends HttpServlet {

    private PrestamoDAO prestamoDAO;
    private ObjectMapper objectMapper;

    @Override
    public void init() throws ServletException {
        super.init();
        prestamoDAO = new PrestamoDAO();
        objectMapper = new ObjectMapper();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.sendRedirect("pages/login.jsp?sessionExpired=true");
            return;
        }

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        String accion = request.getParameter("accion");

        if ("obtener".equals(accion)) {
            obtenerMultasUsuario(request, response, usuario);
        } else {
            // Redirigir a la página principal
            request.getRequestDispatcher("pages/mis-multas.jsp").forward(request, response);
        }
    }

    private void obtenerMultasUsuario(HttpServletRequest request, HttpServletResponse response, Usuario usuario) 
            throws IOException {
        
        String filtro = request.getParameter("filtro"); // "todas", "pagadas", "pendientes"
        String termino = request.getParameter("termino");
        
        try {
            List<Prestamo> multas;
            
            if ("pagadas".equals(filtro)) {
                multas = prestamoDAO.obtenerMultasPagadasPorUsuario(usuario.getId());
            } else if ("pendientes".equals(filtro)) {
                multas = prestamoDAO.obtenerMultasPendientesPorUsuario(usuario.getId());
            } else {
                // Todas las multas
                multas = prestamoDAO.obtenerTodasMultasPorUsuario(usuario.getId());
            }
            
            // Filtrar por término de búsqueda si se proporciona
            if (termino != null && !termino.trim().isEmpty()) {
                String terminoLower = termino.toLowerCase().trim();
                multas = multas.stream()
                    .filter(multa -> 
                        multa.getLibroTitulo().toLowerCase().contains(terminoLower) ||
                        multa.getLibroAutor().toLowerCase().contains(terminoLower) ||
                        multa.getLibroIsbn().toLowerCase().contains(terminoLower)
                    )
                    .toList();
            }
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("multas", multas);
            resultado.put("total", multas.size());
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            PrintWriter out = response.getWriter();
            out.print(objectMapper.writeValueAsString(resultado));
            out.flush();
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las multas: " + e.getMessage());
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            PrintWriter out = response.getWriter();
            out.print(objectMapper.writeValueAsString(error));
            out.flush();
        }
    }
}