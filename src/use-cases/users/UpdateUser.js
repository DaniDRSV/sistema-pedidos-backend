const AppError = require('../../domain/errors/AppError');
const {
  cleanText,
  validateUserData,
  normalizeDeliveryProfile,
  ensureNotLastAdmin,
  ensureNoActiveDeliveries
} = require('./userRules');

class UpdateUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id, changes = {}, requester) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    const data = {
      fullName: changes.fullName ?? user.fullName,
      email: changes.email ?? user.email,
      phone: changes.phone ?? user.phone,
      role: String(changes.role ?? user.roleName).toUpperCase()
    };
    validateUserData(data);

    const cleanEmail = cleanText(data.email).toLowerCase();
    if (cleanEmail !== user.email.toLowerCase()) {
      const existing = await this.userRepository.findByEmail(cleanEmail);
      if (existing) throw new AppError('El correo electrónico ya está registrado.', 409);
    }

    if (data.role !== user.roleName) {
      if (Number(requester.id) === Number(user.id)) {
        throw new AppError('No puedes cambiar tu propio rol.', 400);
      }
      await ensureNotLastAdmin(this.userRepository, user);
      ensureNoActiveDeliveries(user);
    }

    const updated = await this.userRepository.update(user.id, {
      fullName: cleanText(data.fullName),
      email: cleanEmail,
      phone: cleanText(data.phone),
      roleName: data.role,
      deliveryProfile: data.role === 'DELIVERY'
        ? normalizeDeliveryProfile({ ...user.deliveryProfile, ...changes.deliveryProfile })
        : null
    });

    return updated.toAdminResponse();
  }
}

module.exports = UpdateUser;
