package controller;

import dao.PrestamoDAO;
import dao.LibroDAO;
import model.Prestamo;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Calendar;

@WebServlet(name = "PrestamoServlet", urlPatterns = {"/prestamos"})
public class PrestamoServlet extends HttpServlet {
    
    private PrestamoDAO prestamoDAO;
    private LibroDAO libroDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        prestamoDAO = new PrestamoDAO();
        libroDAO = new LibroDAO();
        objectMapper = new ObjectMapper();
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd"));
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String accion = request.getParameter("accion");
        
        if (accion == null) {
            accion = "listarDevolucionesPendientes";
        }
        
        switch (accion) {
            case "listarDevolucionesPendientes":
                listarDevolucionesPendientes(request, response);
                break;
            case "listarLibrosDevueltos":
                listarLibrosDevueltos(request, response);
                break;
            case "listarMultasPendientes":
                listarMultasPendientes(request, response);
                break;
            case "listarMultasPagadas":
                listarMultasPagadas(request, response);
                break;
            case "obtener":
                obtenerPrestamo(request, response);
                break;
            case "historialLibro":
                obtenerHistorialLibro(request, response);
                break;
            default:
                enviarError(response, "Acción no válida");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String accion = request.getParameter("accion");
        
        if (accion == null) {
            enviarError(response, "Acción no especificada");
            return;
        }
        
        switch (accion) {
            case "crear":
                crearPrestamo(request, response);
                break;
            case "registrarDevolucion":
                registrarDevolucion(request, response);
                break;
            case "marcarMultaPagada":
                marcarMultaPagada(request, response);
                break;
            default:
                enviarError(response, "Acción no válida");
        }
    }
    
    private void listarDevolucionesPendientes(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            String busqueda = request.getParameter("busqueda");
            int pagina = 1;
            try {
                pagina = Integer.parseInt(request.getParameter("pagina"));
            } catch (NumberFormatException e) {
                // Usar valor por defecto
            }
            
            int registrosPorPagina = 10;
            List<Prestamo> prestamos = prestamoDAO.listarDevolucionesPendientes(busqueda, pagina, registrosPorPagina);
            int totalRegistros = prestamoDAO.contarDevolucionesPendientes(busqueda);
            int totalPaginas = (int) Math.ceil((double) totalRegistros / registrosPorPagina);
            
            int registroInicio = (pagina - 1) * registrosPorPagina + 1;
            int registroFin = Math.min(pagina * registrosPorPagina, totalRegistros);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("prestamos", prestamos);
            resultado.put("totalRegistros", totalRegistros);
            resultado.put("totalPaginas", totalPaginas);
            resultado.put("paginaActual", pagina);
            resultado.put("registroInicio", registroInicio);
            resultado.put("registroFin", registroFin);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al listar devoluciones pendientes");
        }
    }
    
    private void listarLibrosDevueltos(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            String busqueda = request.getParameter("busqueda");
            int pagina = 1;
            try {
                pagina = Integer.parseInt(request.getParameter("pagina"));
            } catch (NumberFormatException e) {
                // Usar valor por defecto
            }
            
            int registrosPorPagina = 10;
            List<Prestamo> prestamos = prestamoDAO.listarLibrosDevueltos(busqueda, pagina, registrosPorPagina);
            int totalRegistros = prestamoDAO.contarLibrosDevueltos(busqueda);
            int totalPaginas = (int) Math.ceil((double) totalRegistros / registrosPorPagina);
            
            int registroInicio = (pagina - 1) * registrosPorPagina + 1;
            int registroFin = Math.min(pagina * registrosPorPagina, totalRegistros);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("prestamos", prestamos);
            resultado.put("totalRegistros", totalRegistros);
            resultado.put("totalPaginas", totalPaginas);
            resultado.put("paginaActual", pagina);
            resultado.put("registroInicio", registroInicio);
            resultado.put("registroFin", registroFin);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al listar libros devueltos");
        }
    }
    
    private void listarMultasPendientes(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            String busqueda = request.getParameter("busqueda");
            int pagina = 1;
            try {
                pagina = Integer.parseInt(request.getParameter("pagina"));
            } catch (NumberFormatException e) {
                // Usar valor por defecto
            }
            
            int registrosPorPagina = 10;
            List<Prestamo> prestamos = prestamoDAO.listarMultasPendientes(busqueda, pagina, registrosPorPagina);
            int totalRegistros = prestamoDAO.contarMultasPendientes(busqueda);
            int totalPaginas = (int) Math.ceil((double) totalRegistros / registrosPorPagina);
            
            int registroInicio = (pagina - 1) * registrosPorPagina + 1;
            int registroFin = Math.min(pagina * registrosPorPagina, totalRegistros);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("prestamos", prestamos);
            resultado.put("totalRegistros", totalRegistros);
            resultado.put("totalPaginas", totalPaginas);
            resultado.put("paginaActual", pagina);
            resultado.put("registroInicio", registroInicio);
            resultado.put("registroFin", registroFin);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al listar multas pendientes");
        }
    }
    
    private void listarMultasPagadas(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            String busqueda = request.getParameter("busqueda");
            int pagina = 1;
            try {
                pagina = Integer.parseInt(request.getParameter("pagina"));
            } catch (NumberFormatException e) {
                // Usar valor por defecto
            }
            
            int registrosPorPagina = 10;
            List<Prestamo> prestamos = prestamoDAO.listarMultasPagadas(busqueda, pagina, registrosPorPagina);
            int totalRegistros = prestamoDAO.contarMultasPagadas(busqueda);
            int totalPaginas = (int) Math.ceil((double) totalRegistros / registrosPorPagina);
            
            int registroInicio = (pagina - 1) * registrosPorPagina + 1;
            int registroFin = Math.min(pagina * registrosPorPagina, totalRegistros);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("prestamos", prestamos);
            resultado.put("totalRegistros", totalRegistros);
            resultado.put("totalPaginas", totalPaginas);
            resultado.put("paginaActual", pagina);
            resultado.put("registroInicio", registroInicio);
            resultado.put("registroFin", registroFin);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al listar multas pagadas");
        }
    }
    
    private void crearPrestamo(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int libroId = Integer.parseInt(request.getParameter("libroId"));
            int usuarioId = Integer.parseInt(request.getParameter("usuarioId"));
            int diasPrestamo = Integer.parseInt(request.getParameter("diasPrestamo"));
            
            // Verificar que el libro tenga stock disponible
            var libro = libroDAO.obtenerPorId(libroId);
            if (libro == null) {
                enviarError(response, "Libro no encontrado");
                return;
            }
            
            if (libro.getStockDisponible() <= 0) {
                enviarError(response, "No hay stock disponible de este libro");
                return;
            }
            
            Prestamo prestamo = new Prestamo();
            prestamo.setLibroId(libroId);
            prestamo.setUsuarioId(usuarioId);
            prestamo.setFechaPrestamo(new Date());
            
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, diasPrestamo);
            prestamo.setFechaDevolucionEsperada(cal.getTime());
            
            boolean creado = prestamoDAO.crear(prestamo);
            
            if (creado) {
                // Actualizar stock disponible
                libroDAO.actualizarStock(libroId, libro.getStock(), libro.getStockDisponible() - 1);
                
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Préstamo registrado exitosamente");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al crear el préstamo");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al crear el préstamo");
        }
    }
    
    private void registrarDevolucion(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            String estado = request.getParameter("estado"); // devuelto, vencido, perdido
            String multaStr = request.getParameter("multa");
            String observaciones = request.getParameter("observaciones");
            
            BigDecimal multa = BigDecimal.ZERO;
            if (multaStr != null && !multaStr.isEmpty()) {
                multa = new BigDecimal(multaStr);
            }
            
            Prestamo prestamo = prestamoDAO.obtenerPorId(id);
            if (prestamo == null) {
                enviarError(response, "Préstamo no encontrado");
                return;
            }
            
            boolean actualizado = prestamoDAO.registrarDevolucion(id, estado, multa, observaciones);
            
            if (actualizado) {
                // Si el libro fue devuelto (no perdido), incrementar stock disponible
                if ("devuelto".equals(estado) || "vencido".equals(estado)) {
                    var libro = libroDAO.obtenerPorId(prestamo.getLibroId());
                    if (libro != null) {
                        libroDAO.actualizarStock(libro.getId(), libro.getStock(), libro.getStockDisponible() + 1);
                    }
                }
                
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Devolución registrada exitosamente");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al registrar devolución");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al registrar devolución");
        }
    }
    
    private void marcarMultaPagada(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            boolean actualizado = prestamoDAO.marcarMultaPagada(id);
            
            if (actualizado) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Multa marcada como pagada");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al marcar multa como pagada");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al marcar multa como pagada");
        }
    }
    
    private void obtenerPrestamo(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Prestamo prestamo = prestamoDAO.obtenerPorId(id);
            
            if (prestamo != null) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("prestamo", prestamo);
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Préstamo no encontrado");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "ID inválido");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al obtener préstamo");
        }
    }
    
    private void obtenerHistorialLibro(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int libroId = Integer.parseInt(request.getParameter("libroId"));
            List<Prestamo> historial = prestamoDAO.obtenerHistorialPorLibro(libroId);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("historial", historial);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (NumberFormatException e) {
            enviarError(response, "ID inválido");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al obtener historial");
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
