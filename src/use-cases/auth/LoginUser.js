const AppError = require('../../domain/errors/AppError');

class LoginUser {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password } = {}) {
    if (!email || !password) {
      throw new AppError('Correo y contraseña requeridos.', 400);
    }

    const user = await this.userRepository.findByEmail(String(email).trim().toLowerCase());
    const isValid = user && user.isActive
      && await this.passwordHasher.compare(String(password), user.passwordHash);

    if (!isValid) {
      throw new AppError('Usuario y/o contraseña incorrectos.', 401);
    }

    const token = this.tokenService.generateToken({
      id: user.id,
      role: user.roleName,
      email: user.email,
      fullName: user.fullName
    });

    return { user: user.toResponse(), token };
  }
}

module.exports = LoginUser;
