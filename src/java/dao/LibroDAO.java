package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Libro;
import singleton.DatabaseConnection;

public class LibroDAO {
    
    public List<Libro> listarConPaginacion(int pagina, int registrosPorPagina) {
        List<Libro> libros = new ArrayList<>();
        String sql = "SELECT * FROM libro WHERE activo = 1 ORDER BY nombre LIMIT ? OFFSET ?";
        
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            int offset = (pagina - 1) * registrosPorPagina;
            ps.setInt(1, registrosPorPagina);
            ps.setInt(2, offset);
            
            rs = ps.executeQuery();
            while (rs.next()) {
                libros.add(mapearLibro(rs));
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
        return libros;
    }
    
    public List<Libro> buscarConPaginacion(String busqueda, int pagina, int registrosPorPagina) {
        List<Libro> libros = new ArrayList<>();
        String sql = "SELECT * FROM libro WHERE activo = 1 AND (" +
                    "LOWER(nombre) LIKE ? OR " +
                    "LOWER(autor) LIKE ? OR " +
                    "LOWER(isbn) LIKE ? OR " +
                    "LOWER(editorial) LIKE ? OR " +
                    "LOWER(genero) LIKE ?) " +
                    "ORDER BY nombre LIMIT ? OFFSET ?";
        
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            String termino = "%" + busqueda.toLowerCase() + "%";
            ps.setString(1, termino);
            ps.setString(2, termino);
            ps.setString(3, termino);
            ps.setString(4, termino);
            ps.setString(5, termino);
            
            int offset = (pagina - 1) * registrosPorPagina;
            ps.setInt(6, registrosPorPagina);
            ps.setInt(7, offset);
            
            rs = ps.executeQuery();
            while (rs.next()) {
                libros.add(mapearLibro(rs));
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
        return libros;
    }
    
    public int contarLibros() {
        String sql = "SELECT COUNT(*) FROM libro WHERE activo = 1";
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
    
    public int contarLibrosPorBusqueda(String busqueda) {
        String sql = "SELECT COUNT(*) FROM libro WHERE activo = 1 AND (" +
                    "LOWER(nombre) LIKE ? OR " +
                    "LOWER(autor) LIKE ? OR " +
                    "LOWER(isbn) LIKE ? OR " +
                    "LOWER(editorial) LIKE ? OR " +
                    "LOWER(genero) LIKE ?)";
        
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            String termino = "%" + busqueda.toLowerCase() + "%";
            ps.setString(1, termino);
            ps.setString(2, termino);
            ps.setString(3, termino);
            ps.setString(4, termino);
            ps.setString(5, termino);
            
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
    
    public Libro obtenerPorId(int id) {
        String sql = "SELECT * FROM libro WHERE id = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            rs = ps.executeQuery();
            if (rs.next()) {
                return mapearLibro(rs);
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
        return null;
    }
    
    public boolean crear(Libro libro) {
        String sql = "INSERT INTO libro (nombre, autor, isbn, editorial, año_publicacion, " +
                    "genero, descripcion, stock, stock_disponible, ubicacion, fecha_registro, activo) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)";
        
        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            ps.setString(1, libro.getNombre());
            ps.setString(2, libro.getAutor());
            ps.setString(3, libro.getIsbn());
            ps.setString(4, libro.getEditorial());
            ps.setInt(5, libro.getAnioPublicacion());
            ps.setString(6, libro.getGenero());
            ps.setString(7, libro.getDescripcion());
            ps.setInt(8, libro.getStock());
            ps.setInt(9, libro.getStockDisponible());
            ps.setString(10, libro.getUbicacion());
            
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return false;
    }
    
    public boolean actualizar(Libro libro) {
        String sql = "UPDATE libro SET nombre = ?, autor = ?, isbn = ?, editorial = ?, " +
                    "año_publicacion = ?, genero = ?, descripcion = ?, stock = ?, " +
                    "stock_disponible = ?, ubicacion = ?, fecha_actualizacion = NOW() " +
                    "WHERE id = ?";
        
        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            ps.setString(1, libro.getNombre());
            ps.setString(2, libro.getAutor());
            ps.setString(3, libro.getIsbn());
            ps.setString(4, libro.getEditorial());
            ps.setInt(5, libro.getAnioPublicacion());
            ps.setString(6, libro.getGenero());
            ps.setString(7, libro.getDescripcion());
            ps.setInt(8, libro.getStock());
            ps.setInt(9, libro.getStockDisponible());
            ps.setString(10, libro.getUbicacion());
            ps.setInt(11, libro.getId());
            
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return false;
    }
    
    public boolean actualizarStock(int id, int nuevoStock, int nuevoStockDisponible) {
        String sql = "UPDATE libro SET stock = ?, stock_disponible = ?, " +
                    "fecha_actualizacion = NOW() WHERE id = ?";
        
        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            ps.setInt(1, nuevoStock);
            ps.setInt(2, nuevoStockDisponible);
            ps.setInt(3, id);
            
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return false;
    }
    
    public boolean ajustarStockDisponible(int id, int ajuste) {
        String sql = "UPDATE libro SET stock_disponible = stock_disponible + ?, " +
                    "fecha_actualizacion = NOW() WHERE id = ?";
        
        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            ps.setInt(1, ajuste);
            ps.setInt(2, id);
            
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return false;
    }
    
    public boolean cambiarEstado(int id, boolean activo) {
        String sql = "UPDATE libro SET activo = ?, fecha_actualizacion = NOW() WHERE id = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            ps.setBoolean(1, activo);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (ps != null) ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (conn != null) {
                DatabaseConnection.getInstance().releaseConnection(conn);
            }
        }
        return false;
    }
    
    public boolean existeIsbn(String isbn, Integer idExcluir) {
        String sql = "SELECT COUNT(*) FROM libro WHERE isbn = ? AND id != ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, isbn);
            ps.setInt(2, idExcluir != null ? idExcluir : 0);
            rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
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
        return false;
    }
    
    /**
     * Busca libros activos para autocompletado (por ISBN o nombre)
     * Retorna máximo 10 resultados con stock disponible > 0
     */
    public List<Libro> buscarParaAutocompletado(String busqueda) {
        List<Libro> libros = new ArrayList<>();
        String sql = "SELECT * FROM libro WHERE activo = 1 AND stock_disponible > 0 AND " +
                     "(isbn LIKE ? OR nombre LIKE ?) ORDER BY nombre LIMIT 10";
        
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getInstance().getConnection();
            ps = conn.prepareStatement(sql);
            
            String param = "%" + busqueda + "%";
            ps.setString(1, param);
            ps.setString(2, param);
            
            rs = ps.executeQuery();
            
            while (rs.next()) {
                libros.add(mapearLibro(rs));
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
        
        return libros;
    }
    
    private Libro mapearLibro(ResultSet rs) throws SQLException {
        Libro libro = new Libro();
        libro.setId(rs.getInt("id"));
        libro.setNombre(rs.getString("nombre"));
        libro.setAutor(rs.getString("autor"));
        libro.setIsbn(rs.getString("isbn"));
        libro.setEditorial(rs.getString("editorial"));
        libro.setAnioPublicacion(rs.getInt("año_publicacion"));
        libro.setGenero(rs.getString("genero"));
        libro.setDescripcion(rs.getString("descripcion"));
        libro.setStock(rs.getInt("stock"));
        libro.setStockDisponible(rs.getInt("stock_disponible"));
        libro.setUbicacion(rs.getString("ubicacion"));
        libro.setFechaRegistro(rs.getTimestamp("fecha_registro"));
        libro.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));
        libro.setActivo(rs.getBoolean("activo"));
        return libro;
    }
}
