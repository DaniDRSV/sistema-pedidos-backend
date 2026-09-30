class IOrderRepository {
  async getDeliveryInfo(clientId, addressId) { throw new Error('Not implemented'); }
  async createWithItems(orderData, buildTotals, options) { throw new Error('Not implemented'); }
  async findByClientId(clientId) { throw new Error('Not implemented'); }
}

module.exports = IOrderRepository;
