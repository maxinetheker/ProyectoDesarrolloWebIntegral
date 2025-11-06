package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.*;
import model.Usuario;
import singleton.DatabaseConnection;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

@WebServlet(name = "DashboardServlet", urlPatterns = {"/dashboard"})
public class DashboardServlet extends HttpServlet {
    
    private LibroDAO libroDAO;
    private UsuarioDAO usuarioDAO;
    private PrestamoDAO prestamoDAO;
    private CodigoBarrasDAO codigoBarrasDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        libroDAO = new LibroDAO();
        usuarioDAO = new UsuarioDAO();
        prestamoDAO = new PrestamoDAO();
        codigoBarrasDAO = new CodigoBarrasDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Verificar sesión activa
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"No autorizado\"}");
            return;
        }
        
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        String action = request.getParameter("action");
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ObjectMapper mapper = new ObjectMapper();
        
        try {
            if ("biblioteca".equals(action)) {
                // Solo admin y bibliotecario pueden ver stats generales
                if ("Administrador".equals(usuario.getNombreRol()) || 
                    "Bibliotecario".equals(usuario.getNombreRol())) {
                    Map<String, Object> stats = obtenerEstadisticasBiblioteca();
                    response.getWriter().write(mapper.writeValueAsString(stats));
                } else {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\": \"Acceso denegado\"}");
                }
            } else if ("personal".equals(action)) {
                // Stats personales - todos los usuarios
                Map<String, Object> stats = obtenerEstadisticasPersonales(usuario.getId());
                response.getWriter().write(mapper.writeValueAsString(stats));
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Acción no válida\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    // Estadísticas generales de la biblioteca
    private Map<String, Object> obtenerEstadisticasBiblioteca() throws SQLException {
        Map<String, Object> stats = new HashMap<>();
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            
            stats.put("librosNuevos", obtenerLibrosNuevos(conn));
            stats.put("cantidadUsuarios", obtenerCantidadUsuarios(conn));
            stats.put("librosPrestados", obtenerLibrosPrestados(conn));
            stats.put("multas", obtenerEstadisticasMultas(conn));
            stats.put("carnetsGenerados", obtenerCarnetsGenerados(conn));
            
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return stats;
    }
    
    // Stats del usuario actual
    private Map<String, Object> obtenerEstadisticasPersonales(int idUsuario) throws SQLException {
        Map<String, Object> stats = new HashMap<>();
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            
            stats.put("librosLeidos", obtenerLibrosLeidosPorUsuario(conn, idUsuario));
            stats.put("prestamosDevueltos", obtenerPrestamosDevueltosPorUsuario(conn, idUsuario));
            stats.put("deudas", obtenerDeudasPorUsuario(conn, idUsuario));
            
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return stats;
    }
    
    // Libros registrados en los ultimos 6 meses
    private Map<String, Object> obtenerLibrosNuevos(Connection conn) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT DATE_FORMAT(fecha_registro, '%Y-%m') as mes, COUNT(*) as total " +
                    "FROM libro " +
                    "WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND activo = 1 " +
                    "GROUP BY mes " +
                    "ORDER BY mes ASC";
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        int totalLibros = libroDAO.contarLibrosActivos();
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                labels.add(rs.getString("mes"));
                data.add(rs.getInt("total"));
            }
        }
        
        result.put("labels", labels);
        result.put("data", data);
        result.put("total", totalLibros);
        
        return result;
    }
    
    // Usuarios nuevos por mes
    private Map<String, Object> obtenerCantidadUsuarios(Connection conn) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, COUNT(*) as total " +
                    "FROM usuario " +
                    "WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND activo = 1 " +
                    "GROUP BY mes " +
                    "ORDER BY mes ASC";
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        int totalUsuarios = usuarioDAO.contarUsuariosActivos();
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                labels.add(rs.getString("mes"));
                data.add(rs.getInt("total"));
            }
        }
        
        result.put("labels", labels);
        result.put("data", data);
        result.put("total", totalUsuarios);
        
        return result;
    }
    
    // Prestamos realizados por mes
    private Map<String, Object> obtenerLibrosPrestados(Connection conn) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT DATE_FORMAT(fecha_entrega, '%Y-%m') as mes, COUNT(*) as total " +
                    "FROM entregas " +
                    "WHERE fecha_entrega >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                    "GROUP BY mes " +
                    "ORDER BY mes ASC";
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        
        // Contar prestamos activos actuales
        String sqlTotal = "SELECT COUNT(*) as total FROM entregas WHERE estado IN ('prestado', 'vencido')";
        int totalPrestados = 0;
        
        try (PreparedStatement ps = conn.prepareStatement(sqlTotal);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                totalPrestados = rs.getInt("total");
            }
        }
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                labels.add(rs.getString("mes"));
                data.add(rs.getInt("total"));
            }
        }
        
        result.put("labels", labels);
        result.put("data", data);
        result.put("total", totalPrestados);
        
        return result;
    }
    
    // Info de multas pagadas vs pendientes
    private Map<String, Object> obtenerEstadisticasMultas(Connection conn) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT " +
                    "SUM(CASE WHEN pagado = 1 THEN multa ELSE 0 END) as pagadas, " +
                    "SUM(CASE WHEN pagado = 0 OR pagado IS NULL THEN multa ELSE 0 END) as pendientes, " +
                    "COUNT(CASE WHEN pagado = 1 THEN 1 END) as cantidad_pagadas, " +
                    "COUNT(CASE WHEN pagado = 0 OR pagado IS NULL THEN 1 END) as cantidad_pendientes " +
                    "FROM entregas " +
                    "WHERE multa > 0";
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            if (rs.next()) {
                BigDecimal pagadas = rs.getBigDecimal("pagadas");
                BigDecimal pendientes = rs.getBigDecimal("pendientes");
                int cantPagadas = rs.getInt("cantidad_pagadas");
                int cantPendientes = rs.getInt("cantidad_pendientes");
                
                result.put("pagadas", pagadas != null ? pagadas.doubleValue() : 0);
                result.put("pendientes", pendientes != null ? pendientes.doubleValue() : 0);
                result.put("cantidadPagadas", cantPagadas);
                result.put("cantidadPendientes", cantPendientes);
                result.put("total", cantPagadas + cantPendientes);
            }
        }
        
        return result;
    }
    
    // Carnets generados en los ultimos meses
    private Map<String, Object> obtenerCarnetsGenerados(Connection conn) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, COUNT(*) as total " +
                    "FROM codigos_barras " +
                    "WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND activo = 1 " +
                    "GROUP BY mes " +
                    "ORDER BY mes ASC";
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        
        // Total de carnets vigentes
        String sqlTotal = "SELECT COUNT(*) as total FROM codigos_barras WHERE activo = 1";
        int totalCarnets = 0;
        
        try (PreparedStatement ps = conn.prepareStatement(sqlTotal);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                totalCarnets = rs.getInt("total");
            }
        }
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                labels.add(rs.getString("mes"));
                data.add(rs.getInt("total"));
            }
        }
        
        result.put("labels", labels);
        result.put("data", data);
        result.put("total", totalCarnets);
        
        return result;
    }
    
    // Libros que el usuario ya devolvio (leyo)
    private Map<String, Object> obtenerLibrosLeidosPorUsuario(Connection conn, int idUsuario) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT DATE_FORMAT(fecha_devolucion_real, '%Y-%m') as mes, COUNT(*) as total " +
                    "FROM entregas " +
                    "WHERE id_usuario = ? " +
                    "AND fecha_devolucion_real >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                    "AND estado = 'devuelto' " +
                    "GROUP BY mes " +
                    "ORDER BY mes ASC";
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        
        // Contar todos los libros devueltos del usuario
        String sqlTotal = "SELECT COUNT(*) as total FROM entregas WHERE id_usuario = ? AND estado = 'devuelto'";
        int totalLeidos = 0;
        
        try (PreparedStatement ps = conn.prepareStatement(sqlTotal)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    totalLeidos = rs.getInt("total");
                }
            }
        }
        
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    labels.add(rs.getString("mes"));
                    data.add(rs.getInt("total"));
                }
            }
        }
        
        result.put("labels", labels);
        result.put("data", data);
        result.put("total", totalLeidos);
        
        return result;
    }
    
    // Comparar prestamos actuales vs devueltos del usuario
    private Map<String, Object> obtenerPrestamosDevueltosPorUsuario(Connection conn, int idUsuario) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT " +
                    "COUNT(CASE WHEN estado IN ('prestado', 'vencido') THEN 1 END) as prestados, " +
                    "COUNT(CASE WHEN estado = 'devuelto' THEN 1 END) as devueltos " +
                    "FROM entregas " +
                    "WHERE id_usuario = ?";
        
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int prestados = rs.getInt("prestados");
                    int devueltos = rs.getInt("devueltos");
                    
                    result.put("prestados", prestados);
                    result.put("devueltos", devueltos);
                    result.put("total", prestados + devueltos);
                }
            }
        }
        
        return result;
    }
    
    // Deudas del usuario - cuanto pago y cuanto debe
    private Map<String, Object> obtenerDeudasPorUsuario(Connection conn, int idUsuario) throws SQLException {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT " +
                    "SUM(CASE WHEN pagado = 1 THEN multa ELSE 0 END) as pagada, " +
                    "SUM(CASE WHEN pagado = 0 OR pagado IS NULL THEN multa ELSE 0 END) as pendiente " +
                    "FROM entregas " +
                    "WHERE id_usuario = ? AND multa > 0";
        
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    BigDecimal pagada = rs.getBigDecimal("pagada");
                    BigDecimal pendiente = rs.getBigDecimal("pendiente");
                    
                    double pagas = pagada != null ? pagada.doubleValue() : 0;
                    double pend = pendiente != null ? pendiente.doubleValue() : 0;
                    
                    result.put("pagada", pagas);
                    result.put("pendiente", pend);
                    result.put("total", pagas + pend);
                }
            }
        }
        
        return result;
    }
}
