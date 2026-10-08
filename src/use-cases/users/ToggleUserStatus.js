const AppError = require('../../domain/errors/AppError');
const { ensureNotLastAdmin, ensureNoActiveDeliveries } = require('./userRules');

class ToggleUserStatus {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id, requester) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    if (user.isActive) {
      if (Number(requester.id) === Number(user.id)) {
        throw new AppError('No puedes desactivar tu propia cuenta.', 400);
      }
      await ensureNotLastAdmin(this.userRepository, user);
      ensureNoActiveDeliveries(user);
    }

    const updated = await this.userRepository.setActive(user.id, !user.isActive);
    return updated.toAdminResponse();
  }
}

module.exports = ToggleUserStatus;
