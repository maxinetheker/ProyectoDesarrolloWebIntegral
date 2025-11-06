package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Chatbot;
import singleton.DatabaseConnection;

public class ChatbotDAO {
    
    // Guardar una conversación en la base de datos
    public boolean guardarConversacion(Chatbot chatbot) {
        String sql = "INSERT INTO chatbot (id_usuario, mensaje_recibido, mensaje_respuesta, fecha_consulta, ip_origen) " +
                     "VALUES (?, ?, ?, NOW(), ?)";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            if (chatbot.getIdUsuario() != null) {
                stmt.setInt(1, chatbot.getIdUsuario());
            } else {
                stmt.setNull(1, Types.INTEGER);
            }
            stmt.setString(2, chatbot.getMensajeRecibido());
            stmt.setString(3, chatbot.getMensajeRespuesta());
            stmt.setString(4, chatbot.getIpOrigen());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        chatbot.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("Error al guardar conversación: " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    // Obtener historial de conversaciones de un usuario
    public List<Chatbot> obtenerHistorialUsuario(int idUsuario, int limite) {
        List<Chatbot> historial = new ArrayList<>();
        String sql = "SELECT * FROM chatbot WHERE id_usuario = ? ORDER BY fecha_consulta DESC LIMIT ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, idUsuario);
            stmt.setInt(2, limite);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Chatbot chat = new Chatbot();
                    chat.setId(rs.getInt("id"));
                    chat.setIdUsuario(rs.getInt("id_usuario"));
                    chat.setMensajeRecibido(rs.getString("mensaje_recibido"));
                    chat.setMensajeRespuesta(rs.getString("mensaje_respuesta"));
                    chat.setFechaConsulta(rs.getTimestamp("fecha_consulta"));
                    chat.setIpOrigen(rs.getString("ip_origen"));
                    historial.add(chat);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error al obtener historial: " + e.getMessage());
            e.printStackTrace();
        }
        
        return historial;
    }
    
    // Obtener todas las conversaciones
    public List<Chatbot> obtenerTodasConversaciones(int limite) {
        List<Chatbot> conversaciones = new ArrayList<>();
        String sql = "SELECT * FROM chatbot ORDER BY fecha_consulta DESC LIMIT ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, limite);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Chatbot chat = new Chatbot();
                    chat.setId(rs.getInt("id"));
                    Integer idUsuario = (Integer) rs.getObject("id_usuario");
                    chat.setIdUsuario(idUsuario);
                    chat.setMensajeRecibido(rs.getString("mensaje_recibido"));
                    chat.setMensajeRespuesta(rs.getString("mensaje_respuesta"));
                    chat.setFechaConsulta(rs.getTimestamp("fecha_consulta"));
                    chat.setIpOrigen(rs.getString("ip_origen"));
                    conversaciones.add(chat);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error al obtener conversaciones: " + e.getMessage());
            e.printStackTrace();
        }
        
        return conversaciones;
    }
}
