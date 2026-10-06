class GetMyDeliveryOrders {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute(deliveryId) {
    const orders = await this.orderRepository.findByDeliveryId(deliveryId);
    return orders.map((order) => order.toResponse());
  }
}

module.exports = GetMyDeliveryOrders;
