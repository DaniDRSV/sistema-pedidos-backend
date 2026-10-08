const AppError = require('../../domain/errors/AppError');

class GetUserById {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    return user.toAdminResponse();
  }
}

module.exports = GetUserById;
