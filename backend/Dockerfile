# Imagen del backend para Render (o cualquier servicio que use Docker).
# Etapa 1: compila el proyecto con Maven y Java 21.
FROM maven:3.9-eclipse-temurin-21 AS compilacion
WORKDIR /app
# Primero solo el pom.xml: así Docker reutiliza las dependencias descargadas si el código cambia.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
# Las pruebas se corren antes de subir (npm/mvn en el PC o en CI); aquí solo se empaqueta.
RUN mvn -q -B -DskipTests package

# Etapa 2: imagen liviana solo con Java para ejecutar el .jar.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=compilacion /app/target/aquafiles-backend-*.jar app.jar
# Carpeta de CV e informes (en Render gratis NO es persistente: se borra al redesplegar).
RUN mkdir -p /app/uploads
ENV ARCHIVOS_DIRECTORIO=/app/uploads
# Render entrega el puerto en la variable PORT; application.yml ya la lee (por defecto 8080).
EXPOSE 8080
# MaxRAMPercentage: usa como máximo el 75 % de la memoria del plan (512 MB en Render gratis).
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
