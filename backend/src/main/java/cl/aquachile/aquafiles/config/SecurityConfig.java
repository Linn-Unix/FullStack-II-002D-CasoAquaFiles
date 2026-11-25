package cl.aquachile.aquafiles.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import cl.aquachile.aquafiles.security.JwtFiltro;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFiltro jwtFiltro;
    private final String[] origenesPermitidos;

    public SecurityConfig(JwtFiltro jwtFiltro,
                          @Value("${app.cors.origenes}") String[] origenesPermitidos) {
        this.jwtFiltro = jwtFiltro;
        this.origenesPermitidos = origenesPermitidos;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. API sin sesiones ni formularios: con tokens, CSRF no aplica.
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 2. Sin token (o token malo) → 401. Con token pero rol equivocado → 403.
                .exceptionHandling(error -> error.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // 3. Reglas por ruta. Se revisan de ARRIBA hacia ABAJO: la primera que calza gana.
                .authorizeHttpRequests(reglas -> reglas
                        // 3.1- Públicas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error", "/api/v1/verificacion", "/api/v1/auth/login").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/postulaciones", "/api/v1/postulaciones/*/cv").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/candidatos/consulta").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/portal/**").permitAll()
                        // 3.2- Solo evaluador
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/candidatos/*/agendar", "/api/v1/candidatos/*/finalizar").hasRole("EVALUADOR")
                        .requestMatchers("/api/v1/evaluaciones/**").hasRole("EVALUADOR")
                        // 3.3- Los dos roles internos
                        .requestMatchers(HttpMethod.GET, "/api/v1/archivos/*/descargar").hasAnyRole("ANALISTA", "EVALUADOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/candidatos/*/archivos").hasAnyRole("ANALISTA", "EVALUADOR")
                        // 3.4- Solo analista
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/archivos/*").hasRole("ANALISTA")
                        .requestMatchers("/api/v1/candidatos/**").hasRole("ANALISTA")
                        .requestMatchers("/api/v1/dashboard/**").hasRole("ANALISTA")
                        .requestMatchers("/api/v1/ofertas/**").hasRole("ANALISTA")
                        // 3.5- Cualquier otra cosa (ej. /api/v1/auth/renovar): al menos con sesión
                        .anyRequest().authenticated())
                // 4. Nuestro filtro JWT corre antes que el filtro normal de usuario y clave.
                .addFilterBefore(jwtFiltro, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 5. CORS: permite que el frontend (otro puerto u otro dominio) llame a la API.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origenesPermitidos));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Content-Disposition"));

        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", config);
        return fuente;
    }
}