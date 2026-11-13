package cl.aquachile.aquafiles.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

// 1. @Info: título y versión que se ven arriba en la página de Swagger.
// 2. @SecurityScheme: agrega el botón "Authorize" para pegar el token JWT.
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "AquaFiles API", version = "v1",
                description = "API del proceso de reclutamiento y evaluación psicolaboral de AquaChile"),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {
}