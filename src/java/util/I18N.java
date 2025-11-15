package util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.ServletContext;

public class I18N {
    
    private static final String LANG_DIR = "/lang/";
    private static final String DEFAULT_LANG = "es";
    
    private Map<String, String> translations;
    private String language;
    
    public I18N(ServletContext context, String lang) {
        this.language = (lang != null && !lang.isEmpty()) ? lang : DEFAULT_LANG;
        this.translations = new HashMap<>();
        loadTranslations(context);
    }
    
    private void loadTranslations(ServletContext context) {
        String langFile = LANG_DIR + language;
        
        try (InputStream is = context.getResourceAsStream(langFile)) {
            if (is == null) {
                // Si no existe el idioma, cargar el predeterminado
                langFile = LANG_DIR + DEFAULT_LANG;
                try (InputStream defaultIs = context.getResourceAsStream(langFile)) {
                    if (defaultIs != null) {
                        loadFromStream(defaultIs);
                    }
                }
                return;
            }
            loadFromStream(is);
        } catch (IOException e) {
            System.err.println("Error cargando archivo de idioma: " + langFile);
            e.printStackTrace();
        }
    }
    
    private void loadFromStream(InputStream is) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        String line;
        
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            
            // Ignorar líneas vacías y comentarios
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            
            // Buscar el separador =
            int separatorIndex = line.indexOf('=');
            if (separatorIndex > 0) {
                String key = line.substring(0, separatorIndex).trim();
                String value = line.substring(separatorIndex + 1).trim();
                translations.put(key, value);
            }
        }
    }
    
    public String get(String key) {
        return translations.getOrDefault(key, key);
    }
    
    public String get(String key, Object... args) {
        String value = translations.getOrDefault(key, key);
        
        // Reemplazar {0}, {1}, etc. con los argumentos
        for (int i = 0; i < args.length; i++) {
            value = value.replace("{" + i + "}", String.valueOf(args[i]));
        }
        
        return value;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public static String[] getSupportedLanguages() {
        return new String[]{"es", "en", "fr", "zh"};
    }
    
    public static String getLanguageName(String code) {
        switch (code) {
            case "es": return "Español";
            case "en": return "English";
            case "fr": return "Français";
            case "zh": return "中文";
            default: return code;
        }
    }
}
