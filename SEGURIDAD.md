# Análisis de Seguridad - Sistema de Biblioteca Escolar

## Resumen Ejecutivo

Este documento identifica las vulnerabilidades de seguridad encontradas en el sistema de gestión de biblioteca escolar. Se clasifican por severidad y se proporciona contexto técnico para cada hallazgo.

**IMPORTANTE**: Este documento es solo informativo. NO se han realizado correcciones al código.

---

## 🔴 Vulnerabilidades Críticas

### 1. Credenciales de Base de Datos Expuestas en Código Fuente

**Archivo**: `src/java/config/DatabaseConfig.java`

**Descripción**: Las credenciales de la base de datos están hardcodeadas directamente en el código fuente:

```java
public static final String DB_USER = "root";
public static final String DB_PASSWORD = "12345678";
```

**Riesgo**: 
- Exposición de credenciales si el código fuente es comprometido
- Usuario `root` tiene privilegios totales sobre el servidor MySQL
- Contraseña débil y predecible
- Imposibilidad de cambiar credenciales sin recompilar

**Impacto**: CRÍTICO - Compromiso total de la base de datos

**Recomendación**:
- Usar variables de entorno o archivos de configuración externos
- Implementar un usuario de BD con privilegios mínimos necesarios
- Usar contraseñas fuertes y únicas
- Considerar cifrado de credenciales con herramientas como Jasypt

---

### 2. Ausencia de Protección contra SQL Injection en Algunos Métodos

**Archivos**: Varios DAOs

**Descripción**: Aunque la mayoría de consultas usan `PreparedStatement`, existen puntos donde se construyen consultas dinámicamente:

```java
// Ejemplo en PrestamoDAO - línea de construcción dinámica
StringBuilder sql = new StringBuilder();
sql.append("WHERE ").append(condicionBase).append(" ");
```

**Riesgo**:
- Potencial inyección SQL si `condicionBase` contiene entrada del usuario
- Ejecución de comandos SQL maliciosos
- Lectura/modificación no autorizada de datos

**Impacto**: CRÍTICO - Compromiso de integridad de datos

**Recomendación**:
- Validar y sanitizar TODAS las entradas de usuario
- Evitar concatenación de strings en SQL
- Usar únicamente PreparedStatements con placeholders
- Implementar ORM como JPA/Hibernate para mayor seguridad

---

### 3. Hash SHA-256 sin Salt para Contraseñas

**Archivo**: `src/java/util/PasswordUtil.java`

**Descripción**: Las contraseñas se encriptan con SHA-256 simple, sin salt aleatorio:

```java
public static String hashPassword(String password) {
    MessageDigest md = MessageDigest.getInstance("SHA-256");
    byte[] hash = md.digest(password.getBytes());
    // ...
}
```

**Riesgo**:
- Vulnerable a ataques de tablas rainbow
- Contraseñas idénticas generan hashes idénticos
- SHA-256 es rápido, facilitando ataques de fuerza bruta
- Método `generateSalt()` existe pero NO se usa en `hashPassword()`

**Impacto**: CRÍTICO - Compromiso de credenciales de usuarios

**Recomendación**:
- Implementar bcrypt, scrypt o Argon2 (algoritmos diseñados para contraseñas)
- Usar salt único y aleatorio por cada contraseña
- Aplicar múltiples iteraciones (key stretching)
- Migrar contraseñas existentes al nuevo sistema

---

## 🟠 Vulnerabilidades Altas

### 4. Falta de Control de Acceso en Endpoints

**Archivos**: Todos los Servlets

**Descripción**: No existe validación de sesión o roles en los métodos `doGet()` y `doPost()`:

```java
@Override
protected void doGet(HttpServletRequest request, HttpServletResponse response) {
    // No hay verificación de sesión
    String accion = request.getParameter("accion");
    // ...
}
```

**Riesgo**:
- Cualquier usuario puede acceder a cualquier endpoint
- No se valida si el usuario tiene permisos para la acción
- Posible escalada de privilegios

**Impacto**: ALTO - Acceso no autorizado a funcionalidades

**Recomendación**:
- Implementar filtros de autenticación (Filter)
- Validar sesión en cada petición protegida
- Implementar autorización basada en roles
- Usar anotaciones de seguridad de Jakarta EE

---

### 5. Exposición de Información Sensible en Mensajes de Error

**Archivos**: Múltiples servlets y DAOs

**Descripción**: Los stacktraces y mensajes de error revelan estructura interna:

```java
} catch (SQLException e) {
    e.printStackTrace();
    enviarError(response, "Error en el servidor: " + e.getMessage());
}
```

**Riesgo**:
- Revelación de estructura de base de datos
- Exposición de rutas de archivos del servidor
- Información útil para atacantes

**Impacto**: ALTO - Facilita otros ataques

**Recomendación**:
- Usar mensajes genéricos para el usuario
- Registrar detalles técnicos solo en logs del servidor
- Implementar sistema de logging robusto (Log4j, SLF4J)
- Páginas de error personalizadas sin detalles técnicos

---

### 6. Falta de Protección CSRF (Cross-Site Request Forgery)

**Archivos**: Todos los formularios y endpoints POST

**Descripción**: No existe validación de tokens CSRF en formularios:

```java
protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    // No hay verificación de token CSRF
    String accion = request.getParameter("accion");
    // Procesa directamente la acción
}
```

**Riesgo**:
- Ataques CSRF pueden ejecutar acciones en nombre del usuario
- Creación/modificación/eliminación no autorizada de datos

**Impacto**: ALTO - Compromiso de acciones del usuario

**Recomendación**:
- Implementar tokens CSRF en todos los formularios
- Validar token en cada petición POST
- Usar librerías como OWASP CSRF Guard
- Implementar patrón Synchronizer Token

---

### 7. Sesiones sin Configuración de Seguridad Adecuada

**Archivo**: `web/WEB-INF/web.xml`

**Descripción**: La configuración de sesiones carece de banderas de seguridad:

```xml
<session-config>
    <session-timeout>30</session-timeout>
</session-config>
```

**Riesgo**:
- Cookies de sesión sin flag `HttpOnly` (vulnerable a XSS)
- Cookies sin flag `Secure` (pueden transmitirse por HTTP)
- No hay protección contra fijación de sesión

**Impacto**: ALTO - Robo de sesiones

**Recomendación**:
- Configurar `HttpOnly` y `Secure` en cookies de sesión
- Implementar regeneración de ID de sesión tras login
- Considerar `SameSite=Strict` para cookies
- Usar HTTPS en producción

---

## 🟡 Vulnerabilidades Medias

### 8. Ausencia de Límite de Intentos de Login Global

**Archivo**: `src/java/controller/LoginServlet.java`

**Descripción**: Solo se limitan intentos por sesión, no por IP o usuario:

```java
Integer intentos = (Integer) session.getAttribute("intentosLogin");
// ...
if (intentos >= MAX_INTENTOS) {
    usuarioDAO.desactivar(usuario);
}
```

**Riesgo**:
- Posible ataque de fuerza bruta desde múltiples sesiones
- Denegación de servicio al bloquear usuarios legítimos

**Impacto**: MEDIO - Ataques de fuerza bruta

**Recomendación**:
- Implementar rate limiting por IP
- Usar CAPTCHA tras varios intentos fallidos
- Implementar bloqueo temporal en lugar de permanente
- Registrar intentos fallidos para análisis

---

### 9. Validación Insuficiente de Entrada de Usuario

**Archivos**: Múltiples servlets

**Descripción**: Validación limitada de parámetros recibidos:

```java
String nombre = request.getParameter("nombre");
if (nombre == null || nombre.trim().isEmpty()) {
    // Solo valida que no esté vacío
}
```

**Riesgo**:
- Inyección de código HTML/JavaScript (XSS)
- Caracteres especiales pueden causar problemas
- Longitud no validada puede causar problemas de BD

**Impacto**: MEDIO - XSS, corrupción de datos

**Recomendación**:
- Validar tipo, formato, longitud y contenido
- Sanitizar entrada para prevenir XSS
- Usar expresiones regulares para validación
- Implementar librerías de validación (Bean Validation)

---

### 10. Gestión Inadecuada de Recursos

**Archivos**: Varios DAOs

**Descripción**: Algunos métodos no garantizan el cierre de recursos:

```java
PreparedStatement stmt = conn.prepareStatement(sql);
ResultSet rs = stmt.executeQuery();
// Si ocurre excepción antes del close, se pierden recursos
```

**Riesgo**:
- Fuga de conexiones de base de datos
- Agotamiento del pool de conexiones
- Degradación del rendimiento

**Impacto**: MEDIO - Denegación de servicio

**Recomendación**:
- Usar try-with-resources para auto-cierre
- Garantizar cierre en bloques finally
- Implementar timeout en conexiones
- Monitorear uso del pool de conexiones

---

### 11. Ausencia de Encabezados de Seguridad HTTP

**Archivos**: Configuración del servidor

**Descripción**: No se configuran encabezados de seguridad importantes:

```
Falta: Content-Security-Policy
Falta: X-Frame-Options
Falta: X-Content-Type-Options
Falta: Strict-Transport-Security
```

**Riesgo**:
- Vulnerable a clickjacking
- Vulnerable a XSS
- Vulnerable a MIME sniffing

**Impacto**: MEDIO - Múltiples vectores de ataque

**Recomendación**:
- Configurar CSP restrictivo
- Añadir X-Frame-Options: DENY
- Añadir X-Content-Type-Options: nosniff
- Implementar HSTS en producción

---

### 12. Pool de Conexiones sin Timeout ni Validación

**Archivo**: `src/java/singleton/DatabaseConnection.java`

**Descripción**: Las conexiones no se validan antes de usarse:

```java
Connection connection = connectionPool.remove(connectionPool.size() - 1);
if (connection == null || connection.isClosed()) {
    connection = createConnection();
}
```

**Riesgo**:
- Conexiones obsoletas pueden quedar en el pool
- No hay timeout para conexiones ociosas
- Posible acumulación de conexiones muertas

**Impacto**: MEDIO - Problemas de rendimiento

**Recomendación**:
- Validar conexiones antes de entregarlas (isValid())
- Implementar timeout para conexiones ociosas
- Considerar usar pools profesionales (HikariCP, c3p0)
- Implementar heartbeat para mantener conexiones vivas

---

## 🟢 Vulnerabilidades Bajas

### 13. Uso de System.out y System.err para Logging

**Archivos**: Todos los DAOs y Servlets

**Descripción**: Se usa `System.err.println()` para errores:

```java
System.err.println("Error al validar usuario: " + e.getMessage());
e.printStackTrace();
```

**Riesgo**:
- Sin niveles de log (INFO, WARN, ERROR)
- Dificulta auditoría y debugging
- No hay rotación de logs

**Impacto**: BAJO - Problemas de mantenimiento

**Recomendación**:
- Implementar framework de logging (SLF4J + Logback)
- Configurar niveles de log apropiados
- Implementar rotación y archivado de logs
- Separar logs de aplicación, acceso y errores

---

### 14. Comentarios Genéricos y Poco Descriptivos

**Archivos**: Código fuente en general

**Descripción**: Comentarios que parecen generados automáticamente:

```java
/**
 * Data Access Object para Usuario
 */
public class UsuarioDAO {
    
    /**
     * Valida las credenciales de un usuario
     */
```

**Riesgo**:
- Dificulta mantenimiento
- Puede indicar uso de generadores de código
- Falta de documentación de lógica compleja

**Impacto**: BAJO - Problemas de mantenibilidad

**Nota**: Este será corregido como parte de los cambios solicitados.

---

### 15. Falta de Manejo de Inyección de Encabezados HTTP

**Archivos**: Servlets que manejan redirecciones

**Descripción**: No se validan parámetros usados en redirecciones:

```java
response.sendRedirect(request.getContextPath() + "/pages/dashboard.jsp");
```

**Riesgo**:
- Posible HTTP Response Splitting
- Redirección abierta si se usa parámetro no validado

**Impacto**: BAJO - Phishing, XSS

**Recomendación**:
- Validar y sanitizar URLs de redirección
- Usar whitelist de destinos permitidos
- Evitar redirecciones basadas en parámetros del usuario

---

### 16. Exposición de Rutas Internas del Sistema

**Archivos**: Respuestas de error

**Descripción**: Los errores revelan rutas del sistema:

```
Error: java.sql.SQLException at com.mysql.cj.jdbc...
    at dao.UsuarioDAO.validarUsuario(UsuarioDAO.java:45)
```

**Riesgo**:
- Revelación de estructura del proyecto
- Información para reconocimiento de atacantes

**Impacto**: BAJO - Información para otros ataques

**Recomendación**:
- Capturar y ocultar stacktraces en producción
- Usar IDs de error en lugar de mensajes detallados
- Implementar páginas de error genéricas

---

## Hallazgos Positivos

A pesar de las vulnerabilidades encontradas, el sistema implementa algunas buenas prácticas:

✅ Uso mayoritario de `PreparedStatement` en lugar de concatenación SQL
✅ Encriptación de contraseñas (aunque mejorable)
✅ Bloqueo de cuentas tras intentos fallidos
✅ Timeout de sesión configurado
✅ Encoding UTF-8 consistente
✅ Pool de conexiones para mejor rendimiento
✅ Separación clara de responsabilidades (MVC)
✅ Patrón DAO bien implementado

---

## Priorización de Correcciones

### Inmediato (Antes de Producción)
1. Migrar credenciales a variables de entorno
2. Implementar bcrypt para contraseñas
3. Añadir validación de sesión en todos los endpoints
4. Implementar tokens CSRF

### Corto Plazo (1-2 semanas)
5. Configurar encabezados de seguridad HTTP
6. Implementar framework de logging
7. Mejorar validación de entrada
8. Implementar try-with-resources en DAOs

### Mediano Plazo (1-2 meses)
9. Implementar rate limiting y CAPTCHA
10. Migrar a pool de conexiones profesional
11. Auditoría completa de SQL injection
12. Implementar sistema de autorización robusto

---

## Herramientas Recomendadas para Testing

- **OWASP ZAP**: Escaneo de vulnerabilidades web
- **SQLMap**: Detección de SQL injection
- **Burp Suite**: Testing de seguridad manual
- **SonarQube**: Análisis estático de código
- **Dependency-Check**: Verificación de vulnerabilidades en librerías

---

## Conclusión

El sistema presenta vulnerabilidades significativas que deben ser abordadas antes de un despliegue en producción. La mayoría de los problemas identificados son comunes en aplicaciones web y tienen soluciones bien documentadas.

**Nivel de Riesgo General**: ALTO

Se recomienda **NO desplegar** el sistema en producción sin corregir al menos las vulnerabilidades críticas y altas identificadas en este documento.

---

**Fecha de Análisis**: Noviembre 2025  
**Analista**: Sistema Automatizado de Análisis de Seguridad  
**Versión del Sistema**: 2.0
