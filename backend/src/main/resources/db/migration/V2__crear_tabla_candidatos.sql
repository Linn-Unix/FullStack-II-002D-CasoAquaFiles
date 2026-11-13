CREATE TABLE candidatos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    rut VARCHAR(12) NOT NULL UNIQUE,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    cargo VARCHAR(120) NOT NULL,
    familia VARCHAR(60) NOT NULL,
    ubicacion VARCHAR(60) NOT NULL,
    centro_costo VARCHAR(80) NOT NULL,
    responsable VARCHAR(120),
    observaciones VARCHAR(2000),
    estado VARCHAR(20) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_derivacion DATE,
    fecha_finalizacion DATE
);

CREATE INDEX idx_candidatos_estado ON candidatos (estado);
