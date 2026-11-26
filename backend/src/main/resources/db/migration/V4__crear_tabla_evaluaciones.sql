-- Una evaluación psicolaboral por candidato.
CREATE TABLE evaluaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT NOT NULL UNIQUE,
    fecha_entrevista DATE,
    resultado VARCHAR(60),
    observaciones VARCHAR(2000),
    informe_id BIGINT,
    fecha_creacion TIMESTAMP NOT NULL,

    CONSTRAINT fk_evaluaciones_candidato
        FOREIGN KEY (candidato_id) REFERENCES candidatos (id),

    CONSTRAINT fk_evaluaciones_informe
        FOREIGN KEY (informe_id) REFERENCES archivos (id)
);

-- Los candidatos que ya estaban derivados antes de esta rama también reciben su evaluación.
INSERT INTO evaluaciones (candidato_id, fecha_creacion)
SELECT id, NOW() FROM candidatos WHERE estado IN ('DERIVADO', 'AGENDADO', 'FINALIZADO');