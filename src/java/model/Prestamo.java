package model;

import java.math.BigDecimal;
import java.util.Date;

// Maneja toda la info de un préstamo: quién, qué libro, cuándo se debe devolver, multas, etc
public class Prestamo {
    private int id;
    private int libroId;
    private int usuarioId;
    private Date fechaPrestamo;
    private Date fechaDevolucionEsperada;
    private Date fechaDevolucionReal;
    private String estado; // puede ser: prestado, devuelto, vencido o perdido
    private BigDecimal multa;
    private boolean pagado;
    private String observacionesEntrega;
    private String observacionesDevolucion;
    
    // Estos campos vienen del JOIN con las tablas libro y usuario
    private String libroNombre;
    private String libroAutor;
    private String libroIsbn;
    private String usuarioNombre;
    private String usuarioDni;
    
    public Prestamo() {
        this.multa = BigDecimal.ZERO;
        this.pagado = false;
    }
    
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
    
    public String getLibroAutor() {
        return libroAutor;
    }
    
    public void setLibroAutor(String libroAutor) {
        this.libroAutor = libroAutor;
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
    
    // Métodos alias para mantener compatibilidad con código antiguo del servlet
    public String getLibroTitulo() {
        return this.libroNombre;
    }
    
    public void setLibroTitulo(String titulo) {
        this.libroNombre = titulo;
    }
    
    public int getIdLibro() {
        return this.libroId;
    }
    
    public void setIdLibro(int idLibro) {
        this.libroId = idLibro;
    }
    
    public int getIdUsuario() {
        return this.usuarioId;
    }
    
    public void setIdUsuario(int idUsuario) {
        this.usuarioId = idUsuario;
    }
    
    public Date getFechaEntrega() {
        return this.fechaPrestamo;
    }
    
    public void setFechaEntrega(Date fechaEntrega) {
        this.fechaPrestamo = fechaEntrega;
    }
    
    public Date getFechaDevolucionProgramada() {
        return this.fechaDevolucionEsperada;
    }
    
    public void setFechaDevolucionProgramada(Date fechaDevolucion) {
        this.fechaDevolucionEsperada = fechaDevolucion;
    }
}
