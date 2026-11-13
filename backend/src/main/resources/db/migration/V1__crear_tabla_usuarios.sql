-- Usuarios internos de AquaChile (analista y evaluador).
-- La clave se guarda cifrada con BCrypt, nunca en texto plano.
CREATE TABLE usuarios (
                          id      BIGINT AUTO_INCREMENT PRIMARY KEY,
                          usuario VARCHAR(50)  NOT NULL UNIQUE,
                          nombre  VARCHAR(120) NOT NULL,
                          clave   VARCHAR(100) NOT NULL,
                          rol     VARCHAR(20)  NOT NULL,
                          activo  BOOLEAN      NOT NULL DEFAULT TRUE
);