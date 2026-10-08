const AppError = require('../../domain/errors/AppError');
const User = require('../../domain/entities/User');

class ResetUserPassword {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute(id, password) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    if (!User.isStrongPassword(password)) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.', 400);
    }

    await this.userRepository.updatePassword(user.id, await this.passwordHasher.hash(String(password)));
    return { id: user.id };
  }
}

module.exports = ResetUserPassword;
