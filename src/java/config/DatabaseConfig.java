package config;


public class DatabaseConfig {
    // Configuración de conexión MySQL
    public static final String DB_DRIVER = "com.mysql.cj.jdbc.Driver";
    public static final String DB_URL = "jdbc:mysql://localhost:3306/biblioteca_escolar";
    public static final String DB_USER = "root";
    public static final String DB_PASSWORD = "12345678";
    
    // Configuración de pool de conexiones
    public static final int MAX_CONNECTIONS = 10;
    public static final int MIN_CONNECTIONS = 2;
    
    // Configuración de timeout
    public static final int CONNECTION_TIMEOUT = 30000; // 30 segundos
}
