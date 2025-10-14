# Sistema de Gestión de Biblioteca

Sistema web desarrollado con Jakarta EE, JSP, y MySQL para la gestión integral de una biblioteca.

## 🚀 Características

- ✅ Sistema de autenticación seguro con encriptación SHA-256
- ✅ Gestión de roles (Administrador y Usuario)
- ✅ Patrón de diseño Singleton para conexión a BD
- ✅ Arquitectura MVC con DTO y DAO
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Dashboard interactivo

## 📋 Requisitos

- Java 8 o superior
- Apache Tomcat 9+ o servidor compatible con Jakarta EE
- MySQL 8.0+
- MySQL Connector/J 8.0.28 (incluido)

## 🔧 Configuración

### 1. Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE biblioteca;

-- Ejecutar el script de tablas
USE biblioteca;
SOURCE db/consultas.sql;

-- Insertar datos iniciales
SOURCE db/datos_iniciales.sql;
```

### 2. Configuración del Proyecto

La configuración de la base de datos está en:
```
src/java/config/DatabaseConfig.java
```

Valores por defecto:
- **Usuario:** root
- **Contraseña:** 12345678
- **Base de datos:** biblioteca
- **Puerto:** 3306

### 3. Despliegue

1. Compilar el proyecto en NetBeans
2. Desplegar en Apache Tomcat
3. Acceder a: `http://localhost:8080/[nombre-proyecto]/login.jsp`

## 👥 Usuarios de Prueba

### Administrador
- **Usuario:** admin
- **Contraseña:** admin123
- **Permisos:** Acceso completo al sistema

### Usuario Regular
- **Usuario:** usuario
- **Contraseña:** user123
- **Permisos:** Consulta y préstamo de libros

## 📁 Estructura del Proyecto

```
src/java/
├── config/
│   └── DatabaseConfig.java       # Configuración de BD
├── singleton/
│   └── DatabaseConnection.java   # Patrón Singleton para conexión
├── util/
│   └── PasswordUtil.java         # Utilidades para encriptación
├── dto/
│   ├── UsuarioDTO.java          # Data Transfer Object - Usuario
│   └── RolDTO.java              # Data Transfer Object - Rol
├── dao/
│   └── UsuarioDAO.java          # Data Access Object - Usuario
└── model/
    ├── LoginServlet.java        # Servlet de inicio de sesión
    └── LogoutServlet.java       # Servlet de cierre de sesión

web/
├── login.jsp                    # Página de inicio de sesión
└── dashboard.jsp                # Dashboard principal
```

## 🔐 Seguridad

- Las contraseñas se almacenan encriptadas con SHA-256
- Validación de sesión en todas las páginas protegidas
- Timeout de sesión: 30 minutos
- Protección contra SQL Injection con PreparedStatements

## 🎨 Tecnologías

- **Backend:** Jakarta EE, Java Servlets, JSP
- **Frontend:** Tailwind CSS, Font Awesome
- **Base de Datos:** MySQL 8.0
- **Servidor:** Apache Tomcat
- **Patrones:** Singleton, DAO, DTO, MVC

## 📝 Notas Importantes

1. Asegúrate de que MySQL esté corriendo antes de iniciar la aplicación
2. Verifica que el driver MySQL Connector/J esté en la carpeta `WEB-INF/lib`
3. La primera vez que ejecutes, asegúrate de crear la base de datos y ejecutar los scripts
4. Las contraseñas en la base de datos están encriptadas, no uses texto plano

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Comprueba el usuario y contraseña en `DatabaseConfig.java`
- Asegúrate de que la base de datos `biblioteca` exista

### Error 404 en login
- Verifica que el contexto del proyecto esté correctamente configurado
- Asegúrate de que los servlets estén correctamente anotados

### Sesión no se mantiene
- Verifica que las cookies estén habilitadas en el navegador
- Comprueba la configuración de timeout en `LoginServlet.java`

## 📧 Contacto

Sistema desarrollado para Desarrollo Web Integral - 2025
