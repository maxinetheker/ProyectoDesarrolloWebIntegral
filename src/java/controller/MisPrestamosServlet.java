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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/mis-prestamos")
public class MisPrestamosServlet extends HttpServlet {

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
            obtenerPrestamosUsuario(request, response, usuario);
        } else {
            // Redirigir a la página principal
            request.getRequestDispatcher("pages/mis-prestamos.jsp").forward(request, response);
        }
    }

    private void obtenerPrestamosUsuario(HttpServletRequest request, HttpServletResponse response, Usuario usuario) 
            throws IOException {
        
        String estado = request.getParameter("estado"); // "todos", "prestado", "devuelto", "vencido"
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
            List<Prestamo> todosPrestamos = prestamoDAO.obtenerPrestamosPorUsuario(usuario.getId());
            
            // Agregar información de vencimiento antes de filtrar
            Date fechaActual = new Date();
            for (Prestamo prestamo : todosPrestamos) {
                // Verificar si está vencido (solo para préstamos activos)
                if ("prestado".equals(prestamo.getEstado()) && 
                    prestamo.getFechaDevolucionEsperada() != null && 
                    prestamo.getFechaDevolucionEsperada().before(fechaActual)) {
                    prestamo.setEstado("vencido");
                }
            }
            
            // Filtrar por estado si se proporciona
            if (estado != null && !estado.trim().isEmpty() && !"todos".equals(estado)) {
                todosPrestamos = todosPrestamos.stream()
                    .filter(prestamo -> estado.equals(prestamo.getEstado()))
                    .toList();
            }
            
            // Filtrar por término de búsqueda si se proporciona
            if (termino != null && !termino.trim().isEmpty()) {
                String terminoLower = termino.toLowerCase().trim();
                todosPrestamos = todosPrestamos.stream()
                    .filter(prestamo -> 
                        prestamo.getLibroTitulo().toLowerCase().contains(terminoLower) ||
                        prestamo.getLibroAutor().toLowerCase().contains(terminoLower) ||
                        prestamo.getLibroIsbn().toLowerCase().contains(terminoLower)
                    )
                    .toList();
            }
            
            // Calcular información de paginación
            int totalElementos = todosPrestamos.size();
            int totalPaginas = (int) Math.ceil((double) totalElementos / elementosPorPagina);
            
            // Aplicar paginación
            int inicio = (pagina - 1) * elementosPorPagina;
            int fin = Math.min(inicio + elementosPorPagina, totalElementos);
            
            List<Prestamo> prestamosParaPagina = todosPrestamos.subList(inicio, fin);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("prestamos", prestamosParaPagina);
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
            error.put("error", "Error al obtener los préstamos: " + e.getMessage());
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            PrintWriter out = response.getWriter();
            out.print(objectMapper.writeValueAsString(error));
            out.flush();
        }
    }
}