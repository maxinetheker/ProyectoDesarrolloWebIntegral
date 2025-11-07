package controller;

import dao.PrestamoDAO;
import dao.LibroDAO;
import dao.CodigoBarrasDAO;
import model.Prestamo;
import model.CodigoBarras;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
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
    private CodigoBarrasDAO codigoBarrasDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        prestamoDAO = new PrestamoDAO();
        libroDAO = new LibroDAO();
        codigoBarrasDAO = new CodigoBarrasDAO();
        objectMapper = new ObjectMapper();
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd"));
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Validar que el usuario esté autenticado
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            enviarError(response, "Sesión expirada");
            response.setStatus(401);
            return;
        }
        
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
            case "historialPorLibro":
                obtenerHistorialLibro(request, response);
                break;
            default:
                enviarError(response, "Acción no válida");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Validar autenticación y permisos - solo admin y bibliotecario pueden gestionar prestamos
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            enviarError(response, "Sesión expirada");
            response.setStatus(401);
            return;
        }
        
        model.Usuario usuarioSesion = (model.Usuario) session.getAttribute("usuario");
        boolean puedeGestionar = "Administrador".equals(usuarioSesion.getNombreRol()) || 
                                "Bibliotecario".equals(usuarioSesion.getNombreRol());
        
        if (!puedeGestionar) {
            enviarError(response, "No tiene permisos para gestionar préstamos");
            response.setStatus(403);
            return;
        }
        
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
            case "desmarcarMultaPagada":
                desmarcarMultaPagada(request, response);
                break;
            case "actualizarMulta":
                actualizarMulta(request, response);
                break;
            case "deshacerDevolucion":
                deshacerDevolucion(request, response);
                break;
            case "extenderPlazo":
                extenderPlazo(request, response);
                break;
            case "eliminarPrestamo":
                eliminarPrestamo(request, response);
                break;
            default:
                enviarError(response, "Acción no válida");
        }
    }
    
    private void listarDevolucionesPendientes(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            String busqueda = request.getParameter("busqueda");
            String filtroVencimiento = request.getParameter("filtroVencimiento");
            int pagina = 1;
            try {
                pagina = Integer.parseInt(request.getParameter("pagina"));
            } catch (NumberFormatException e) {
                // Usar valor por defecto
            }
            
            int registrosPorPagina = 10;
            List<Prestamo> prestamos = prestamoDAO.listarDevolucionesPendientes(busqueda, filtroVencimiento, pagina, registrosPorPagina);
            int totalRegistros = prestamoDAO.contarDevolucionesPendientes(busqueda, filtroVencimiento);
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
            String observaciones = request.getParameter("observaciones");
            
            // Validar que el usuario tenga un código de barras activo y no vencido
            CodigoBarras codigoBarras = codigoBarrasDAO.buscarPorUsuario(usuarioId);
            if (codigoBarras == null) {
                enviarError(response, "El usuario no tiene un código de barras/carnet generado. Por favor, genere el carnet desde la sección de usuarios.");
                return;
            }
            
            if (!codigoBarras.isActivo()) {
                enviarError(response, "El carnet del usuario está inactivo. Por favor, genere uno nuevo.");
                return;
            }
            if (codigoBarras.getFechaCaducidad().isBefore(java.time.LocalDateTime.now())) {
                enviarError(response, "El carnet del usuario está vencido. Por favor, renueve el carnet desde la sección de usuarios.");
                return;
            }
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
            prestamo.setObservacionesEntrega(observaciones != null && !observaciones.trim().isEmpty() ? observaciones : null);
            
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, diasPrestamo);
            prestamo.setFechaDevolucionEsperada(cal.getTime());
            
            boolean creado = prestamoDAO.crear(prestamo);
            
            if (creado) {
                libroDAO.ajustarStockDisponible(libroId, -1);
                
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
    
    private void desmarcarMultaPagada(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            boolean actualizado = prestamoDAO.desmarcarMultaPagada(id);
            
            if (actualizado) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Pago de multa deshecho");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al deshacer pago de multa");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al deshacer pago de multa");
        }
    }
    
    private void actualizarMulta(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            BigDecimal nuevaMulta = new BigDecimal(request.getParameter("multa"));
            
            boolean actualizado = prestamoDAO.actualizarMulta(id, nuevaMulta);
            
            if (actualizado) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Multa actualizada correctamente");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al actualizar multa");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al actualizar multa");
        }
    }
    
    private void deshacerDevolucion(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            boolean actualizado = prestamoDAO.deshacerDevolucion(id);
            
            if (actualizado) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("message", "Devolución deshecha correctamente");
                
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                objectMapper.writeValue(response.getWriter(), resultado);
            } else {
                enviarError(response, "Error al deshacer devolución");
            }
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al deshacer devolución");
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
    
    private void extenderPlazo(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            int diasAdicionales = Integer.parseInt(request.getParameter("diasAdicionales"));
            String observaciones = request.getParameter("observaciones");
            
            if (diasAdicionales <= 0 || diasAdicionales > 30) {
                enviarError(response, "Los días adicionales deben estar entre 1 y 30");
                return;
            }
            
            boolean extendido = prestamoDAO.extenderPlazo(id, diasAdicionales, observaciones);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", extendido);
            resultado.put("message", extendido ? "Plazo extendido exitosamente" : "No se pudo extender el plazo");
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (NumberFormatException e) {
            enviarError(response, "Datos inválidos");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al extender el plazo");
        }
    }
    
    private void eliminarPrestamo(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            boolean eliminado = prestamoDAO.eliminarPrestamo(id);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", eliminado);
            resultado.put("message", eliminado ? "Préstamo eliminado y stock restaurado exitosamente" : "No se pudo eliminar el préstamo");
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), resultado);
        } catch (NumberFormatException e) {
            enviarError(response, "ID inválido");
        } catch (Exception e) {
            e.printStackTrace();
            enviarError(response, "Error al eliminar el préstamo");
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
