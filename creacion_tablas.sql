-- ============================================
-- SISTEMA DE GESTIÓN DE BIBLIOTECA
-- Base de datos MySQL
-- ============================================
--Crear Base de Datos
CREATE DATABASE biblioteca_virtual;

USE biblioteca_virtual;

-- Tabla ROL
CREATE TABLE ROL (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
);

-- Tabla USUARIO
CREATE TABLE USUARIO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_rol INT,
    activo TINYINT(1) DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES ROL(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_usuario (usuario),
    INDEX idx_email (email),
    INDEX idx_id_rol (id_rol),
    INDEX idx_activo (activo)
);

-- Tabla CODIGOS_BARRAS
CREATE TABLE CODIGOS_BARRAS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_caducidad DATETIME NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    tipo ENUM('temporal', 'permanente') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_id_usuario (id_usuario),
    INDEX idx_activo (activo),
    INDEX idx_fecha_caducidad (fecha_caducidad)
);

-- Tabla LIBRO
CREATE TABLE LIBRO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    editorial VARCHAR(100),
    año_publicacion YEAR,
    genero VARCHAR(50),
    descripcion TEXT,
    stock INT NOT NULL DEFAULT 0,
    stock_disponible INT NOT NULL DEFAULT 0,
    ubicacion VARCHAR(50),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_nombre (nombre),
    INDEX idx_autor (autor),
    INDEX idx_isbn (isbn),
    INDEX idx_genero (genero),
    INDEX idx_activo (activo),
    INDEX idx_stock_disponible (stock_disponible)
);

-- Tabla ENTREGAS
CREATE TABLE ENTREGAS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_libro INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_entrega DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_programada DATE NOT NULL,
    fecha_devolucion_real DATETIME,
    estado ENUM('prestado', 'devuelto', 'vencido', 'perdido') NOT NULL DEFAULT 'prestado',
    observaciones TEXT,
    multa DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id_libro) REFERENCES LIBRO(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_id_libro (id_libro),
    INDEX idx_id_usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha_devolucion_programada (fecha_devolucion_programada),
    INDEX idx_fecha_entrega (fecha_entrega)
);

-- Tabla CHATBOT
CREATE TABLE CHATBOT (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NULL,
    mensaje_recibido TEXT NOT NULL,
    mensaje_respuesta TEXT NOT NULL,
    fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_id_usuario (id_usuario),
    INDEX idx_fecha_consulta (fecha_consulta),
    INDEX idx_ip_origen (ip_origen)
);

-- Roles por defecto
INSERT INTO ROL (rol, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Usuario', 'Consulta y préstamo de libros');


-- Trigger para validar stock disponible
DELIMITER $$
CREATE TRIGGER trg_validar_stock_disponible
BEFORE UPDATE ON LIBRO
FOR EACH ROW
BEGIN
    IF NEW.stock_disponible > NEW.stock THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El stock disponible no puede ser mayor al stock total';
    END IF;
    IF NEW.stock_disponible < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El stock disponible no puede ser negativo';
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar estado de préstamos vencidos
DELIMITER $$
CREATE TRIGGER trg_verificar_prestamo_vencido
BEFORE UPDATE ON ENTREGAS
FOR EACH ROW
BEGIN
    IF NEW.estado = 'prestado' AND NEW.fecha_devolucion_programada < CURDATE() THEN
        SET NEW.estado = 'vencido';
    END IF;
END$$
DELIMITER ;




-- ============================================
-- DATOS INICIALES - SISTEMA DE GESTIÓN DE BIBLIOTECA
-- ============================================

-- Asegurarse de estar en la base de datos correcta
USE biblioteca_escolar;

-- Insertar roles (si no existen)
INSERT INTO ROL (id, rol, descripcion, activo) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 1),
(2, 'Usuario', 'Consulta y préstamo de libros', 1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar usuarios de prueba
-- Las contraseñas están encriptadas con SHA-256:
-- admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- user123  -> e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446

INSERT INTO USUARIO (usuario, nombre, apellido, email, contrasena, telefono, direccion, id_rol, activo) VALUES
('admin', 'Administrador', 'Sistema', 'admin@biblioteca.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '555-0001', 'Oficina Central', 1, 1),
('usuario', 'Usuario', 'Prueba', 'usuario@biblioteca.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-0002', 'Sede Principal', 2, 1);

-- Verificar que los usuarios fueron creados correctamente
SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, r.rol 
FROM USUARIO u 
INNER JOIN ROL r ON u.id_rol = r.id 
WHERE u.activo = 1;
