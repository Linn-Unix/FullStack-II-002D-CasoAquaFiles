-- Ofertas laborales que publica el analista en el portal público.
CREATE TABLE ofertas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cargo VARCHAR(120) NOT NULL,
    familia VARCHAR(60) NOT NULL,
    ubicacion VARCHAR(60) NOT NULL,
    modalidad VARCHAR(20) NOT NULL,
    cupos INT NOT NULL,
    descripcion VARCHAR(2000) NOT NULL,
    funciones VARCHAR(2000) NOT NULL,
    requisitos VARCHAR(2000) NOT NULL,
    beneficios VARCHAR(2000) NOT NULL,
    sueldo_minimo INT NOT NULL,
    sueldo_maximo INT NOT NULL,
    publicada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_publicacion DATE,
    fecha_creacion DATETIME NOT NULL
);

CREATE INDEX idx_ofertas_publicada ON ofertas (publicada);

-- Cada postulación queda ligada a la oferta a la que postuló (puede ser nula en las antiguas).
ALTER TABLE candidatos ADD COLUMN oferta_id BIGINT;
ALTER TABLE candidatos
    ADD CONSTRAINT fk_candidatos_oferta FOREIGN KEY (oferta_id) REFERENCES ofertas (id);
