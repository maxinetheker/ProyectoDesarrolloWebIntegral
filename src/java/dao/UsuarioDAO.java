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
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, usuario);
            stmt.setString(2, contrasena);
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Usuario usuarioObj = mapearUsuario(rs);
                rs.close();
                stmt.close();
                return usuarioObj;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al validar usuario: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
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
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Usuario usuarioObj = mapearUsuario(rs);
                rs.close();
                stmt.close();
                return usuarioObj;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al obtener usuario: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
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
     * Lista usuarios con paginación
     */
    public List<Usuario> listarConPaginacion(int pagina, int registrosPorPagina) {
        List<Usuario> usuarios = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        
        String sql = "SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, u.telefono, " +
                     "u.direccion, u.fecha_creacion, u.fecha_actualizacion, u.id_rol, u.activo, " +
                     "r.rol as nombre_rol " +
                     "FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "ORDER BY u.activo DESC, u.fecha_creacion DESC, u.nombre " +
                     "LIMIT ? OFFSET ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, registrosPorPagina);
            stmt.setInt(2, offset);
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Usuario usuario = new Usuario();
                try {
                    usuario.setId(rs.getInt(1));           // id
                    usuario.setUsuario(rs.getString(2));    // usuario
                    usuario.setNombre(rs.getString(3));     // nombre
                    usuario.setApellido(rs.getString(4));   // apellido
                    usuario.setEmail(rs.getString(5));      // email
                    usuario.setTelefono(rs.getString(6));   // telefono
                    usuario.setDireccion(rs.getString(7));  // direccion
                    usuario.setFechaCreacion(rs.getTimestamp(8));       // fecha_creacion
                    usuario.setFechaActualizacion(rs.getTimestamp(9));  // fecha_actualizacion
                    usuario.setIdRol(rs.getInt(10));        // id_rol
                    int activoInt = rs.getInt(11);          // activo
                    usuario.setActivo(activoInt == 1);
                    usuario.setNombreRol(rs.getString(12)); // nombre_rol
                    usuarios.add(usuario);
                } catch (SQLException e) {
                    System.err.println("Error al mapear usuario: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al listar usuarios con paginacion: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // CRITICO: Devolver la conexion al pool
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return usuarios;
    }
    
    /**
     * Cuenta el total de usuarios (activos e inactivos)
     */
    public int contarUsuarios() {
        String sql = "SELECT COUNT(*) as total FROM USUARIO";
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            
            if (rs.next()) {
                int total = rs.getInt("total");
                rs.close();
                stmt.close();
                return total;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al contar usuarios: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return 0;
    }
    
    /**
     * Crea un nuevo usuario
     */
    public boolean crear(Usuario usuario) {
        String sql = "INSERT INTO USUARIO (usuario, nombre, apellido, email, contrasena, " +
                     "telefono, direccion, id_rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, usuario.getUsuario());
            stmt.setString(2, usuario.getNombre());
            stmt.setString(3, usuario.getApellido());
            stmt.setString(4, usuario.getEmail());
            stmt.setString(5, usuario.getContrasena());
            stmt.setString(6, usuario.getTelefono());
            stmt.setString(7, usuario.getDireccion());
            stmt.setInt(8, usuario.getIdRol());
            stmt.setBoolean(9, usuario.isActivo());
            
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al crear usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Actualiza un usuario existente
     */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE USUARIO SET nombre = ?, apellido = ?, email = ?, " +
                     "telefono = ?, direccion = ?, id_rol = ? WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, usuario.getNombre());
            stmt.setString(2, usuario.getApellido());
            stmt.setString(3, usuario.getEmail());
            stmt.setString(4, usuario.getTelefono());
            stmt.setString(5, usuario.getDireccion());
            stmt.setInt(6, usuario.getIdRol());
            stmt.setInt(7, usuario.getId());
            
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Desactiva un usuario por id
     */
    public boolean desactivar(int id) {
        String sql = "UPDATE USUARIO SET activo = 0 WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, id);
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al desactivar usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Activa un usuario por id
     */
    public boolean activar(int id) {
        String sql = "UPDATE USUARIO SET activo = 1 WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setInt(1, id);
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al activar usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Cambia el estado activo de un usuario
     */
    public boolean cambiarEstado(int id, boolean activo) {
        String sql = "UPDATE USUARIO SET activo = ? WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setBoolean(1, activo);
            stmt.setInt(2, id);
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al cambiar estado de usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    /**
     * Desactiva un usuario por nombre de usuario 
     */
    public boolean desactivar(String usuario) {
        String sql = "UPDATE USUARIO SET activo = 0 WHERE usuario = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, usuario);
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al desactivar usuario: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
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
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, usuario);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Usuario usuarioObj = mapearUsuario(rs);
                rs.close();
                stmt.close();
                return usuarioObj;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar usuario: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
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
        usuario.setActivo(rs.getInt("activo") == 1);
        return usuario;
    }
}
