const AppError = require('../../domain/errors/AppError');

class GetOrderById {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, requester) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(`El pedido #${orderId} no fue encontrado.`, 404);
    }

    const isOwner = Number(order.clientId) === Number(requester.id);
    const isAssignedDelivery = Number(order.deliveryId) === Number(requester.id);
    if (requester.role !== 'ADMIN' && !isOwner && !isAssignedDelivery) {
      throw new AppError('No tiene permisos para ver este pedido.', 403);
    }

    return order.toResponse();
  }
}

module.exports = GetOrderById;
