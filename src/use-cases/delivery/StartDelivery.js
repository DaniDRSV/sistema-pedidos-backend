const { OrderState } = require('../../domain/entities/OrderStateMachine');

const fail = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class StartDelivery {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId, deliveryId }) {
    const order = await this.orderRepository.findById(Number(orderId));
    if (!order) throw fail(`El pedido #${orderId} no fue encontrado.`, 404);
    if (Number(order.deliveryId) !== Number(deliveryId)) {
      throw fail('Este pedido no está asignado al repartidor autenticado.', 403);
    }

    order.transitionTo(OrderState.EN_CAMINO);
    const updated = await this.orderRepository.updateStatus(order.id, order.status, {
      paymentStatus: order.paymentStatus,
      notes: order.notes
    });
    return updated.toResponse();
  }
}

module.exports = StartDelivery;
