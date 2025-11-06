package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Rol;
import singleton.DatabaseConnection;

// Manejo de roles del sistema (admin, bibliotecario, usuario)
public class RolDAO {
    
    // Obtiene todos los roles activos ordenados alfabéticamente
    public List<Rol> listarTodos() {
        List<Rol> roles = new ArrayList<>();
        String sql = "SELECT * FROM ROL WHERE activo = 1 ORDER BY rol";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                roles.add(mapearRol(rs));
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al listar roles: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return roles;
    }
    
    // Busca un rol específico por su ID
    public Rol obtenerPorId(int id) {
        String sql = "SELECT * FROM ROL WHERE id = ? AND activo = 1";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Rol rol = mapearRol(rs);
                rs.close();
                stmt.close();
                return rol;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al obtener rol: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return null;
    }
    
    // Método auxiliar que convierte ResultSet a objeto Rol
    private Rol mapearRol(ResultSet rs) throws SQLException {
        Rol rol = new Rol();
        rol.setId(rs.getInt("id"));
        rol.setRol(rs.getString("rol"));
        rol.setDescripcion(rs.getString("descripcion"));
        rol.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
        rol.setActivo(rs.getBoolean("activo"));
        return rol;
    }
}
