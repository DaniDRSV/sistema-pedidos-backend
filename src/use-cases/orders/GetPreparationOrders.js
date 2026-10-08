class GetPreparationOrders {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ status } = {}) {
    const orders = await this.orderRepository.findPreparationOrders({ status });
    return orders.map((order) => order.toResponse());
  }
}

module.exports = GetPreparationOrders;
