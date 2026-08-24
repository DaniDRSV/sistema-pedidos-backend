class IUserRepository {
  async findByEmail(email) { throw new Error('Method not implemented'); }
  async getRoleIdByName(roleName) { throw new Error('Method not implemented'); }
  async create(userData) { throw new Error('Method not implemented'); }
  async findDefaultClientRoleId() { throw new Error('Method not implemented'); }
}

module.exports = IUserRepository;