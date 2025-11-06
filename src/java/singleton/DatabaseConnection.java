package singleton;

import config.DatabaseConfig;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

// Pool de conexiones básico para no crear y cerrar conexiones todo el tiempo
// Mucho más eficiente que crear una conexión nueva cada vez
public class DatabaseConnection {
    private static DatabaseConnection instance;
    private final List<Connection> connectionPool;
    private final List<Connection> usedConnections = new ArrayList<>();
    private static final int INITIAL_POOL_SIZE = 10;
    private static final int MAX_POOL_SIZE = 20;
    
    static {
        try {
            // Cargamos el driver de MySQL una sola vez al inicio
            Class.forName(DatabaseConfig.DB_DRIVER);
            System.out.println("Driver MySQL cargado correctamente");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se pudo cargar el driver MySQL", e);
        }
    }
    
    private DatabaseConnection() {
        connectionPool = new ArrayList<>(INITIAL_POOL_SIZE);
        
        
        // Creamos las conexiones iniciales del pool
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
    
    // Obtiene una conexión del pool (o crea una nueva si es necesario)
    // Si el pool está vacío pero no llegamos al max, crea nuevas
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
        
        // Checamos que la conexión esté viva antes de devolverla
        if (connection == null || connection.isClosed()) {
            connection = createConnection();
        }
        
        usedConnections.add(connection);
        return connection;
    }
    
    // IMPORTANTE: siempre hay que devolver la conexión al pool cuando termines de usarla
    // Si no, se van a acabar las conexiones disponibles
    public synchronized void releaseConnection(Connection connection) {
        if (connection != null) {
            usedConnections.remove(connection);
            connectionPool.add(connection);
        }
    }
    
    // Cierra todas las conexiones cuando apagamos la aplicación
    // NO usar esto mientras la app está corriendo
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
