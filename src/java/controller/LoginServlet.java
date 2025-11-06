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

// Maneja el login de usuarios al sistema
@WebServlet(name = "LoginServlet", urlPatterns = {"/login"})
public class LoginServlet extends HttpServlet {
    
    private static final int MAX_INTENTOS = 3;
    private UsuarioDAO usuarioDAO;
    
    @Override
    public void init() throws ServletException {
        usuarioDAO = new UsuarioDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Redirigir a la página de login
        request.getRequestDispatcher("pages/login.jsp").forward(request, response);
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String usuario = request.getParameter("usuario");
        String contrasena = request.getParameter("contrasena");
        
        // Validar que los campos no estén vacíos
        if (usuario == null || usuario.trim().isEmpty() || 
            contrasena == null || contrasena.trim().isEmpty()) {
            request.setAttribute("error", "Por favor complete todos los campos");
            request.getRequestDispatcher("pages/login.jsp").forward(request, response);
            return;
        }
        
        Usuario usuarioEncontrado = usuarioDAO.buscarPorUsuario(usuario);
        
        // Verificar si el usuario existe
        if (usuarioEncontrado == null) {
            request.setAttribute("error", "Usuario o contraseña incorrectos");
            request.getRequestDispatcher("pages/login.jsp").forward(request, response);
            return;
        }
        
    
        if (!usuarioEncontrado.isActivo()) {
            request.setAttribute("error", "Usuario bloqueado. Contacte al administrador.");
            request.getRequestDispatcher("pages/login.jsp").forward(request, response);
            return;
        }
        
        // Encriptar la contraseña ingresada
        String contrasenaEncriptada = PasswordUtil.hashPassword(contrasena);
        
        // Validar credenciales
        Usuario usuarioValido = usuarioDAO.validarUsuario(usuario, contrasenaEncriptada);
        
        if (usuarioValido != null) {
            session.removeAttribute("intentosLogin");
            session.removeAttribute("usuarioIntento");
            
            session.setAttribute("usuario", usuarioValido);
            session.setAttribute("usuarioId", usuarioValido.getId());
            session.setAttribute("usuarioNombre", usuarioValido.getNombreCompleto());
            session.setAttribute("usuarioRol", usuarioValido.getNombreRol());
            session.setMaxInactiveInterval(30 * 60); 
            
            // Redirigir al dashboard
            response.sendRedirect(request.getContextPath() + "/pages/dashboard.jsp");
        } else {
            
            // Obtener o inicializar contador de intentos para este usuario
            String usuarioIntento = (String) session.getAttribute("usuarioIntento");
            Integer intentos = (Integer) session.getAttribute("intentosLogin");
            
            // Si es un usuario diferent reiniciar contador
            if (usuarioIntento == null || !usuarioIntento.equals(usuario)) {
                intentos = 0;
                session.setAttribute("usuarioIntento", usuario);
            }
            
            if (intentos == null) {
                intentos = 0;
            }
            
            intentos++;
            session.setAttribute("intentosLogin", intentos);
            
            // Verificar si alcanzó el máximo de intentos
            if (intentos >= MAX_INTENTOS) {
               
                boolean bloqueado = usuarioDAO.desactivar(usuario);
                
                if (bloqueado) {
                    
                    session.removeAttribute("intentosLogin");
                    session.removeAttribute("usuarioIntento");
                    
                    request.setAttribute("error", "Ha alcanzado el máximo de intentos (" + MAX_INTENTOS + "). Su cuenta ha sido bloqueada. Contacte al administrador.");
                } else {
                    request.setAttribute("error", "Error al bloquear usuario. Intente nuevamente.");
                }
            } else {
                // Aún tiene intentos disponibles
                int intentosRestantes = MAX_INTENTOS - intentos;
                request.setAttribute("error", "Usuario o contraseña incorrectos. Le quedan " + intentosRestantes + " intento(s).");
            }
            
            request.getRequestDispatcher("pages/login.jsp").forward(request, response);
        }
    }
}
