class LoginUser {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await this.userRepository.findByEmail(cleanEmail);
    
    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas o cuenta desactivada');
    }

    const isPasswordValid = await this.passwordHasher.compare(cleanPassword, user.passwordHash);

    const payload = {
      id: user.id,
      role: user.roleName,
      email: user.email,
      fullName: user.fullName
    };

    const token = this.tokenService.generateToken(payload);

    return {
      user: user.toResponse(),
      token
    };
  }
}

module.exports = LoginUser;