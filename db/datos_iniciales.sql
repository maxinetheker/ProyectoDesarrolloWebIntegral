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
