const { sendSuccess } = require('./response');

class UserController {
  constructor({
    getUsers,
    getUserById,
    getUserOrders,
    createUser,
    updateUser,
    toggleUserStatus,
    toggleDeliveryAvailability,
    resetUserPassword
  }) {
    this.getUsers = getUsers;
    this.getUserById = getUserById;
    this.getUserOrders = getUserOrders;
    this.createUser = createUser;
    this.updateUser = updateUser;
    this.toggleUserStatus = toggleUserStatus;
    this.toggleDeliveryAvailability = toggleDeliveryAvailability;
    this.resetUserPassword = resetUserPassword;
  }

  async getAll(req, res) {
    const result = await this.getUsers.execute({ role: req.query.role, search: req.query.search });
    sendSuccess(res, result);
  }

  async getById(req, res) {
    sendSuccess(res, await this.getUserById.execute(Number(req.params.id)));
  }

  async getOrders(req, res) {
    sendSuccess(res, await this.getUserOrders.execute(Number(req.params.id)));
  }

  async create(req, res) {
    const result = await this.createUser.execute(req.body);
    sendSuccess(res, result, { status: 201, message: 'Usuario creado' });
  }

  async update(req, res) {
    const result = await this.updateUser.execute(Number(req.params.id), req.body, req.user);
    sendSuccess(res, result, { message: 'Usuario actualizado' });
  }

  async toggleStatus(req, res) {
    const result = await this.toggleUserStatus.execute(Number(req.params.id), req.user);
    sendSuccess(res, result, { message: result.isActive ? 'Usuario activado' : 'Usuario desactivado' });
  }

  async toggleAvailability(req, res) {
    const result = await this.toggleDeliveryAvailability.execute(Number(req.params.id));
    sendSuccess(res, result, { message: 'Disponibilidad actualizada' });
  }

  async resetPassword(req, res) {
    const result = await this.resetUserPassword.execute(Number(req.params.id), req.body?.password);
    sendSuccess(res, result, { message: 'Contraseña actualizada' });
  }
}

module.exports = UserController;
