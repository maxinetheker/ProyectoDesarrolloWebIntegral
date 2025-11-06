package model;

import java.sql.Timestamp;

public class Chatbot {
    private int id;
    private Integer idUsuario; // Puede ser null para usuarios no autenticados
    private String mensajeRecibido;
    private String mensajeRespuesta;
    private Timestamp fechaConsulta;
    private String ipOrigen;
    
    public Chatbot() {}
    
    public Chatbot(Integer idUsuario, String mensajeRecibido, String mensajeRespuesta, String ipOrigen) {
        this.idUsuario = idUsuario;
        this.mensajeRecibido = mensajeRecibido;
        this.mensajeRespuesta = mensajeRespuesta;
        this.ipOrigen = ipOrigen;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public String getMensajeRecibido() {
        return mensajeRecibido;
    }
    
    public void setMensajeRecibido(String mensajeRecibido) {
        this.mensajeRecibido = mensajeRecibido;
    }
    
    public String getMensajeRespuesta() {
        return mensajeRespuesta;
    }
    
    public void setMensajeRespuesta(String mensajeRespuesta) {
        this.mensajeRespuesta = mensajeRespuesta;
    }
    
    public Timestamp getFechaConsulta() {
        return fechaConsulta;
    }
    
    public void setFechaConsulta(Timestamp fechaConsulta) {
        this.fechaConsulta = fechaConsulta;
    }
    
    public String getIpOrigen() {
        return ipOrigen;
    }
    
    public void setIpOrigen(String ipOrigen) {
        this.ipOrigen = ipOrigen;
    }
}
