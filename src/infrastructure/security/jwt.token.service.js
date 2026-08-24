const jwt = require('jsonwebtoken');

class JwtTokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = '24h';

    if (!this.secret) {
      throw new Error('JWT_SECRET debe estar configurado en las variables de entorno');
    }
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtTokenService;
