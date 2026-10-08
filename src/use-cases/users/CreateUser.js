const AppError = require('../../domain/errors/AppError');
const User = require('../../domain/entities/User');
const { cleanText, validateUserData, normalizeDeliveryProfile } = require('./userRules');

class CreateUser {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ fullName, email, phone, password, role = 'CLIENT', deliveryProfile } = {}) {
    const normalizedRole = String(role).toUpperCase();
    validateUserData({ fullName, email, phone, role: normalizedRole });

    if (!User.isStrongPassword(password)) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.', 400);
    }

    const cleanEmail = cleanText(email).toLowerCase();
    if (await this.userRepository.findByEmail(cleanEmail)) {
      throw new AppError('El correo electrónico ya está registrado.', 409);
    }

    const user = await this.userRepository.create({
      fullName: cleanText(fullName),
      email: cleanEmail,
      phone: cleanText(phone),
      passwordHash: await this.passwordHasher.hash(String(password)),
      roleName: normalizedRole,
      deliveryProfile: normalizedRole === 'DELIVERY' ? normalizeDeliveryProfile(deliveryProfile) : null
    });

    return user.toAdminResponse();
  }
}

module.exports = CreateUser;
