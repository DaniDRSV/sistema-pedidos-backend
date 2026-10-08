const AppError = require('../../domain/errors/AppError');
const { OrderState } = require('../../domain/entities/OrderStateMachine');

class UpdateOrderStatus {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId, status, reason }) {
    if (!status) {
      throw new AppError("El campo 'status' es obligatorio.", 400);
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(`El pedido #${orderId} no fue encontrado.`, 404);
    }

    const target = String(status).trim().toUpperCase();
    if (target === OrderState.CANCELADO) {
      order.cancel(reason);
    } else {
      order.transitionTo(target);
    }

    const updatedOrder = await this.orderRepository.updateStatus(orderId, order.status, {
      paymentStatus: order.paymentStatus,
      notes: order.notes
    });

    return updatedOrder.toResponse();
  }
}

module.exports = UpdateOrderStatus;
