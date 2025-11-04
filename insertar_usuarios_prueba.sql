-- ============================================
-- INSERTAR USUARIOS DE PRUEBA
-- Ejecutar este script después de crear las tablas
-- ============================================

USE biblioteca_virtual;

-- Verificar usuarios existentes
SELECT 'Usuarios actuales:' as info;
SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, r.rol, u.activo 
FROM USUARIO u 
INNER JOIN ROL r ON u.id_rol = r.id;

-- Insertar usuarios adicionales de prueba
-- Contraseñas:
-- admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- user123  -> e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446

INSERT INTO USUARIO (usuario, nombre, apellido, email, contrasena, telefono, direccion, id_rol, activo) 
VALUES
('jperez', 'Juan', 'Pérez', 'juan.perez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1001', 'Av. Principal 123', 2, 1),
('mgarcia', 'María', 'García', 'maria.garcia@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1002', 'Calle Secundaria 456', 2, 1),
('clopez', 'Carlos', 'López', 'carlos.lopez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1003', 'Jr. Los Álamos 789', 2, 1),
('amartinez', 'Ana', 'Martínez', 'ana.martinez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1004', 'Av. Los Pinos 321', 2, 1),
('lrodriguez', 'Luis', 'Rodríguez', 'luis.rodriguez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1005', 'Calle Las Flores 654', 2, 1),
('pfernandez', 'Patricia', 'Fernández', 'patricia.fernandez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1006', 'Jr. San Martín 987', 2, 1),
('rsanchez', 'Roberto', 'Sánchez', 'roberto.sanchez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1007', 'Av. Libertad 147', 2, 1),
('eramirez', 'Elena', 'Ramírez', 'elena.ramirez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1008', 'Calle Comercio 258', 2, 1),
('dtorres', 'Diego', 'Torres', 'diego.torres@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1009', 'Jr. Grau 369', 2, 1),
('sgomez', 'Sofía', 'Gómez', 'sofia.gomez@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1010', 'Av. Industrial 741', 2, 1),
('jflores', 'Jorge', 'Flores', 'jorge.flores@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1011', 'Calle Real 852', 2, 1),
('vcastro', 'Valeria', 'Castro', 'valeria.castro@email.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', '555-1012', 'Jr. Unión 963', 2, 1);

-- Verificar usuarios insertados
SELECT 'Total de usuarios activos:' as info;
SELECT COUNT(*) as total FROM USUARIO WHERE activo = 1;

SELECT 'Lista de todos los usuarios:' as info;
SELECT u.id, u.usuario, u.nombre, u.apellido, u.email, r.rol, u.activo, u.fecha_creacion
FROM USUARIO u 
INNER JOIN ROL r ON u.id_rol = r.id
ORDER BY u.fecha_creacion DESC;
