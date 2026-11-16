package cl.aquachile.aquafiles.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Se ejecuta UNA vez en cada petición, antes de llegar al controlador.
@Component
public class JwtFiltro extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFiltro(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain cadena) throws ServletException, IOException {
        // 1. Buscamos la cabecera "Authorization: Bearer <token>".
        String cabecera = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (cabecera != null && cabecera.startsWith("Bearer ")) {
            String token = cabecera.substring(7);
            try {
                // 2. Si el token es válido, le decimos a Spring quién es y qué rol tiene.
                //    Spring espera los roles con el prefijo "ROLE_".
                Claims datos = jwtService.leerToken(token);
                String rol = datos.get("rol", String.class);
                var permisos = List.of(new SimpleGrantedAuthority("ROLE_" + rol));
                var autenticacion = new UsernamePasswordAuthenticationToken(datos.getSubject(), null, permisos);
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            } catch (JwtException | IllegalArgumentException error) {
                // 3. Token falso o vencido: seguimos SIN usuario. Si la ruta es privada, responde 401.
                SecurityContextHolder.clearContext();
            }
        }

        cadena.doFilter(request, response);
    }
}