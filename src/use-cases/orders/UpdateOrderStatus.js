class UpdateOrderStatus {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId, status, reason }) {
    if (!status) {
      const error = new Error("El campo 'status' es obligatorio.");
      error.statusCode = 400;
      throw error;
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const error = new Error(`El pedido #${orderId} no fue encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    // Delegación directa a la máquina de estados finita encapsulada en la entidad de dominio
    order.transitionTo(status);
    if (reason && order.status === 'CANCELADO') {
      order.cancel(reason);
    }

    // Persistir el nuevo estado y metadatos resultantes de la FSM
    const updatedOrder = await this.orderRepository.updateStatus(orderId, order.status, {
      paymentStatus: order.paymentStatus,
      notes: order.notes
    });

    return (updatedOrder || order).toResponse();
  }
}

module.exports = UpdateOrderStatus;
