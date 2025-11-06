# Sistema de Gestión de Biblioteca Escolar

## Descripción General

Este es un sistema web completo para la gestión de una biblioteca escolar desarrollado con Java EE (Jakarta EE), que permite administrar el catálogo de libros, préstamos, devoluciones, multas y usuarios. El sistema implementa un patrón de arquitectura MVC (Modelo-Vista-Controlador) con una capa de acceso a datos bien definida.

## Arquitectura del Sistema

### Tecnologías Utilizadas

- **Backend:**
  - Java (Jakarta EE)
  - Servlets para manejo de peticiones HTTP
  - JDBC para acceso a base de datos MySQL
  - Jackson para serialización/deserialización JSON
  
- **Frontend:**
  - JSP (JavaServer Pages)
  - JavaScript vanilla
  - CSS personalizado
  - SweetAlert2 para notificaciones
  - Chart.js para gráficos estadísticos
  - JsBarcode para generación de códigos de barras

- **Base de Datos:**
  - MySQL 8.x
  - Sistema de pooling de conexiones personalizado

### Patrón de Arquitectura

El proyecto sigue el patrón **MVC (Modelo-Vista-Controlador)** con las siguientes capas:

```
┌─────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN               │
│        (JSP + JavaScript + CSS)                 │
└────────────────┬────────────────────────────────┘
                 │ HTTP Request/Response
┌────────────────▼────────────────────────────────┐
│          CAPA DE CONTROLADORES                  │
│              (Servlets)                         │
│  - LoginServlet, LibroServlet, etc.            │
└────────────────┬────────────────────────────────┘
                 │ Llamadas a métodos
┌────────────────▼────────────────────────────────┐
│          CAPA DE ACCESO A DATOS                 │
│                  (DAO)                          │
│  - UsuarioDAO, LibroDAO, PrestamoDAO           │
└────────────────┬────────────────────────────────┘
                 │ SQL Queries
┌────────────────▼────────────────────────────────┐
│         CAPA DE PERSISTENCIA                    │
│     (MySQL + Connection Pool)                   │
└─────────────────────────────────────────────────┘
```

## Estructura del Proyecto

### Modelos (`src/java/model/`)

Los modelos representan las entidades del dominio:

- **`Usuario`**: Información de los usuarios del sistema (estudiantes, bibliotecarios, administradores)
- **`Libro`**: Catálogo de libros disponibles en la biblioteca
- **`Prestamo`**: Registro de préstamos de libros a usuarios
- **`Rol`**: Roles del sistema que definen permisos
- **`CodigoBarras`**: Códigos de barras para identificación de usuarios
- **`Chatbot`**: Historial de consultas al asistente virtual

### Capa DAO (`src/java/dao/`)

Los Data Access Objects encapsulan toda la lógica de acceso a datos:

- **`UsuarioDAO`**: Gestión de usuarios
  - Validación de credenciales
  - CRUD de usuarios
  - Búsqueda con paginación
  - Gestión de estados activo/inactivo
  
- **`LibroDAO`**: Gestión del catálogo
  - CRUD de libros
  - Control de inventario (stock total y disponible)
  - Búsqueda y filtrado de libros
  - Autocompletado para búsquedas rápidas
  
- **`PrestamoDAO`**: Gestión de préstamos
  - Creación de préstamos
  - Registro de devoluciones
  - Cálculo y gestión de multas
  - Historial de préstamos por libro/usuario
  - Extensión de plazos
  
- **`RolDAO`**: Gestión de roles del sistema
- **`CodigoBarrasDAO`**: Gestión de códigos de barras para carnets
- **`ChatbotDAO`**: Almacenamiento de conversaciones del chatbot

### Controladores (`src/java/controller/`)

Los Servlets procesan las peticiones HTTP y coordinan la lógica de negocio:

| Servlet | URL Pattern | Descripción |
|---------|------------|-------------|
| `LoginServlet` | `/login` | Autenticación de usuarios |
| `LogoutServlet` | `/logout` | Cierre de sesión |
| `DashboardServlet` | `/dashboard` | Panel de control con estadísticas |
| `LibroServlet` | `/libros` | Gestión de libros (CRUD) |
| `PrestamoServlet` | `/prestamos` | Gestión de préstamos y devoluciones |
| `UsuarioServlet` | `/usuarios` | Gestión de usuarios |
| `CatalogoServlet` | `/catalogo` | Catálogo público de libros |
| `MisPrestamosServlet` | `/mis-prestamos` | Consulta de préstamos del usuario |
| `MisMultasServlet` | `/mis-multas` | Consulta de multas del usuario |
| `CarnetServlet` | `/carnet` | Generación de carnets con código de barras |
| `ChatbotServlet` | `/chatbot` | API del asistente virtual |
| `PublicServlet` | `/public` | Endpoints públicos sin autenticación |
| `UploadImageServlet` | `/uploadImage` | Carga de imágenes de portadas |

### Utilidades (`src/java/util/` y `src/java/singleton/`)

- **`PasswordUtil`**: Encriptación de contraseñas con SHA-256
- **`DatabaseConnection`**: Patrón Singleton con pool de conexiones
- **`DatabaseConfig`**: Configuración centralizada de la base de datos

## Sistema de Roles

El sistema implementa tres roles principales con diferentes niveles de acceso:

### 1. Administrador (`id_rol = 1`)
- Acceso completo al sistema
- Gestión de usuarios (crear, editar, activar/desactivar)
- Gestión completa del catálogo de libros
- Gestión de todos los préstamos y devoluciones
- Gestión de multas
- Visualización de estadísticas y reportes
- Acceso al panel de administración

### 2. Bibliotecario (`id_rol = 2`)
- Gestión del catálogo de libros
- Registro de préstamos y devoluciones
- Consulta de préstamos pendientes
- Gestión de multas
- No puede gestionar usuarios administradores

### 3. Usuario/Estudiante (`id_rol = 3`)
- Consulta del catálogo público
- Visualización de sus propios préstamos
- Visualización de sus multas
- Generación de carnet con código de barras
- Interacción con el chatbot
- No tiene acceso al panel de administración

## Comunicación Cliente-Servidor

### Arquitectura de Comunicación

El sistema utiliza una arquitectura híbrida:

1. **Renderizado del lado del servidor (SSR)**: Las páginas JSP se renderizan en el servidor
2. **API REST-like**: Los servlets exponen endpoints que responden con JSON para operaciones CRUD
3. **AJAX**: JavaScript realiza peticiones asíncronas sin recargar la página

### Tipos de Peticiones HTTP

#### GET - Consulta de Datos

Se utiliza para obtener información sin modificar el estado del servidor:

```javascript
// Ejemplo: Listar libros con paginación
GET /libros?accion=listar&pagina=1&busqueda=cien

// Respuesta JSON:
{
  "success": true,
  "libros": [...],
  "paginaActual": 1,
  "totalPaginas": 5,
  "totalRegistros": 47
}
```

**Casos de uso GET:**
- Listar registros con paginación
- Buscar registros
- Obtener detalles de un registro específico
- Autocompletado en formularios
- Obtener estadísticas del dashboard

#### POST - Modificación de Datos

Se utiliza para crear, actualizar o eliminar recursos:

```javascript
// Ejemplo: Crear un nuevo libro
POST /libros?accion=crear
Content-Type: application/x-www-form-urlencoded

nombre=Cien años de soledad&autor=Gabriel García Márquez&isbn=9780307474728...

// Respuesta JSON:
{
  "success": true,
  "message": "Libro creado exitosamente"
}
```

**Casos de uso POST:**
- Crear nuevos registros (libros, usuarios, préstamos)
- Actualizar registros existentes
- Cambiar estados (activar/desactivar)
- Registrar devoluciones
- Marcar multas como pagadas
- Autenticación de usuarios

### Formato de Respuestas

Todas las respuestas JSON siguen un formato estándar:

```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": { /* datos específicos */ }
}
```

### Manejo de Errores

El sistema implementa múltiples capas de manejo de errores:

1. **Validación en el cliente**: JavaScript valida datos antes de enviarlos
2. **Validación en el servidor**: Los servlets validan parámetros recibidos
3. **Manejo de excepciones SQL**: Try-catch en todos los métodos DAO
4. **Respuestas de error HTTP**: Códigos 400 (Bad Request), 404 (Not Found), 500 (Server Error)

## Pool de Conexiones

El sistema implementa un pool de conexiones personalizado para optimizar el rendimiento:

### Características del Pool

- **Conexiones iniciales**: 10 conexiones al iniciar
- **Máximo de conexiones**: 20 conexiones simultáneas
- **Patrón Singleton**: Una única instancia del pool en toda la aplicación
- **Reutilización**: Las conexiones se devuelven al pool después de usarse
- **Auto-creación**: Si no hay conexiones disponibles, se crean nuevas (hasta el máximo)

### Ciclo de Vida de una Conexión

```java
// 1. Obtener conexión del pool
Connection conn = DatabaseConnection.getInstance().getConnection();

try {
    // 2. Ejecutar operaciones SQL
    PreparedStatement stmt = conn.prepareStatement(sql);
    ResultSet rs = stmt.executeQuery();
    
    // 3. Procesar resultados
    while (rs.next()) {
        // ...
    }
    
} catch (SQLException e) {
    // 4. Manejo de errores
    e.printStackTrace();
} finally {
    // 5. CRÍTICO: Devolver conexión al pool
    if (conn != null) {
        DatabaseConnection.getInstance().releaseConnection(conn);
    }
}
```

## Seguridad Implementada

### Autenticación

- Hash SHA-256 para contraseñas almacenadas
- Validación de credenciales en cada login
- Bloqueo de cuenta tras 3 intentos fallidos
- Sesiones con timeout de 30 minutos

### Control de Acceso

- Verificación de sesión en cada página protegida
- Validación de roles para funcionalidades específicas
- Redirección a login si no hay sesión activa

### Protección de Datos

- Uso de `PreparedStatement` para prevenir SQL Injection básica
- Encoding UTF-8 en todas las peticiones
- Validación de tipos de datos en servlets

## Flujos Principales

### Flujo de Autenticación

```
1. Usuario ingresa credenciales → LoginServlet
2. Servlet encripta contraseña con SHA-256
3. UsuarioDAO consulta base de datos
4. Si es válido: crear sesión y redirigir a dashboard
5. Si es inválido: incrementar contador de intentos
6. Si alcanza 3 intentos: bloquear usuario
```

### Flujo de Préstamo

```
1. Bibliotecario busca libro y usuario
2. PrestamoServlet valida disponibilidad
3. PrestamoDAO crea registro de préstamo
4. LibroDAO decrementa stock_disponible
5. Sistema calcula fecha de devolución
6. Respuesta exitosa al cliente
```

### Flujo de Devolución

```
1. Bibliotecario registra devolución
2. Sistema verifica si hay retraso
3. Si hay retraso: calcula multa automáticamente
4. PrestamoDAO actualiza registro
5. LibroDAO incrementa stock_disponible (si no está perdido)
6. Sistema actualiza estado del préstamo
```

## Paginación y Búsqueda

Todos los listados implementan paginación para mejorar el rendimiento:

- **Registros por página**: 10 (configurable)
- **Búsqueda en tiempo real**: Filtrado por múltiples campos
- **SQL optimizado**: LIMIT y OFFSET para consultas eficientes
- **Metadatos de paginación**: Total de páginas, registros, posición actual

## Base de Datos

### Tablas Principales

- `USUARIO`: Información de usuarios del sistema
- `ROL`: Roles y permisos
- `LIBRO`: Catálogo de libros
- `ENTREGAS`: Registro de préstamos (nombre histórico)
- `CODIGOS_BARRAS`: Códigos para carnets de usuarios
- `CHATBOT`: Historial de consultas al chatbot

### Relaciones Clave

```
USUARIO (id_rol) → ROL (id)
ENTREGAS (id_usuario) → USUARIO (id)
ENTREGAS (id_libro) → LIBRO (id)
CODIGOS_BARRAS (id_usuario) → USUARIO (id)
CHATBOT (id_usuario) → USUARIO (id)
```

## Características Especiales

### Generación de Códigos de Barras

- Formato: `LIB-YYYY-NNNNN-RANDOM`
- Códigos temporales (1 año) o permanentes
- Validación de fecha de caducidad
- Generación con JsBarcode en el frontend

### Chatbot

- Sistema de preguntas frecuentes
- Almacenamiento de historial de consultas
- Respuestas predefinidas sobre horarios, servicios, etc.

### Dashboard con Estadísticas

- Total de libros en catálogo
- Libros en préstamo actualmente
- Usuarios activos
- Multas pendientes de pago
- Gráficos con Chart.js

### Sistema de Multas

- Cálculo automático por días de retraso
- Estado de pago (pagado/pendiente)
- Extensión de plazos para casos especiales
- Visualización separada de multas pagadas y pendientes

## Instalación y Configuración

### Requisitos

- JDK 11 o superior
- Apache Tomcat 10.x o superior
- MySQL 8.x
- Maven (opcional, para gestión de dependencias)

### Configuración de Base de Datos

1. Importar el archivo `Base de Datos.sql`
2. Configurar credenciales en `DatabaseConfig.java`:

```java
public static final String DB_URL = "jdbc:mysql://localhost:3306/biblioteca_escolar";
public static final String DB_USER = "root";
public static final String DB_PASSWORD = "tu_contraseña";
```

### Despliegue

1. Compilar el proyecto
2. Generar archivo WAR
3. Desplegar en Tomcat
4. Acceder a `http://localhost:8080/[nombre-app]/login`

### Usuario por Defecto

El sistema incluye un usuario administrador inicial que debe configurarse en la base de datos.

## Mantenimiento

### Logs

Los errores se registran en `System.err` y pueden consultarse en los logs de Tomcat.

### Respaldos

Se recomienda realizar respaldos periódicos de la base de datos, especialmente de las tablas:
- `USUARIO`
- `LIBRO`
- `ENTREGAS`

## Soporte y Contribuciones

Este es un proyecto académico desarrollado para la asignatura de Desarrollo Web Integral.

---

**Versión**: 2.0  
**Última actualización**: Noviembre 2025
