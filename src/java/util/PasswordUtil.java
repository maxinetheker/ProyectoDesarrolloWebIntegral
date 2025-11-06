package util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

// Funciones para hashear contraseñas (usamos SHA-256)
// NOTA: el método generateSalt existe pero no se está usando actualmente
public class PasswordUtil {
    
    // Genera un salt aleatorio (útil para futuras mejoras de seguridad)
    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
    
    // Convierte la contraseña a SHA-256 hash
    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al encriptar contraseña", e);
        }
    }
    
    // Compara una contraseña en texto plano con su hash
    public static boolean verifyPassword(String password, String hashedPassword) {
        String hashAttempt = hashPassword(password);
        return hashAttempt.equals(hashedPassword);
    }
}
