const ERROR_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_ERROR'
};

const DATABASE_ERRORS = {
  '23505': [409, 'Ya existe un registro con esos datos.'],
  '23503': [409, 'La operación afecta registros relacionados.'],
  '23514': [400, 'Los datos no cumplen las reglas de la base de datos.'],
  '22P02': [400, 'Formato de dato inválido.']
};

const sendError = (res, status, message, details) => {
  const error = { code: ERROR_CODES[status] || 'ERROR' };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, message, error });
};

const errorHandler = (err, req, res, next) => {
  if (err.statusCode && err.statusCode < 500) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'El cuerpo de la petición no es un JSON válido.');
  }

  if (DATABASE_ERRORS[err.code]) {
    const [status, message] = DATABASE_ERRORS[err.code];
    return sendError(res, status, message);
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return sendError(res, 500, 'Servicio no disponible temporalmente. Intente más tarde.');
};

const notFoundHandler = (req, res) =>
  sendError(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);

module.exports = { errorHandler, notFoundHandler };
