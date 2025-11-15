package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet(name = "LanguageServlet", urlPatterns = {"/language"})
public class LanguageServlet extends HttpServlet {
    
    private static final String[] SUPPORTED_LANGUAGES = {"es", "en", "fr", "zh"};
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String lang = request.getParameter("lang");
        String redirect = request.getParameter("redirect");
        
        // Validar que el idioma sea soportado
        if (lang != null && isLanguageSupported(lang)) {
            HttpSession session = request.getSession();
            session.setAttribute("lang", lang);
        }
        
        // Redirigir a la página anterior o al index
        if (redirect != null && !redirect.isEmpty()) {
            response.sendRedirect(redirect);
        } else {
            String referer = request.getHeader("Referer");
            if (referer != null && !referer.isEmpty()) {
                response.sendRedirect(referer);
            } else {
                response.sendRedirect(request.getContextPath() + "/index.jsp");
            }
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
    
    private boolean isLanguageSupported(String lang) {
        for (String supported : SUPPORTED_LANGUAGES) {
            if (supported.equals(lang)) {
                return true;
            }
        }
        return false;
    }
}
