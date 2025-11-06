package model;

import java.sql.Timestamp;

// Define los diferentes roles del sistema (admin, bibliotecario, usuario)
public class Rol {
    private int id;
    private String rol;
    private String descripcion;
    private Timestamp fechaCreacion;
    private boolean activo;
    
    public Rol() {}
    
    public Rol(int id, String rol, String descripcion, boolean activo) {
        this.id = id;
        this.rol = rol;
        this.descripcion = descripcion;
        this.activo = activo;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getRol() {
        return rol;
    }
    
    public void setRol(String rol) {
        this.rol = rol;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public boolean isActivo() {
        return activo;
    }
    
    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
