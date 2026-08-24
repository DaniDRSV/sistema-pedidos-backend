class RegisterUser {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ fullName, email, phone, password }) {
    // 1. Validar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    // 2. Hashear la contraseña con BCrypt (RNF-01)
    const passwordHash = await this.passwordHasher.hash(password);

    // 3. Crear usuario con rol CLIENTE por defecto
    const newUser = await this.userRepository.create({
      fullName,
      email,
      phone,
      passwordHash,
      roleName: 'CLIENT'
    });

    // 4. Retornar DTO limpio sin datos sensibles
    return newUser.toResponse();
  }
}

module.exports = RegisterUser;