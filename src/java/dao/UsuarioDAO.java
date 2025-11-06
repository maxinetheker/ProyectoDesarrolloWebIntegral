package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Usuario;
import singleton.DatabaseConnection;

// Aquí van todos los métodos para trabajar con usuarios en la base de datos
public class UsuarioDAO {
    
    // Verifica usuario y contraseña para el login
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
    
    // Busca un usuario por su ID
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
    
    // Trae todos los usuarios activos ordenados por nombre
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
    
    // Lista usuarios con paginación para no cargar todos de golpe
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
                    usuario.setNombreRol(rs.getString(12)); 
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
            // IMPORTANTE: hay que devolver siempre la conexión al pool
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return usuarios;
    }
    
    // Cuenta cuántos usuarios hay en total (tanto activos como inactivos)
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
    
    // Busca usuarios por nombre, apellido, email, etc. con paginación
    public List<Usuario> buscarConPaginacion(String busqueda, int pagina, int registrosPorPagina) {
        List<Usuario> usuarios = new ArrayList<>();
        int offset = (pagina - 1) * registrosPorPagina;
        
        String sql = "SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, u.telefono, " +
                     "u.direccion, u.fecha_creacion, u.fecha_actualizacion, u.id_rol, u.activo, " +
                     "r.rol as nombre_rol " +
                     "FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE LOWER(u.usuario) LIKE ? " +
                     "OR LOWER(u.nombre) LIKE ? " +
                     "OR LOWER(u.apellido) LIKE ? " +
                     "OR LOWER(u.email) LIKE ? " +
                     "OR LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ? " +
                     "ORDER BY u.activo DESC, u.fecha_creacion DESC, u.nombre " +
                     "LIMIT ? OFFSET ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            String searchPattern = "%" + busqueda.toLowerCase() + "%";
            stmt.setString(1, searchPattern);
            stmt.setString(2, searchPattern);
            stmt.setString(3, searchPattern);
            stmt.setString(4, searchPattern);
            stmt.setString(5, searchPattern);
            stmt.setInt(6, registrosPorPagina);
            stmt.setInt(7, offset);
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Usuario usuario = new Usuario();
                try {
                    usuario.setId(rs.getInt(1));
                    usuario.setUsuario(rs.getString(2));
                    usuario.setNombre(rs.getString(3));
                    usuario.setApellido(rs.getString(4));
                    usuario.setEmail(rs.getString(5));
                    usuario.setTelefono(rs.getString(6));
                    usuario.setDireccion(rs.getString(7));
                    usuario.setFechaCreacion(rs.getTimestamp(8));
                    usuario.setFechaActualizacion(rs.getTimestamp(9));
                    usuario.setIdRol(rs.getInt(10));
                    int activoInt = rs.getInt(11);
                    usuario.setActivo(activoInt == 1);
                    usuario.setNombreRol(rs.getString(12));
                    usuarios.add(usuario);
                } catch (SQLException e) {
                    System.err.println("Error al mapear usuario en búsqueda: " + e.getMessage());
                }
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar usuarios con paginación: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return usuarios;
    }
    
    // Cuenta cuántos usuarios coinciden con la búsqueda
    public int contarUsuariosPorBusqueda(String busqueda) {
        String sql = "SELECT COUNT(*) as total FROM USUARIO u " +
                     "WHERE LOWER(u.usuario) LIKE ? " +
                     "OR LOWER(u.nombre) LIKE ? " +
                     "OR LOWER(u.apellido) LIKE ? " +
                     "OR LOWER(u.email) LIKE ? " +
                     "OR LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            String searchPattern = "%" + busqueda.toLowerCase() + "%";
            stmt.setString(1, searchPattern);
            stmt.setString(2, searchPattern);
            stmt.setString(3, searchPattern);
            stmt.setString(4, searchPattern);
            stmt.setString(5, searchPattern);
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                int total = rs.getInt("total");
                rs.close();
                stmt.close();
                return total;
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al contar usuarios por búsqueda: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return 0;
    }
    
    // Crea un nuevo usuario en la base de datos
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
    
    // Actualiza los datos de un usuario (nombre, email, teléfono, etc)
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
    
    // Cambia la contraseña de un usuario (ya debe venir hasheada)
    public boolean actualizarContrasena(int id, String nuevaContrasenaHash) {
        String sql = "UPDATE USUARIO SET contrasena = ? WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            stmt.setString(1, nuevaContrasenaHash);
            stmt.setInt(2, id);
            
            boolean result = stmt.executeUpdate() > 0;
            stmt.close();
            return result;
            
        } catch (SQLException e) {
            System.err.println("Error al actualizar contraseña: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
    }
    
    // Desactiva un usuario por su ID (no se elimina, solo se marca como inactivo)
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
    
    // Reactiva un usuario que estaba desactivado
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
    
    // Cambia el estado activo/inactivo de un usuario
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
    
    // Desactiva por nombre de usuario (útil cuando bloqueamos por intentos fallidos)
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
    
    // Reactiva un usuario por nombre de usuario (para desbloquear cuentas)
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
    
    // Busca un usuario por su nombre de usuario (sin validar contraseña ni estado)
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
    
    // Para el autocompletado en formularios, trae max 10 usuarios que coincidan
    public List<Usuario> buscarParaAutocompletado(String busqueda) {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT u.*, r.rol as nombre_rol FROM USUARIO u " +
                     "INNER JOIN ROL r ON u.id_rol = r.id " +
                     "WHERE u.activo = 1 AND (" +
                     "u.nombre LIKE ? OR u.apellido LIKE ? OR u.usuario LIKE ?) " +
                     "ORDER BY u.nombre, u.apellido LIMIT 10";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            String param = "%" + busqueda + "%";
            stmt.setString(1, param);
            stmt.setString(2, param);
            stmt.setString(3, param);
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                usuarios.add(mapearUsuario(rs));
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar usuarios para autocompletado: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return usuarios;
    }
    
    // Busca usuarios por código de barras del carnet (verifica si está vencido también)
    public List<java.util.Map<String, Object>> buscarPorCodigoBarras(String codigo) {
        List<java.util.Map<String, Object>> resultados = new ArrayList<>();
        String sql = "SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, " +
                     "cb.codigo, cb.fecha_caducidad, " +
                     "(cb.fecha_caducidad < NOW()) as esta_vencido " +
                     "FROM USUARIO u " +
                     "INNER JOIN CODIGOS_BARRAS cb ON u.id = cb.id_usuario " +
                     "WHERE u.activo = 1 AND cb.activo = 1 AND cb.codigo LIKE ? " +
                     "ORDER BY cb.fecha_creacion DESC LIMIT 10";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            String param = "%" + codigo + "%";
            stmt.setString(1, param);
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                java.util.Map<String, Object> resultado = new java.util.HashMap<>();
                resultado.put("id", rs.getInt("id"));
                resultado.put("usuario", rs.getString("usuario"));
                resultado.put("nombre", rs.getString("nombre"));
                resultado.put("apellido", rs.getString("apellido"));
                resultado.put("email", rs.getString("email"));
                resultado.put("codigo", rs.getString("codigo"));
                resultado.put("estaVencido", rs.getBoolean("esta_vencido"));
                resultados.add(resultado);
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error al buscar usuarios por código de barras: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        
        return resultados;
    }
    
    // Convierte un ResultSet de la BD a un objeto Usuario
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
    
    public int contarUsuariosActivos() {
        String sql = "SELECT COUNT(*) FROM usuario WHERE activo = 1";
        
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return 0;
    }
}
