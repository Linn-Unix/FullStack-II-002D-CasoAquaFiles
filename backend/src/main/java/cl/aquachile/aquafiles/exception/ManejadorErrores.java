package cl.aquachile.aquafiles.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// @RestControllerAdvice atrapa las excepciones de TODOS los controladores.
// Cada @ExceptionHandler dice "si pasa este error, responde así".
@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<RespuestaError> noEncontrado(RecursoNoEncontradoException error) {
        return responder(HttpStatus.NOT_FOUND, error.getMessage());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<RespuestaError> reglaNegocio(ReglaNegocioException error) {
        return responder(HttpStatus.CONFLICT, error.getMessage());
    }

    @ExceptionHandler(DatoInvalidoException.class)
    public ResponseEntity<RespuestaError> datoInvalido(DatoInvalidoException error) {
        return responder(HttpStatus.BAD_REQUEST, error.getMessage());
    }

    //Errores de @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaError> validacion(MethodArgumentNotValidException error) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError campo : error.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(campo.getField(), campo.getDefaultMessage());
        }
        RespuestaError cuerpo = new RespuestaError(
                LocalDateTime.now(), 400, "Hay datos inválidos en el formulario.", campos);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    // 2. JSON mal escrito o un valor que no existe (ej. un estado inventado).
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RespuestaError> jsonInvalido(HttpMessageNotReadableException error) {
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es válido.");
    }

    private ResponseEntity<RespuestaError> responder(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).body(RespuestaError.de(estado, mensaje));
    }
}