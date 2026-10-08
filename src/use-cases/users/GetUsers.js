const AppError = require('../../domain/errors/AppError');
const User = require('../../domain/entities/User');

class GetUsers {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ role, search } = {}) {
    const normalizedRole = role ? String(role).toUpperCase() : undefined;
    if (normalizedRole && !User.isValidRole(normalizedRole)) {
      throw new AppError(`El rol debe ser uno de: ${User.ROLES.join(', ')}.`, 400);
    }

    const users = await this.userRepository.findAll({
      role: normalizedRole,
      search: search ? String(search).trim() : undefined
    });
    return users.map((user) => user.toAdminResponse());
  }
}

module.exports = GetUsers;
