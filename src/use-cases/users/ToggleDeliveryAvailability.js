const AppError = require('../../domain/errors/AppError');

class ToggleDeliveryAvailability {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    if (!user.isDelivery()) throw new AppError('El usuario no es repartidor.', 400);

    const isAvailable = user.deliveryProfile ? user.deliveryProfile.isAvailable : true;
    const updated = await this.userRepository.setAvailability(user.id, !isAvailable);
    return updated.toAdminResponse();
  }
}

module.exports = ToggleDeliveryAvailability;
