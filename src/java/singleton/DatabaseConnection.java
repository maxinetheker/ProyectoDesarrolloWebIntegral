package singleton;

import config.DatabaseConfig;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton para gestionar la conexión a la base de datos
 */
public class DatabaseConnection {
    private static DatabaseConnection instance;
    private Connection connection;
    
    private DatabaseConnection() throws SQLException {
        try {
            // Cargar el driver de MySQL
            Class.forName(DatabaseConfig.DB_DRIVER);
            
            System.out.println("=== Intentando conectar a la base de datos ===");
            System.out.println("URL: " + DatabaseConfig.DB_URL);
            System.out.println("Usuario: " + DatabaseConfig.DB_USER);
            
            // Establecer la conexión
            this.connection = DriverManager.getConnection(
                DatabaseConfig.DB_URL,
                DatabaseConfig.DB_USER,
                DatabaseConfig.DB_PASSWORD
            );
            
            if (this.connection != null && !this.connection.isClosed()) {
                System.out.println("✓ Conexión a la base de datos establecida correctamente");
            } else {
                throw new SQLException("La conexión es null o está cerrada");
            }
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ ERROR: Driver MySQL no encontrado");
            System.err.println("  Asegúrate de que mysql-connector-java.jar está en WEB-INF/lib");
            System.err.println("  Detalle: " + e.getMessage());
            throw new SQLException("Driver MySQL no encontrado: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ ERROR: No se pudo conectar a la base de datos");
            System.err.println("  URL: " + DatabaseConfig.DB_URL);
            System.err.println("  Usuario: " + DatabaseConfig.DB_USER);
            System.err.println("  Verifica que:");
            System.err.println("    1. MySQL esté corriendo");
            System.err.println("    2. La base de datos 'biblioteca_escolar' exista");
            System.err.println("    3. El usuario y contraseña sean correctos");
            System.err.println("  Detalle: " + e.getMessage());
            throw e;
        }
    }
    
    public static synchronized DatabaseConnection getInstance() {
        try {
            if (instance == null) {
                instance = new DatabaseConnection();
            } else {
                // Verificar si la conexión está cerrada y reconectar si es necesario
                if (instance.getConnection() == null || instance.getConnection().isClosed()) {
                    System.out.println("Reconectando a la base de datos...");
                    instance = new DatabaseConnection();
                }
            }
        } catch (SQLException e) {
            System.err.println("✗ FATAL: No se pudo obtener la instancia de conexión");
            System.err.println("  La aplicación no podrá funcionar sin conexión a BD");
            return null;
        }
        return instance;
    }
    
    public Connection getConnection() {
        return connection;
    }
    
    public void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Conexión cerrada correctamente");
            }
        } catch (SQLException e) {
            System.err.println("Error al cerrar la conexión: " + e.getMessage());
        }
    }
}
