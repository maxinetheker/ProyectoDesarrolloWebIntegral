package controller;

import dao.UsuarioDAO;
import model.Usuario;
import util.PasswordUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Servlet para gestionar el inicio de sesión
 */
@WebServlet(name = "LoginServlet", urlPatterns = {"/login"})
public class LoginServlet extends HttpServlet {
    
    private UsuarioDAO usuarioDAO;
    
    @Override
    public void init() throws ServletException {
        usuarioDAO = new UsuarioDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Redirigir a la página de login
        request.getRequestDispatcher("login.jsp").forward(request, response);
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String usuario = request.getParameter("usuario");
        String contrasena = request.getParameter("contrasena");
        
        // Validar que los campos no estén vacíos
        if (usuario == null || usuario.trim().isEmpty() || 
            contrasena == null || contrasena.trim().isEmpty()) {
            request.setAttribute("error", "Por favor complete todos los campos");
            request.getRequestDispatcher("login.jsp").forward(request, response);
            return;
        }
        
        // Encriptar la contraseña
        String contrasenaEncriptada = PasswordUtil.hashPassword(contrasena);
        
        // Validar usuario
        Usuario usuarioModel = usuarioDAO.validarUsuario(usuario, contrasenaEncriptada);
        
        if (usuarioModel != null) {
            // Usuario válido, crear sesión
            HttpSession session = request.getSession();
            session.setAttribute("usuario", usuarioModel);
            session.setAttribute("usuarioId", usuarioModel.getId());
            session.setAttribute("usuarioNombre", usuarioModel.getNombreCompleto());
            session.setAttribute("usuarioRol", usuarioModel.getNombreRol());
            session.setMaxInactiveInterval(30 * 60); // 30 minutos
            
            // Redirigir al dashboard
            response.sendRedirect("dashboard.jsp");
        } else {
            // Credenciales inválidas
            request.setAttribute("error", "Usuario o contraseña incorrectos");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }
}
