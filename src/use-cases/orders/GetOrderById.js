class GetOrderById {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const error = new Error(`El pedido #${orderId} no fue encontrado.`);
      error.statusCode = 404;
      throw error;
    }
    return order.toResponse();
  }
}

module.exports = GetOrderById;
