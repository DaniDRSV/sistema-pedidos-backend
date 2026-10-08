const { sendSuccess } = require('./response');

class AuthController {
  constructor({ loginUser, registerUser }) {
    this.loginUser = loginUser;
    this.registerUser = registerUser;
  }

  async login(req, res) {
    const result = await this.loginUser.execute(req.body);
    sendSuccess(res, result, { message: 'Login exitoso' });
  }

  async register(req, res) {
    const user = await this.registerUser.execute(req.body);
    sendSuccess(res, user, { status: 201, message: 'Usuario registrado exitosamente' });
  }

  async me(req, res) {
    sendSuccess(res, req.user);
  }
}

module.exports = AuthController;
