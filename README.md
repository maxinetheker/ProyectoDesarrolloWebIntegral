# Sistema de Gestión de Biblioteca

Sistema web desarrollado con Jakarta EE, JSP, y MySQL para la gestión integral de una biblioteca, implementando el patrón de arquitectura MVC (Modelo-Vista-Controlador) con tecnologías nativas de Java EE y frameworks modernos.

## � Arquitectura del Proyecto

### Patrón MVC (Modelo-Vista-Controlador)

El proyecto implementa la arquitectura MVC de la siguiente manera:

#### **Modelo (Model)**
Representa la capa de datos y lógica de negocio:
- **`model/`**: Contiene las clases de entidad que representan las estructuras de datos del sistema
- **`dao/`**: Implementa el patrón Data Access Object para la persistencia de datos, proporcionando una abstración de las operaciones CRUD con la base de datos
- **`config/`**: Configuración de la base de datos y parámetros del sistema
- **`singleton/`**: Implementa el patrón Singleton para gestionar la conexión única a la base de datos
- **`util/`**: Utilidades transversales como encriptación de contraseñas

#### **Vista (View)**
Capa de presentación desarrollada con tecnologías Jakarta EE y frameworks CSS:
- **JSP (JavaServer Pages)**: Páginas dinámicas que renderizan la interfaz de usuario
  - `login.jsp`: Página de autenticación
  - `dashboard.jsp`: Panel principal del sistema
- **JSTL (JSP Standard Tag Library)**: Biblioteca de etiquetas para simplificar la lógica de presentación en JSP
  - Uso de `<c:if>`, `<c:out>`, `<c:forEach>` para manipulación de datos
- **EL (Expression Language)**: Lenguaje de expresiones para acceder a datos desde JSP
  - Sintaxis: `${variable}`, `${param.nombre}`
- **Tailwind CSS**: Framework CSS moderno para el diseño responsivo y estilización
- **Font Awesome**: Biblioteca de iconos para mejorar la experiencia visual
- **HTML5 + JavaScript**: Tecnologías web estándar para la estructura y comportamiento del cliente

#### **Controlador (Controller)**
Gestiona las peticiones HTTP y coordina Modelo y Vista:
- **`controller/`**: Contiene los Servlets que procesan las peticiones del usuario
  - **LoginServlet**: Maneja la autenticación de usuarios
  - **LogoutServlet**: Gestiona el cierre de sesión
- **Configuración de Servlets**: Mediante anotaciones `@WebServlet` para mapeo de URLs
- **Gestión de Sesiones**: Uso de `HttpSession` para mantener el estado del usuario

### Tecnologías Utilizadas

#### **Tecnologías Nativas Jakarta EE (Java EE)**
- **JSP (JavaServer Pages)**: Tecnología para crear páginas web dinámicas con Java
- **Servlets**: Componentes del lado del servidor para manejar peticiones HTTP
- **JSTL 1.2**: Biblioteca estándar de etiquetas JSP para lógica de presentación
- **EL (Expression Language)**: Lenguaje simplificado para acceder a datos en JSP
- **JDBC**: API de Java para conectividad con bases de datos relacionales

#### **Tecnologías de Terceros**
- **Apache Tomcat 9+**: Servidor de aplicaciones y contenedor de Servlets/JSP
- **MySQL 8.0+**: Sistema de gestión de bases de datos relacional
- **MySQL Connector/J 8.0.28**: Driver JDBC para conectar Java con MySQL
- **Tailwind CSS**: Framework CSS utilitario para diseño moderno y responsivo
- **Font Awesome 6.0**: Biblioteca de iconos vectoriales

#### **Patrones de Diseño Implementados**
- **MVC**: Separación de responsabilidades en Modelo, Vista y Controlador
- **Singleton**: Conexión única a base de datos (`DatabaseConnection`)
- **DAO (Data Access Object)**: Abstracción del acceso a datos
- **DTO (Data Transfer Object)**: Transferencia de datos entre capas

## 🚀 Características Funcionales

- ✅ Sistema de autenticación seguro con encriptación SHA-256
- ✅ Gestión de roles (Administrador y Usuario)
- ✅ Validación de sesiones con timeout automático
- ✅ Dashboard interactivo con información del usuario
- ✅ Interfaz responsiva y moderna
- ✅ Mensajes de retroalimentación con JSTL

## 📋 Requisitos del Sistema

- **Java**: JDK 8 o superior
- **Servidor de Aplicaciones**: Apache Tomcat 9+ o compatible con Jakarta EE
- **Base de Datos**: MySQL 8.0+
- **Driver JDBC**: MySQL Connector/J 8.0.28 (incluido en `WEB-INF/lib`)

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

## 📁 Estructura del Proyecto (MVC)

```
src/java/                          # Código fuente Java (Backend)
├── config/                        # [MODELO] Configuración del sistema
│   └── DatabaseConfig.java        # Parámetros de conexión a BD
│
├── singleton/                     # [MODELO] Patrón Singleton
│   └── DatabaseConnection.java    # Gestión única de conexión a MySQL
│
├── util/                          # [MODELO] Utilidades transversales
│   └── PasswordUtil.java          # Encriptación SHA-256 de contraseñas
│
├── model/                         # [MODELO] Entidades del dominio
│   ├── Usuario.java               # Entidad Usuario
│   └── Rol.java                   # Entidad Rol
│
├── dao/                           # [MODELO] Acceso a datos (DAO Pattern)
│   └── UsuarioDAO.java            # CRUD de usuarios con JDBC
│
└── controller/                    # [CONTROLADOR] Servlets
    ├── LoginServlet.java          # Procesa autenticación (@WebServlet)
    └── LogoutServlet.java         # Cierra sesión de usuario

web/                               # [VISTA] Recursos web (Frontend)
├── login.jsp                      # Vista de inicio de sesión (JSP + JSTL + EL)
├── dashboard.jsp                  # Vista del panel principal (JSP + JSTL + EL)
├── index.html                     # Página de inicio
├── WEB-INF/                       # Recursos protegidos
│   ├── web.xml                    # Descriptor de despliegue
│   ├── lib/                       # Librerías externas (MySQL Connector)
│   └── classes/                   # Clases compiladas
└── assets/                        # Recursos estáticos
    ├── css/                       # Estilos personalizados
    ├── js/                        # Scripts JavaScript
    └── images/                    # Imágenes del sistema

db/                                # Scripts de base de datos
├── consultas.sql                  # DDL: Creación de tablas
├── datos_iniciales.sql            # DML: Datos de prueba
└── verificar_bd.sql               # Validación de estructura
```

### Flujo de la Arquitectura MVC

1. **Cliente** → Envía petición HTTP (ej: POST a `/login`)
2. **Controlador (Servlet)** → Recibe petición, valida datos
3. **Modelo (DAO)** → Accede a la base de datos MySQL mediante JDBC
4. **Modelo (Entidades)** → Retorna objetos con los datos consultados
5. **Controlador** → Procesa lógica de negocio y prepara datos
6. **Vista (JSP)** → Renderiza interfaz usando JSTL y EL
7. **Cliente** → Recibe respuesta HTML final

## 🔐 Características de Seguridad

- **Encriptación SHA-256**: Las contraseñas se almacenan hasheadas en la base de datos
- **PreparedStatements**: Protección contra inyección SQL en todas las consultas JDBC
- **Gestión de Sesiones**: Uso de `HttpSession` con timeout de 30 minutos
- **Validación de Acceso**: Verificación de sesión activa en páginas protegidas
- **XSS Prevention**: Uso de `<c:out>` de JSTL para escapar salidas HTML

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
