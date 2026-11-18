CREATE TABLE archivos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(120) NOT NULL UNIQUE,
    tipo_contenido VARCHAR(120) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    tamano BIGINT NOT NULL,
    fecha_carga DATETIME NOT NULL,
    CONSTRAINT fk_archivos_candidato
        FOREIGN KEY (candidato_id) REFERENCES candidatos (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_archivos_candidato ON archivos (candidato_id);
