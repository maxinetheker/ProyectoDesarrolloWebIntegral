package dao;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Prestamo;
import singleton.DatabaseConnection;

public class PrestamoDAO {
    
    public List<Prestamo> listarDevolucionesPendientes(String busqueda, String filtroVencimiento, int pagina, int registrosPorPagina) {
        List<Prestamo> prestamos = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, ");
            sql.append("e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, ");
            sql.append("l.nombre as libro_nombre, l.isbn as libro_isbn, ");
            sql.append("CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni ");
            sql.append("FROM entregas e ");
            sql.append("INNER JOIN libro l ON e.id_libro = l.id ");
            sql.append("INNER JOIN usuario u ON e.id_usuario = u.id ");
            sql.append("WHERE e.estado IN ('prestado', 'vencido') ");
            
            // Filtro de vencimiento
            if (filtroVencimiento != null && !filtroVencimiento.isEmpty()) {
                if ("vencidos".equals(filtroVencimiento)) {
                    sql.append("AND e.fecha_devolucion_programada < NOW() ");
                } else if ("no_vencidos".equals(filtroVencimiento)) {
                    sql.append("AND e.fecha_devolucion_programada >= NOW() ");
                }
                // Si es "todos", no agregamos filtro adicional
            }
            
            if (busqueda != null && !busqueda.isEmpty()) {
                sql.append("AND (l.nombre LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?) ");
            }
            
            sql.append("ORDER BY e.fecha_devolucion_programada ASC ");
            sql.append("LIMIT ? OFFSET ?");
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql.toString());
            
            int paramIndex = 1;
            if (busqueda != null && !busqueda.isEmpty()) {
                String searchPattern = "%" + busqueda + "%";
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
            }
            
            stmt.setInt(paramIndex++, registrosPorPagina);
            stmt.setInt(paramIndex, offset);
            
            rs = stmt.executeQuery();
            while (rs.next()) {
                prestamos.add(mapearPrestamo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return prestamos;
    }
    
    public List<Prestamo> listarLibrosDevueltos(String busqueda, int pagina, int registrosPorPagina) {
        List<Prestamo> prestamos = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, ");
            sql.append("e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, ");
            sql.append("l.nombre as libro_nombre, l.isbn as libro_isbn, ");
            sql.append("CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni ");
            sql.append("FROM entregas e ");
            sql.append("INNER JOIN libro l ON e.id_libro = l.id ");
            sql.append("INNER JOIN usuario u ON e.id_usuario = u.id ");
            sql.append("WHERE e.estado = 'devuelto' ");
            
            if (busqueda != null && !busqueda.isEmpty()) {
                sql.append("AND (l.nombre LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?) ");
            }
            
            sql.append("ORDER BY e.fecha_devolucion_real DESC ");
            sql.append("LIMIT ? OFFSET ?");
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql.toString());
            
            int paramIndex = 1;
            if (busqueda != null && !busqueda.isEmpty()) {
                String searchPattern = "%" + busqueda + "%";
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
            }
            
            stmt.setInt(paramIndex++, registrosPorPagina);
            stmt.setInt(paramIndex, offset);
            
            rs = stmt.executeQuery();
            while (rs.next()) {
                prestamos.add(mapearPrestamo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return prestamos;
    }
    
    public List<Prestamo> listarMultasPendientes(String busqueda, int pagina, int registrosPorPagina) {
        List<Prestamo> prestamos = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, ");
            sql.append("e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, ");
            sql.append("l.nombre as libro_nombre, l.isbn as libro_isbn, ");
            sql.append("CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni ");
            sql.append("FROM entregas e ");
            sql.append("INNER JOIN libro l ON e.id_libro = l.id ");
            sql.append("INNER JOIN usuario u ON e.id_usuario = u.id ");
            sql.append("WHERE e.multa > 0 AND e.pagado = 0 ");
            
            if (busqueda != null && !busqueda.isEmpty()) {
                sql.append("AND (l.nombre LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?) ");
            }
            
            sql.append("ORDER BY e.multa DESC ");
            sql.append("LIMIT ? OFFSET ?");
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql.toString());
            
            int paramIndex = 1;
            if (busqueda != null && !busqueda.isEmpty()) {
                String searchPattern = "%" + busqueda + "%";
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
            }
            
            stmt.setInt(paramIndex++, registrosPorPagina);
            stmt.setInt(paramIndex, offset);
            
            rs = stmt.executeQuery();
            while (rs.next()) {
                prestamos.add(mapearPrestamo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return prestamos;
    }
    
    public List<Prestamo> listarMultasPagadas(String busqueda, int pagina, int registrosPorPagina) {
        List<Prestamo> prestamos = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, ");
            sql.append("e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, ");
            sql.append("l.nombre as libro_nombre, l.isbn as libro_isbn, ");
            sql.append("CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni ");
            sql.append("FROM entregas e ");
            sql.append("INNER JOIN libro l ON e.id_libro = l.id ");
            sql.append("INNER JOIN usuario u ON e.id_usuario = u.id ");
            sql.append("WHERE e.multa > 0 AND e.pagado = 1 ");
            
            if (busqueda != null && !busqueda.isEmpty()) {
                sql.append("AND (l.nombre LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?) ");
            }
            
            sql.append("ORDER BY e.fecha_devolucion_real DESC ");
            sql.append("LIMIT ? OFFSET ?");
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql.toString());
            
            int paramIndex = 1;
            if (busqueda != null && !busqueda.isEmpty()) {
                String searchPattern = "%" + busqueda + "%";
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
                stmt.setString(paramIndex++, searchPattern);
            }
            
            stmt.setInt(paramIndex++, registrosPorPagina);
            stmt.setInt(paramIndex, offset);
            
            rs = stmt.executeQuery();
            while (rs.next()) {
                prestamos.add(mapearPrestamo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return prestamos;
    }
    
    public int contarDevolucionesPendientes(String busqueda, String filtroVencimiento) {
        String condicion = "e.estado IN ('prestado', 'vencido')";
        
        // Agregar filtro de vencimiento
        if (filtroVencimiento != null && !filtroVencimiento.isEmpty()) {
            if ("vencidos".equals(filtroVencimiento)) {
                condicion += " AND e.fecha_devolucion_programada < NOW()";
            } else if ("no_vencidos".equals(filtroVencimiento)) {
                condicion += " AND e.fecha_devolucion_programada >= NOW()";
            }
        }
        
        return contarPrestamos(condicion, busqueda);
    }
    
    public int contarLibrosDevueltos(String busqueda) {
        return contarPrestamos("e.estado = 'devuelto'", busqueda);
    }
    
    public int contarMultasPendientes(String busqueda) {
        return contarPrestamos("e.multa > 0 AND e.pagado = 0", busqueda);
    }
    
    public int contarMultasPagadas(String busqueda) {
        return contarPrestamos("e.multa > 0 AND e.pagado = 1", busqueda);
    }
    
    private int contarPrestamos(String condicionBase, String busqueda) {
        int total = 0;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT COUNT(*) FROM entregas e ");
            sql.append("INNER JOIN libro l ON e.id_libro = l.id ");
            sql.append("INNER JOIN usuario u ON e.id_usuario = u.id ");
            sql.append("WHERE ").append(condicionBase).append(" ");
            
            if (busqueda != null && !busqueda.isEmpty()) {
                sql.append("AND (l.nombre LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?)");
            }
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql.toString());
            
            if (busqueda != null && !busqueda.isEmpty()) {
                String searchPattern = "%" + busqueda + "%";
                stmt.setString(1, searchPattern);
                stmt.setString(2, searchPattern);
                stmt.setString(3, searchPattern);
                stmt.setString(4, searchPattern);
                stmt.setString(5, searchPattern);
            }
            
            rs = stmt.executeQuery();
            if (rs.next()) {
                total = rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return total;
    }
    
    public Prestamo obtenerPorId(int id) {
        String sql = "SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, " +
                    "e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, " +
                    "l.nombre as libro_nombre, l.isbn as libro_isbn, " +
                    "CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni " +
                    "FROM entregas e " +
                    "INNER JOIN libro l ON e.id_libro = l.id " +
                    "INNER JOIN usuario u ON e.id_usuario = u.id " +
                    "WHERE e.id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapearPrestamo(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    public boolean crear(Prestamo prestamo) {
        String sql = "INSERT INTO entregas (id_libro, id_usuario, fecha_entrega, fecha_devolucion_programada, estado, observaciones_entrega) " +
                    "VALUES (?, ?, ?, ?, 'prestado', ?)";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, prestamo.getLibroId());
            stmt.setInt(2, prestamo.getUsuarioId());
            stmt.setTimestamp(3, new Timestamp(prestamo.getFechaPrestamo().getTime()));
            stmt.setDate(4, new java.sql.Date(prestamo.getFechaDevolucionEsperada().getTime()));
            stmt.setString(5, prestamo.getObservacionesEntrega());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean registrarDevolucion(int id, String estado, BigDecimal multa, String observaciones) {
        String sql = "UPDATE entregas SET fecha_devolucion_real = NOW(), estado = ?, multa = ?, " +
                    "observaciones_devolucion = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, estado);
            stmt.setBigDecimal(2, multa);
            stmt.setString(3, observaciones);
            stmt.setInt(4, id);
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean marcarMultaPagada(int id) {
        String sql = "UPDATE entregas SET pagado = 1 WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean desmarcarMultaPagada(int id) {
        String sql = "UPDATE entregas SET pagado = 0 WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean deshacerDevolucion(int id) {
        String sql = "UPDATE entregas SET fecha_devolucion_real = NULL, estado = 'prestado', " +
                    "multa = 0, pagado = 0, observaciones_devolucion = NULL WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean usuarioTieneMultasPendientes(int usuarioId) {
        String sql = "SELECT COUNT(*) as total FROM entregas WHERE id_usuario = ? AND multa > 0 AND pagado = 0";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, usuarioId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("total") > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public List<Prestamo> obtenerHistorialPorLibro(int libroId) {
        List<Prestamo> prestamos = new ArrayList<>();
        String sql = "SELECT e.id, e.id_libro, e.id_usuario, e.fecha_entrega, e.fecha_devolucion_programada, " +
                    "e.fecha_devolucion_real, e.estado, e.multa, e.pagado, e.observaciones_entrega, e.observaciones_devolucion, " +
                    "l.nombre as libro_nombre, l.isbn as libro_isbn, " +
                    "CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre, u.usuario as usuario_dni " +
                    "FROM entregas e " +
                    "INNER JOIN libro l ON e.id_libro = l.id " +
                    "INNER JOIN usuario u ON e.id_usuario = u.id " +
                    "WHERE e.id_libro = ? " +
                    "ORDER BY e.fecha_entrega DESC";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, libroId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                prestamos.add(mapearPrestamo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return prestamos;
    }
    
    private Prestamo mapearPrestamo(ResultSet rs) throws SQLException {
        Prestamo prestamo = new Prestamo();
        prestamo.setId(rs.getInt("id"));
        prestamo.setLibroId(rs.getInt("id_libro"));
        prestamo.setUsuarioId(rs.getInt("id_usuario"));
        prestamo.setFechaPrestamo(rs.getTimestamp("fecha_entrega"));
        prestamo.setFechaDevolucionEsperada(rs.getDate("fecha_devolucion_programada"));
        
        Timestamp fechaReal = rs.getTimestamp("fecha_devolucion_real");
        if (fechaReal != null) {
            prestamo.setFechaDevolucionReal(fechaReal);
        }
        
        prestamo.setEstado(rs.getString("estado"));
        prestamo.setMulta(rs.getBigDecimal("multa"));
        prestamo.setPagado(rs.getBoolean("pagado"));
        prestamo.setObservacionesEntrega(rs.getString("observaciones_entrega"));
        prestamo.setObservacionesDevolucion(rs.getString("observaciones_devolucion"));
        
        prestamo.setLibroNombre(rs.getString("libro_nombre"));
        prestamo.setLibroIsbn(rs.getString("libro_isbn"));
        prestamo.setUsuarioNombre(rs.getString("usuario_nombre"));
        prestamo.setUsuarioDni(rs.getString("usuario_dni"));
        
        return prestamo;
    }
    
    public boolean extenderPlazo(int prestamoId, int diasAdicionales, String observaciones) {
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            String sql = "UPDATE entregas SET " +
                        "fecha_devolucion_programada = DATE_ADD(fecha_devolucion_programada, INTERVAL ? DAY), " +
                        "observaciones_devolucion = CONCAT(COALESCE(observaciones_devolucion, ''), '\n[Extensión] ', NOW(), ': +', ?, ' días. ', ?) " +
                        "WHERE id = ? AND estado IN ('prestado', 'vencido')";
            
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, diasAdicionales);
            stmt.setInt(2, diasAdicionales);
            stmt.setString(3, observaciones != null ? observaciones : "Sin observaciones");
            stmt.setInt(4, prestamoId);
            
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
}
