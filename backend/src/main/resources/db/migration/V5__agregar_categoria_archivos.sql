-- Indica si un archivo es el CV del candidato o el informe psicolaboral.
-- Los archivos que ya existían son CV.
ALTER TABLE archivos ADD COLUMN categoria VARCHAR(20) NOT NULL DEFAULT 'CV';
