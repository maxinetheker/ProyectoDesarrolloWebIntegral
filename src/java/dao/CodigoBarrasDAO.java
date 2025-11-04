package dao;

import java.sql.*;
import java.time.LocalDateTime;
import model.CodigoBarras;
import singleton.DatabaseConnection;

/**
 * Data Access Object para CODIGOS_BARRAS
 */
public class CodigoBarrasDAO {
    
    /**
     * Crea un nuevo código de barras
     */
    public boolean crear(CodigoBarras codigoBarras) {
        String sql = "INSERT INTO CODIGOS_BARRAS (id_usuario, codigo, fecha_caducidad, tipo, activo) " +
                     "VALUES (?, ?, ?, ?, ?)";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, codigoBarras.getIdUsuario());
            stmt.setString(2, codigoBarras.getCodigo());
            stmt.setTimestamp(3, Timestamp.valueOf(codigoBarras.getFechaCaducidad()));
            stmt.setString(4, codigoBarras.getTipo());
            stmt.setBoolean(5, codigoBarras.isActivo());
            
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al crear codigo de barras: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Busca el código de barras activo de un usuario
     */
    public CodigoBarras buscarPorUsuario(int idUsuario) {
        String sql = "SELECT cb.*, u.usuario as nombre_usuario, " +
                     "CONCAT(u.nombre, ' ', u.apellido) as nombre_completo " +
                     "FROM CODIGOS_BARRAS cb " +
                     "INNER JOIN USUARIO u ON cb.id_usuario = u.id " +
                     "WHERE cb.id_usuario = ? AND cb.activo = 1 " +
                     "ORDER BY cb.fecha_creacion DESC " +
                     "LIMIT 1";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, idUsuario);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                CodigoBarras codigo = mapearCodigoBarras(rs);
                rs.close();
                stmt.close();
                return codigo;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar codigo de barras: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return null;
    }
    
    /**
     * Busca un código de barras por el código mismo
     */
    public CodigoBarras buscarPorCodigo(String codigo) {
        String sql = "SELECT cb.*, u.usuario as nombre_usuario, " +
                     "CONCAT(u.nombre, ' ', u.apellido) as nombre_completo " +
                     "FROM CODIGOS_BARRAS cb " +
                     "INNER JOIN USUARIO u ON cb.id_usuario = u.id " +
                     "WHERE cb.codigo = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, codigo);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                CodigoBarras codigoBarras = mapearCodigoBarras(rs);
                rs.close();
                stmt.close();
                return codigoBarras;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar por codigo: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return null;
    }
    
    /**
     * Desactiva los códigos anteriores de un usuario
     */
    public boolean desactivarAnteriores(int idUsuario) {
        String sql = "UPDATE CODIGOS_BARRAS SET activo = 0 WHERE id_usuario = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, idUsuario);
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al desactivar codigos anteriores: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Actualiza la fecha de caducidad de un código
     */
    public boolean renovar(int id, LocalDateTime nuevaFechaCaducidad) {
        String sql = "UPDATE CODIGOS_BARRAS SET fecha_caducidad = ? WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setTimestamp(1, Timestamp.valueOf(nuevaFechaCaducidad));
            stmt.setInt(2, id);
            
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al renovar codigo: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Mapea un ResultSet a un CodigoBarras
     */
    private CodigoBarras mapearCodigoBarras(ResultSet rs) throws SQLException {
        CodigoBarras codigo = new CodigoBarras();
        codigo.setId(rs.getInt("id"));
        codigo.setIdUsuario(rs.getInt("id_usuario"));
        codigo.setCodigo(rs.getString("codigo"));
        
        Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");
        if (fechaCreacion != null) {
            codigo.setFechaCreacion(fechaCreacion.toLocalDateTime());
        }
        
        Timestamp fechaCaducidad = rs.getTimestamp("fecha_caducidad");
        if (fechaCaducidad != null) {
            codigo.setFechaCaducidad(fechaCaducidad.toLocalDateTime());
        }
        
        int activoInt = rs.getInt("activo");
        codigo.setActivo(activoInt == 1);
        codigo.setTipo(rs.getString("tipo"));
        
        // Datos del usuario (si vienen del JOIN)
        try {
            codigo.setNombreUsuario(rs.getString("nombre_usuario"));
            codigo.setNombreCompleto(rs.getString("nombre_completo"));
        } catch (SQLException e) {
            // No hay problema si no existen estas columnas
        }
        
        return codigo;
    }
}
