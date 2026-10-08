const AppError = require('../../../domain/errors/AppError');

const createAuthMiddleware = (tokenService) => {
  const authenticate = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new AppError('Token de autenticación requerido.', 401));
    }

    try {
      const payload = tokenService.verifyToken(token);
      req.user = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
        fullName: payload.fullName
      };
      return next();
    } catch (error) {
      const message = error.name === 'TokenExpiredError'
        ? 'La sesión ha expirado. Inicie sesión nuevamente.'
        : 'Token de autenticación inválido.';
      return next(new AppError(message, 401));
    }
  };

  const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user) return next(new AppError('Token de autenticación requerido.', 401));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tiene permisos para realizar esta acción.', 403));
    }
    return next();
  };

  return { authenticate, authorizeRoles };
};

module.exports = createAuthMiddleware;
