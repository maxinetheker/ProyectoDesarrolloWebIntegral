package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@WebServlet(name = "UploadImageServlet", urlPatterns = {"/uploadImage"})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2,  // 2MB
    maxFileSize = 1024 * 1024 * 10,       // 10MB
    maxRequestSize = 1024 * 1024 * 50     // 50MB
)
public class UploadImageServlet extends HttpServlet {
    
    private static final String UPLOAD_DIR = "assets/images/portadas";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        objectMapper = new ObjectMapper();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            Part filePart = request.getPart("file");
            
            if (filePart == null) {
                respuesta.put("success", false);
                respuesta.put("message", "No se ha seleccionado ningún archivo");
                enviarRespuesta(response, respuesta);
                return;
            }
            
            String fileName = getFileName(filePart);
            String contentType = filePart.getContentType();
            
            // Validar que sea una imagen
            if (!contentType.startsWith("image/")) {
                respuesta.put("success", false);
                respuesta.put("message", "El archivo debe ser una imagen");
                enviarRespuesta(response, respuesta);
                return;
            }
            
            // Validar tamaño
            if (filePart.getSize() > MAX_FILE_SIZE) {
                respuesta.put("success", false);
                respuesta.put("message", "El archivo excede el tamaño máximo permitido (10MB)");
                enviarRespuesta(response, respuesta);
                return;
            }
            
            // Obtener la ruta real del directorio de portadas
            String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIR;
            File uploadDir = new File(uploadPath);
            
            // Crear el directorio si no existe
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Generar nombre único para el archivo
            String fileExtension = getFileExtension(fileName);
            String uniqueFileName = generateUniqueFileName() + fileExtension;
            
            // Guardar el archivo
            Path filePath = Paths.get(uploadPath, uniqueFileName);
            try (InputStream input = filePart.getInputStream()) {
                Files.copy(input, filePath, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Retornar la URL relativa
            String fileUrl = UPLOAD_DIR + "/" + uniqueFileName;
            
            respuesta.put("success", true);
            respuesta.put("message", "Imagen subida correctamente");
            respuesta.put("url", fileUrl);
            
        } catch (Exception e) {
            e.printStackTrace();
            respuesta.put("success", false);
            respuesta.put("message", "Error al subir la imagen: " + e.getMessage());
        }
        
        enviarRespuesta(response, respuesta);
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        ObjectNode respuesta = objectMapper.createObjectNode();
        
        try {
            String fileUrl = request.getParameter("url");
            
            if (fileUrl == null || fileUrl.isEmpty()) {
                respuesta.put("success", false);
                respuesta.put("message", "URL de archivo no proporcionada");
                enviarRespuesta(response, respuesta);
                return;
            }
            
            // No eliminar la imagen por defecto
            if (fileUrl.endsWith("portada.jpg")) {
                respuesta.put("success", true);
                respuesta.put("message", "No se puede eliminar la imagen por defecto");
                enviarRespuesta(response, respuesta);
                return;
            }
            
            String realPath = getServletContext().getRealPath("") + File.separator + fileUrl;
            File file = new File(realPath);
            
            if (file.exists() && file.isFile()) {
                if (file.delete()) {
                    respuesta.put("success", true);
                    respuesta.put("message", "Imagen eliminada correctamente");
                } else {
                    respuesta.put("success", false);
                    respuesta.put("message", "No se pudo eliminar la imagen");
                }
            } else {
                respuesta.put("success", true);
                respuesta.put("message", "El archivo no existe");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            respuesta.put("success", false);
            respuesta.put("message", "Error al eliminar la imagen: " + e.getMessage());
        }
        
        enviarRespuesta(response, respuesta);
    }
    
    private String getFileName(Part part) {
        String contentDisposition = part.getHeader("content-disposition");
        String[] tokens = contentDisposition.split(";");
        for (String token : tokens) {
            if (token.trim().startsWith("filename")) {
                return token.substring(token.indexOf("=") + 2, token.length() - 1);
            }
        }
        return "";
    }
    
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0 && lastDot < fileName.length() - 1) {
            return fileName.substring(lastDot);
        }
        return "";
    }
    
    private String generateUniqueFileName() {
        return "portada_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private void enviarRespuesta(HttpServletResponse response, ObjectNode objeto)
            throws IOException {
        response.getWriter().write(objectMapper.writeValueAsString(objeto));
    }
}
