const AppError = require('../../domain/errors/AppError');
const { OrderState } = require('../../domain/entities/OrderStateMachine');

class CompleteDelivery {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId, deliveryId }) {
    const order = await this.orderRepository.findById(Number(orderId));
    if (!order) throw new AppError(`El pedido #${orderId} no fue encontrado.`, 404);
    if (Number(order.deliveryId) !== Number(deliveryId)) {
      throw new AppError('Este pedido no está asignado al repartidor autenticado.', 403);
    }

    order.transitionTo(OrderState.ENTREGADO);
    const updated = await this.orderRepository.updateStatus(order.id, order.status, {
      paymentStatus: order.paymentStatus,
      notes: order.notes
    });
    return updated.toResponse();
  }
}

module.exports = CompleteDelivery;
