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
            request.getRequestDispatcher("pages/mis-multas.jsp").forward(request, response);
        }
    }

    private void obtenerMultasUsuario(HttpServletRequest request, HttpServletResponse response, Usuario usuario) 
            throws IOException {
        
        String estado = request.getParameter("estado"); // "todas", "pagadas", "pendientes"
        String termino = request.getParameter("termino");
        String paginaStr = request.getParameter("pagina");
        String elementosPorPaginaStr = request.getParameter("elementosPorPagina");
        
        // Valores por defecto para paginación
        int pagina = 1;
        int elementosPorPagina = 10;
        
        try {
            if (paginaStr != null && !paginaStr.isEmpty()) {
                pagina = Integer.parseInt(paginaStr);
            }
            if (elementosPorPaginaStr != null && !elementosPorPaginaStr.isEmpty()) {
                elementosPorPagina = Integer.parseInt(elementosPorPaginaStr);
            }
        } catch (NumberFormatException e) {
            // Usar valores por defecto
        }
        
        try {
            List<Prestamo> todasMultas;
            
            if ("pagadas".equals(estado)) {
                todasMultas = prestamoDAO.obtenerMultasPagadasPorUsuario(usuario.getId());
            } else if ("pendientes".equals(estado)) {
                todasMultas = prestamoDAO.obtenerMultasPendientesPorUsuario(usuario.getId());
            } else {
                // Todas las multas
                todasMultas = prestamoDAO.obtenerTodasMultasPorUsuario(usuario.getId());
            }
            
            // Filtrar por término de búsqueda si se proporciona
            if (termino != null && !termino.trim().isEmpty()) {
                String terminoLower = termino.toLowerCase().trim();
                todasMultas = todasMultas.stream()
                    .filter(multa -> 
                        multa.getLibroTitulo().toLowerCase().contains(terminoLower) ||
                        multa.getLibroAutor().toLowerCase().contains(terminoLower) ||
                        multa.getLibroIsbn().toLowerCase().contains(terminoLower)
                    )
                    .toList();
            }
            
            // Calcular información de paginación
            int totalElementos = todasMultas.size();
            int totalPaginas = (int) Math.ceil((double) totalElementos / elementosPorPagina);
            
            // Aplicar paginación
            int inicio = (pagina - 1) * elementosPorPagina;
            int fin = Math.min(inicio + elementosPorPagina, totalElementos);
            
            List<Prestamo> multasParaPagina = todasMultas.subList(inicio, fin);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("multas", multasParaPagina);
            resultado.put("total", totalElementos);
            resultado.put("totalPaginas", totalPaginas);
            resultado.put("paginaActual", pagina);
            resultado.put("elementosPorPagina", elementosPorPagina);
            
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