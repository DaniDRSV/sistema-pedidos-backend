const AppError = require('../../domain/errors/AppError');

class GetUserOrders {
  constructor({ userRepository, orderRepository }) {
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    let orders = [];
    if (user.roleName === 'CLIENT') {
      orders = await this.orderRepository.findByClientId(user.id);
    } else if (user.roleName === 'DELIVERY') {
      orders = await this.orderRepository.findByDeliveryId(user.id);
    }
    return orders.map((order) => order.toResponse());
  }
}

module.exports = GetUserOrders;
