package model;

import java.math.BigDecimal;
import java.util.Date;

public class Prestamo {
    private int id;
    private int libroId;
    private int usuarioId;
    private Date fechaPrestamo;
    private Date fechaDevolucionEsperada;
    private Date fechaDevolucionReal;
    private String estado; // prestado, devuelto, vencido, perdido
    private BigDecimal multa;
    private boolean pagado;
    private String observacionesEntrega;
    private String observacionesDevolucion;
    
    // Campos joined para mostrar información completa
    private String libroNombre;
    private String libroIsbn;
    private String usuarioNombre;
    private String usuarioDni;
    
    public Prestamo() {
        this.multa = BigDecimal.ZERO;
        this.pagado = false;
    }
    
    // Getters y Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getLibroId() {
        return libroId;
    }
    
    public void setLibroId(int libroId) {
        this.libroId = libroId;
    }
    
    public int getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public Date getFechaPrestamo() {
        return fechaPrestamo;
    }
    
    public void setFechaPrestamo(Date fechaPrestamo) {
        this.fechaPrestamo = fechaPrestamo;
    }
    
    public Date getFechaDevolucionEsperada() {
        return fechaDevolucionEsperada;
    }
    
    public void setFechaDevolucionEsperada(Date fechaDevolucionEsperada) {
        this.fechaDevolucionEsperada = fechaDevolucionEsperada;
    }
    
    public Date getFechaDevolucionReal() {
        return fechaDevolucionReal;
    }
    
    public void setFechaDevolucionReal(Date fechaDevolucionReal) {
        this.fechaDevolucionReal = fechaDevolucionReal;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public BigDecimal getMulta() {
        return multa;
    }
    
    public void setMulta(BigDecimal multa) {
        this.multa = multa;
    }
    
    public boolean isPagado() {
        return pagado;
    }
    
    public void setPagado(boolean pagado) {
        this.pagado = pagado;
    }
    
    public String getObservacionesEntrega() {
        return observacionesEntrega;
    }
    
    public void setObservacionesEntrega(String observacionesEntrega) {
        this.observacionesEntrega = observacionesEntrega;
    }
    
    public String getObservacionesDevolucion() {
        return observacionesDevolucion;
    }
    
    public void setObservacionesDevolucion(String observacionesDevolucion) {
        this.observacionesDevolucion = observacionesDevolucion;
    }
    
    // Getters y Setters para campos joined
    public String getLibroNombre() {
        return libroNombre;
    }
    
    public void setLibroNombre(String libroNombre) {
        this.libroNombre = libroNombre;
    }
    
    public String getLibroIsbn() {
        return libroIsbn;
    }
    
    public void setLibroIsbn(String libroIsbn) {
        this.libroIsbn = libroIsbn;
    }
    
    public String getUsuarioNombre() {
        return usuarioNombre;
    }
    
    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }
    
    public String getUsuarioDni() {
        return usuarioDni;
    }
    
    public void setUsuarioDni(String usuarioDni) {
        this.usuarioDni = usuarioDni;
    }
}
