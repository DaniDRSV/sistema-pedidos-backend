class GetMyOrders {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute(clientId) {
    const orders = await this.orderRepository.findByClientId(clientId);
    return orders.map((order) => order.toResponse());
  }
}

module.exports = GetMyOrders;
