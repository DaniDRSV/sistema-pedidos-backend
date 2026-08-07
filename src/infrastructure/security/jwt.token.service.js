const jwt = require('jsonwebtoken');

class JwtTokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'ContrasenaOneTwoThree';
    this.expiresIn = '24h';
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtTokenService;