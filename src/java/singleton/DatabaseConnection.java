package singleton;

import config.DatabaseConfig;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Pool de conexiones simple para gestionar múltiples conexiones simultáneas
 */
public class DatabaseConnection {
    private static DatabaseConnection instance;
    private final List<Connection> connectionPool;
    private final List<Connection> usedConnections = new ArrayList<>();
    private static final int INITIAL_POOL_SIZE = 10;
    private static final int MAX_POOL_SIZE = 20;
    
    static {
        try {
            // Cargar el driver de MySQL una sola vez
            Class.forName(DatabaseConfig.DB_DRIVER);
            System.out.println("Driver MySQL cargado correctamente");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se pudo cargar el driver MySQL", e);
        }
    }
    
    private DatabaseConnection() {
        connectionPool = new ArrayList<>(INITIAL_POOL_SIZE);
        
        
        // Crear conexiones iniciales
        for (int i = 0; i < INITIAL_POOL_SIZE; i++) {
            try {
                connectionPool.add(createConnection());
            } catch (SQLException e) {
                System.err.println("Error al crear conexion " + (i + 1) + ": " + e.getMessage());
            }
        }
        
        System.out.println("Pool de conexiones creado: " + connectionPool.size() + " conexiones disponibles");
    }
    
    private Connection createConnection() throws SQLException {
        Connection conn = DriverManager.getConnection(
            DatabaseConfig.DB_URL,
            DatabaseConfig.DB_USER,
            DatabaseConfig.DB_PASSWORD
        );
        return conn;
    }
    
    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
    
    /**
     * Obtiene una conexión del pool
     * Si no hay conexiones disponibles, crea una nueva 
     */
    public synchronized Connection getConnection() throws SQLException {
        // Si el pool está vacío pero no hemos alcanzado el máximo, crear nueva conexión
        if (connectionPool.isEmpty()) {
            if (usedConnections.size() < MAX_POOL_SIZE) {
                Connection conn = createConnection();
                usedConnections.add(conn);
                System.out.println("Nueva conexion creada. Total en uso: " + usedConnections.size());
                return conn;
            } else {
                // Esperar un momento y volver a intentar
                throw new SQLException("No hay conexiones disponibles en el pool. Maximo alcanzado: " + MAX_POOL_SIZE);
            }
        }
        
        Connection connection = connectionPool.remove(connectionPool.size() - 1);
        
        // Verificar que la conexión esté válida
        if (connection == null || connection.isClosed()) {
            connection = createConnection();
        }
        
        usedConnections.add(connection);
        return connection;
    }
    
    /**
     * Devuelve una conexión al pool para reutilización
     */
    public synchronized void releaseConnection(Connection connection) {
        if (connection != null) {
            usedConnections.remove(connection);
            connectionPool.add(connection);
        }
    }
    
    /**
     * Cierra todas las conexiones del pool
     * Usar solo al apagar la aplicación
     */
    public synchronized void shutdown() {
        System.out.println("Cerrando pool de conexiones...");
        
        // Cerrar conexiones en uso
        for (Connection conn : usedConnections) {
            try {
                if (conn != null && !conn.isClosed()) {
                    conn.close();
                }
            } catch (SQLException e) {
                System.err.println("Error al cerrar conexion en uso: " + e.getMessage());
            }
        }
        
        // Cerrar conexiones disponibles
        for (Connection conn : connectionPool) {
            try {
                if (conn != null && !conn.isClosed()) {
                    conn.close();
                }
            } catch (SQLException e) {
                System.err.println("Error al cerrar conexion del pool: " + e.getMessage());
            }
        }
        
        usedConnections.clear();
        connectionPool.clear();
        System.out.println("Pool de conexiones cerrado");
    }
    
    public int getPoolSize() {
        return connectionPool.size();
    }
    
    public int getUsedConnectionsCount() {
        return usedConnections.size();
    }
}
