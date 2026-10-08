const AppError = require('../../domain/errors/AppError');
const { OrderState, OrderStateMachine } = require('../../domain/entities/OrderStateMachine');

class AssignOrderToDelivery {
  constructor({ orderRepository, userRepository }) {
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  async execute({ orderId, deliveryId }) {
    const parsedOrderId = Number(orderId);
    const parsedDeliveryId = Number(deliveryId);
    if (!Number.isInteger(parsedOrderId) || parsedOrderId < 1) {
      throw new AppError('El identificador del pedido no es válido.', 400);
    }
    if (!Number.isInteger(parsedDeliveryId) || parsedDeliveryId < 1) {
      throw new AppError('deliveryId debe ser un entero positivo.', 400);
    }

    const [order, delivery] = await Promise.all([
      this.orderRepository.findById(parsedOrderId),
      this.userRepository.findActiveDeliveryById(parsedDeliveryId)
    ]);
    if (!order) throw new AppError(`El pedido #${parsedOrderId} no fue encontrado.`, 404);
    if (!delivery) throw new AppError('El repartidor no existe, no está activo o no tiene rol DELIVERY.', 404);
    if (order.isTerminal() || order.status === OrderState.EN_CAMINO) {
      throw new AppError('El pedido ya no puede asignarse a un repartidor.', 409);
    }

    if (order.status !== OrderState.EN_PREPARACION) {
      if (!OrderStateMachine.canTransition(order.status, OrderState.EN_PREPARACION)) {
        throw new AppError(`No se puede asignar un repartidor cuando el pedido está ${order.status}.`, 409);
      }
      order.transitionTo(OrderState.EN_PREPARACION);
    }

    const updated = await this.orderRepository.assignDelivery(
      parsedOrderId,
      parsedDeliveryId,
      order.status,
      { paymentStatus: order.paymentStatus, notes: order.notes }
    );
    return updated.toResponse();
  }
}

module.exports = AssignOrderToDelivery;
