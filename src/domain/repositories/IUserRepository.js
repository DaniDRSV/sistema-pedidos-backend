class IUserRepository {
  async findByEmail(email) { throw new Error('Method not implemented'); }
  async findById(id) { throw new Error('Method not implemented'); }
  async findAll(filters) { throw new Error('Method not implemented'); }
  async create(userData) { throw new Error('Method not implemented'); }
  async update(id, userData) { throw new Error('Method not implemented'); }
  async setActive(id, isActive) { throw new Error('Method not implemented'); }
  async setAvailability(id, isAvailable) { throw new Error('Method not implemented'); }
  async updatePassword(id, passwordHash) { throw new Error('Method not implemented'); }
  async countActiveAdmins() { throw new Error('Method not implemented'); }
  async findActiveDeliveryById(userId) { throw new Error('Method not implemented'); }
  async findActiveDeliveryUsers() { throw new Error('Method not implemented'); }
}

module.exports = IUserRepository;
