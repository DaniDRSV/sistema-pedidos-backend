class IOrderRepository {
  async getDeliveryInfo(clientId, addressId) { throw new Error('Not implemented'); }
  async createWithItems(orderData, buildTotals, options) { throw new Error('Not implemented'); }
  async findByClientId(clientId) { throw new Error('Not implemented'); }
  async findById(orderId) { throw new Error('Not implemented'); }
  async findPreparationOrders(filter) { throw new Error('Not implemented'); }
  async updateStatus(orderId, status) { throw new Error('Not implemented'); }
}

module.exports = IOrderRepository;
