const JwtTokenService = require('../../security/jwt.token.service');

const tokenService = new JwtTokenService();

/**
 * Verifica el JWT enviado en: Authorization: Bearer <token>
 *
 * Si el token es válido, deja la información de la sesión disponible
 * en req.user para el controlador o middleware siguiente.
 */
const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido'
    });
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>'
    });
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
      ? 'La sesión ha expirado. Inicie sesión nuevamente'
      : 'Token de autenticación inválido';

    return res.status(401).json({
      success: false,
      message
    });
  }
};

/**
 * Restringe una ruta autenticada a uno o más roles.
 * Debe usarse después de authenticate.
 */
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido'
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'No tiene permisos para realizar esta acción'
    });
  }

  return next();
};

module.exports = { authenticate, authorizeRoles };
