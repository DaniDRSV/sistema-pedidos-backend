const { sendSuccess } = require('./response');

class DeliveryController {
  constructor({ getDeliveryCouriers, getMyDeliveryOrders, assignOrderToDelivery, startDelivery, completeDelivery, unassignDelivery }) {
    this.getDeliveryCouriers = getDeliveryCouriers;
    this.getMyDeliveryOrders = getMyDeliveryOrders;
    this.assignOrderToDelivery = assignOrderToDelivery;
    this.startDelivery = startDelivery;
    this.completeDelivery = completeDelivery;
    this.unassignDelivery = unassignDelivery;
  }

  async getCouriers(req, res) {
    sendSuccess(res, await this.getDeliveryCouriers.execute());
  }

  async getMyOrders(req, res) {
    sendSuccess(res, await this.getMyDeliveryOrders.execute(req.user.id));
  }

  async assign(req, res) {
    const result = await this.assignOrderToDelivery.execute({
      orderId: req.params.id,
      deliveryId: req.body?.deliveryId
    });
    sendSuccess(res, result, { message: 'Repartidor asignado' });
  }

  async start(req, res) {
    const result = await this.startDelivery.execute({ orderId: req.params.id, deliveryId: req.user.id });
    sendSuccess(res, result, { message: 'Pedido en camino' });
  }

  async complete(req, res) {
    const result = await this.completeDelivery.execute({ orderId: req.params.id, deliveryId: req.user.id });
    sendSuccess(res, result, { message: 'Pedido entregado' });
  }

  async unassign(req, res) {
    const result = await this.unassignDelivery.execute({ orderId: req.params.id, requester: req.user });
    sendSuccess(res, result, { message: 'Asignación retirada' });
  }
}

module.exports = DeliveryController;
