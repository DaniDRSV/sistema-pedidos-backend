const AppError = require('../../domain/errors/AppError');
const User = require('../../domain/entities/User');

class RegisterUser {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ fullName, email, phone, password } = {}) {
    if (!fullName || !email || !phone || !password) {
      throw new AppError('Todos los campos son requeridos (fullName, email, phone, password).', 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!User.isValidEmail(cleanEmail)) {
      throw new AppError('El correo electrónico no es válido.', 400);
    }
    if (!User.isStrongPassword(password)) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.', 400);
    }

    const existingUser = await this.userRepository.findByEmail(cleanEmail);
    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado.', 409);
    }

    const passwordHash = await this.passwordHasher.hash(String(password));

    const newUser = await this.userRepository.create({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      passwordHash,
      roleName: 'CLIENT'
    });

    return newUser.toResponse();
  }
}

module.exports = RegisterUser;
