package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Usuario;
import singleton.DatabaseConnection;

/**
 * Data Access Object para Usuario
 */
public class UsuarioDAO {
    
    /**
     * Valida las credenciales de un usuario
     */
    public Usuario validarUsuario(String usuario, String contrasena) {
        String sql = "SELECT u.*, r.rol as nombre_rol FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE u.usuario = ? AND u.contrasena = ? AND u.activo = 1";
        
        DatabaseConnection dbInstance = DatabaseConnection.getInstance();
        if (dbInstance == null) {
            System.err.println("ERROR: No se pudo obtener instancia de conexión a BD");
            return null;
        }
        
        Connection conn = dbInstance.getConnection();
        if (conn == null) {
            System.err.println("ERROR: La conexión a la base de datos es null");
            System.err.println("Verifica la configuración en DatabaseConfig.java");
            return null;
        }
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario);
            stmt.setString(2, contrasena);
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapearUsuario(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error al validar usuario: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Obtiene un usuario por ID
     */
    public Usuario obtenerPorId(int id) {
        String sql = "SELECT u.*, r.rol as nombre_rol FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE u.id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapearUsuario(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error al obtener usuario: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Lista todos los usuarios activos
     */
    public List<Usuario> listarTodos() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT u.*, r.rol as nombre_rol FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE u.activo = 1 ORDER BY u.nombre";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                usuarios.add(mapearUsuario(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("Error al listar usuarios: " + e.getMessage());
        }
        
        return usuarios;
    }
    
    /**
     * Crea un nuevo usuario
     */
    public boolean crear(Usuario usuario) {
        String sql = "INSERT INTO USUARIO (usuario, nombre, apellido, email, contrasena, " +
                     "telefono, direccion, id_rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario.getUsuario());
            stmt.setString(2, usuario.getNombre());
            stmt.setString(3, usuario.getApellido());
            stmt.setString(4, usuario.getEmail());
            stmt.setString(5, usuario.getContrasena());
            stmt.setString(6, usuario.getTelefono());
            stmt.setString(7, usuario.getDireccion());
            stmt.setInt(8, usuario.getIdRol());
            stmt.setBoolean(9, usuario.isActivo());
            
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error al crear usuario: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Actualiza un usuario existente
     */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE USUARIO SET nombre = ?, apellido = ?, email = ?, " +
                     "telefono = ?, direccion = ?, id_rol = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario.getNombre());
            stmt.setString(2, usuario.getApellido());
            stmt.setString(3, usuario.getEmail());
            stmt.setString(4, usuario.getTelefono());
            stmt.setString(5, usuario.getDireccion());
            stmt.setInt(6, usuario.getIdRol());
            stmt.setInt(7, usuario.getId());
            
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Desactiva un usuario por id
     */
    public boolean desactivar(int id) {
        String sql = "UPDATE USUARIO SET activo = 0 WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error al desactivar usuario: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Desactiva un usuario por nombre de usuario 
     */
    public boolean desactivar(String usuario) {
        String sql = "UPDATE USUARIO SET activo = 0 WHERE usuario = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error al desactivar usuario: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Activa/desbloquea un usuario por nombre de usuario
     */
    public boolean activar(String usuario) {
        String sql = "UPDATE USUARIO SET activo = 1 WHERE usuario = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error al activar usuario: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Busca un usuario por nombre de usuario (sin validar contraseña ni estado activo)
     */
    public Usuario buscarPorUsuario(String usuario) {
        String sql = "SELECT u.*, r.rol as nombre_rol FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE u.usuario = ?";
        
        DatabaseConnection dbInstance = DatabaseConnection.getInstance();
        if (dbInstance == null) {
            System.err.println("ERROR: No se pudo obtener instancia de conexión a BD");
            return null;
        }
        
        Connection conn = dbInstance.getConnection();
        if (conn == null) {
            System.err.println("ERROR: La conexión a la base de datos es null");
            return null;
        }
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, usuario);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapearUsuario(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error al buscar usuario: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Mapea un ResultSet a un Usuario
     */
    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        Usuario usuario = new Usuario();
        usuario.setId(rs.getInt("id"));
        usuario.setUsuario(rs.getString("usuario"));
        usuario.setNombre(rs.getString("nombre"));
        usuario.setApellido(rs.getString("apellido"));
        usuario.setEmail(rs.getString("email"));
        usuario.setTelefono(rs.getString("telefono"));
        usuario.setDireccion(rs.getString("direccion"));
        usuario.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
        usuario.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));
        usuario.setIdRol(rs.getInt("id_rol"));
        usuario.setNombreRol(rs.getString("nombre_rol"));
        usuario.setActivo(rs.getBoolean("activo"));
        return usuario;
    }
}
