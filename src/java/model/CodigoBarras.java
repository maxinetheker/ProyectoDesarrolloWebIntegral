package model;

import java.time.LocalDateTime;

// Representa el código de barras del carnet de un usuario
// Puede ser temporal (1 año) o permanente
public class CodigoBarras {
    private int id;
    private int idUsuario;
    private String codigo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCaducidad;
    private boolean activo;
    private String tipo; // puede ser 'temporal' o 'permanente'
    
    // Info del usuario cuando hacemos JOIN con la tabla usuarios
    private String nombreUsuario;
    private String nombreCompleto;
    
    public CodigoBarras() {
    }
    
    public CodigoBarras(int idUsuario, String codigo, LocalDateTime fechaCaducidad, String tipo) {
        this.idUsuario = idUsuario;
        this.codigo = codigo;
        this.fechaCreacion = LocalDateTime.now();
        this.fechaCaducidad = fechaCaducidad;
        this.activo = true;
        this.tipo = tipo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaCaducidad() {
        return fechaCaducidad;
    }

    public void setFechaCaducidad(LocalDateTime fechaCaducidad) {
        this.fechaCaducidad = fechaCaducidad;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }
    
    // Chequea si ya pasó la fecha de caducidad
    public boolean estaVencido() {
        return LocalDateTime.now().isAfter(fechaCaducidad);
    }
    
    @Override
    public String toString() {
        return "CodigoBarras{" +
                "id=" + id +
                ", idUsuario=" + idUsuario +
                ", codigo='" + codigo + '\'' +
                ", fechaCreacion=" + fechaCreacion +
                ", fechaCaducidad=" + fechaCaducidad +
                ", activo=" + activo +
                ", tipo='" + tipo + '\'' +
                '}';
    }
}
