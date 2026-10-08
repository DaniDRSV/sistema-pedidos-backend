const AppError = require('../../domain/errors/AppError');
const { OrderState } = require('../../domain/entities/OrderStateMachine');

class UnassignDelivery {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId, requester }) {
    const order = await this.orderRepository.findById(Number(orderId));
    if (!order) throw new AppError(`El pedido #${orderId} no fue encontrado.`, 404);
    if (!order.deliveryId) throw new AppError('El pedido no tiene un repartidor asignado.', 409);
    if (order.status === OrderState.EN_CAMINO || order.isTerminal()) {
      throw new AppError('No se puede desasignar un pedido que ya salió a reparto o finalizó.', 409);
    }
    if (requester.role !== 'ADMIN' && Number(order.deliveryId) !== Number(requester.id)) {
      throw new AppError('No puede desasignar el repartidor de este pedido.', 403);
    }

    const updated = await this.orderRepository.clearDeliveryAssignment(order.id);
    return updated.toResponse();
  }
}

module.exports = UnassignDelivery;
