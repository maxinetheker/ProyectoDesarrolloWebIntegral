-- ============================================
-- SCRIPT DE VERIFICACIÓN Y CREACIÓN DE BD
-- ============================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS biblioteca_escolar;

-- Usar la base de datos
USE biblioteca_escolar;

-- Mostrar las tablas existentes
SHOW TABLES;

-- Verificar si existen las tablas principales
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Las tablas ya existen'
        ELSE '✗ Las tablas NO existen. Ejecuta consultas.sql'
    END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'biblioteca_escolar' 
AND table_name IN ('ROL', 'USUARIO', 'LIBRO', 'ENTREGAS');

-- Verificar roles
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN CONCAT('✓ Roles OK (', COUNT(*), ' roles encontrados)')
        ELSE '✗ Faltan roles. Ejecuta datos_iniciales.sql'
    END AS Estado_Roles
FROM ROL;

-- Verificar usuarios
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN CONCAT('✓ Usuarios OK (', COUNT(*), ' usuarios encontrados)')
        ELSE '✗ Faltan usuarios. Ejecuta datos_iniciales.sql'
    END AS Estado_Usuarios
FROM USUARIO;

-- Mostrar usuarios existentes
SELECT 
    u.id, 
    u.usuario, 
    u.nombre, 
    u.apellido, 
    r.rol,
    u.activo
FROM USUARIO u
LEFT JOIN ROL r ON u.id_rol = r.id;
