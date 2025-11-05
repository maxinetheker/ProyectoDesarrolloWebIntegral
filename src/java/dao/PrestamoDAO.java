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
            sql.append("WHERE e.fecha_devolucion_real IS NOT NULL AND e.estado IN ('devuelto', 'perdido') ");
            
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
            sql.append("WHERE e.multa > 0 AND (e.pagado = 0 OR e.pagado IS NULL) ");
            
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
        return contarPrestamos("e.fecha_devolucion_real IS NOT NULL AND e.estado IN ('devuelto', 'perdido')", busqueda);
    }
    
    public int contarMultasPendientes(String busqueda) {
        return contarPrestamos("e.multa > 0 AND (e.pagado = 0 OR e.pagado IS NULL)", busqueda);
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
        
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapearPrestamo(rs);
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
        
        return null;
    }
    
    public boolean crear(Prestamo prestamo) {
        String sql = "INSERT INTO entregas (id_libro, id_usuario, fecha_entrega, fecha_devolucion_programada, estado, observaciones_entrega) " +
                    "VALUES (?, ?, ?, ?, 'prestado', ?)";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, prestamo.getLibroId());
            stmt.setInt(2, prestamo.getUsuarioId());
            stmt.setTimestamp(3, new Timestamp(prestamo.getFechaPrestamo().getTime()));
            stmt.setDate(4, new java.sql.Date(prestamo.getFechaDevolucionEsperada().getTime()));
            stmt.setString(5, prestamo.getObservacionesEntrega());
            
            return stmt.executeUpdate() > 0;
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
    
    public boolean registrarDevolucion(int id, String estado, BigDecimal multa, String observaciones) {
        Connection conn = null;
        PreparedStatement stmtUpdate = null;
        PreparedStatement stmtStock = null;
        PreparedStatement stmtSelect = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            // Primero obtener el id del libro
            String sqlSelect = "SELECT id_libro FROM entregas WHERE id = ?";
            stmtSelect = conn.prepareStatement(sqlSelect);
            stmtSelect.setInt(1, id);
            rs = stmtSelect.executeQuery();
            
            if (!rs.next()) {
                conn.rollback();
                return false;
            }
            
            int idLibro = rs.getInt("id_libro");
            rs.close();
            stmtSelect.close();
            
            // Actualizar el préstamo
            String sqlUpdate = "UPDATE entregas SET fecha_devolucion_real = NOW(), estado = ?, multa = ?, " +
                             "observaciones_devolucion = ? WHERE id = ?";
            stmtUpdate = conn.prepareStatement(sqlUpdate);
            stmtUpdate.setString(1, estado);
            stmtUpdate.setBigDecimal(2, multa);
            stmtUpdate.setString(3, observaciones);
            stmtUpdate.setInt(4, id);
            stmtUpdate.executeUpdate();
            stmtUpdate.close();
            
            // Actualizar el stock según el estado
            String sqlStock;
            if ("devuelto".equals(estado)) {
                sqlStock = "UPDATE libro SET stock_disponible = stock_disponible + 1 WHERE id = ?";
            } else if ("perdido".equals(estado)) {

                sqlStock = "UPDATE libro SET stock = stock - 1 WHERE id = ?";
            } else {
                conn.commit();
                return true;
            }
            
            stmtStock = conn.prepareStatement(sqlStock);
            stmtStock.setInt(1, idLibro);
            stmtStock.executeUpdate();
            
            conn.commit();
            return true;
            
        } catch (SQLException e) {
            System.err.println("Error al registrar devolución: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            return false;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (stmtSelect != null) try { stmtSelect.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (stmtUpdate != null) try { stmtUpdate.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (stmtStock != null) try { stmtStock.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    public boolean marcarMultaPagada(int id) {
        String sql = "UPDATE entregas SET pagado = 1 WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
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
    
    public boolean desmarcarMultaPagada(int id) {
        String sql = "UPDATE entregas SET pagado = 0 WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
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
    
    public boolean actualizarMulta(int id, BigDecimal nuevaMulta) {
        String sql = "UPDATE entregas SET multa = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setBigDecimal(1, nuevaMulta);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
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
    
    public boolean deshacerDevolucion(int id) {
        Connection conn = null;
        PreparedStatement stmtSelect = null;
        PreparedStatement stmtUpdate = null;
        PreparedStatement stmtStock = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            // Paso 1: Obtener el estado y el id_libro del préstamo
            String sqlSelect = "SELECT estado, id_libro FROM entregas WHERE id = ?";
            stmtSelect = conn.prepareStatement(sqlSelect);
            stmtSelect.setInt(1, id);
            rs = stmtSelect.executeQuery();
            
            if (!rs.next()) {
                conn.rollback();
                return false;
            }
            
            String estado = rs.getString("estado");
            int idLibro = rs.getInt("id_libro");
            
            // Paso 2: Actualizar el préstamo (marcar como prestado, limpiar multa)
            String sqlUpdate = "UPDATE entregas SET fecha_devolucion_real = NULL, estado = 'prestado', " +
                             "multa = 0, pagado = 0, observaciones_devolucion = NULL WHERE id = ?";
            stmtUpdate = conn.prepareStatement(sqlUpdate);
            stmtUpdate.setInt(1, id);
            stmtUpdate.executeUpdate();
            
            // Paso 3: Actualizar stock según el estado original
            String sqlStock;
            if ("devuelto".equals(estado)) {
                // Si fue devuelto, restar 1 del stock_disponible (porque el libro vuelve a estar prestado)
                sqlStock = "UPDATE libro SET stock_disponible = stock_disponible - 1 WHERE id = ?";
            } else if ("perdido".equals(estado)) {
                // Si fue perdido, sumar 1 al stock total (porque el libro regresa al inventario)
                sqlStock = "UPDATE libro SET stock = stock + 1 WHERE id = ?";
            } else {
                // Para otros estados, no modificar el stock
                conn.commit();
                return true;
            }
            
            stmtStock = conn.prepareStatement(sqlStock);
            stmtStock.setInt(1, idLibro);
            stmtStock.executeUpdate();
            
            conn.commit();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            return false;
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmtSelect != null) stmtSelect.close();
                if (stmtUpdate != null) stmtUpdate.close();
                if (stmtStock != null) stmtStock.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    public boolean usuarioTieneMultasPendientes(int usuarioId) {
        String sql = "SELECT COUNT(*) as total FROM entregas WHERE id_usuario = ? AND multa > 0 AND pagado = 0";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, usuarioId);
            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("total") > 0;
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
        
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, libroId);
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
    
    public boolean eliminarPrestamo(int prestamoId) {
        Connection conn = null;
        PreparedStatement stmtSelect = null;
        PreparedStatement stmtUpdate = null;
        PreparedStatement stmtDelete = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            // Obtener el id_libro del préstamo
            String sqlSelect = "SELECT id_libro FROM entregas WHERE id = ? AND estado IN ('prestado', 'vencido')";
            stmtSelect = conn.prepareStatement(sqlSelect);
            stmtSelect.setInt(1, prestamoId);
            rs = stmtSelect.executeQuery();
            
            if (rs.next()) {
                int idLibro = rs.getInt("id_libro");
                
                // Restaurar el stock del libro
                String sqlUpdate = "UPDATE libro SET stock_disponible = stock_disponible + 1 WHERE id = ?";
                stmtUpdate = conn.prepareStatement(sqlUpdate);
                stmtUpdate.setInt(1, idLibro);
                stmtUpdate.executeUpdate();
                
                // Eliminar el préstamo
                String sqlDelete = "DELETE FROM entregas WHERE id = ?";
                stmtDelete = conn.prepareStatement(sqlDelete);
                stmtDelete.setInt(1, prestamoId);
                stmtDelete.executeUpdate();
                
                conn.commit();
                return true;
            } else {
                conn.rollback();
                return false;
            }
        } catch (SQLException e) {
            try {
                if (conn != null) conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmtSelect != null) stmtSelect.close();
                if (stmtUpdate != null) stmtUpdate.close();
                if (stmtDelete != null) stmtDelete.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
}
