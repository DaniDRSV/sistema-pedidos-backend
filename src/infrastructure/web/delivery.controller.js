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
    try {
      res.status(200).json(await this.getDeliveryCouriers.execute());
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getMyOrders(req, res) {
    try {
      res.status(200).json(await this.getMyDeliveryOrders.execute(req.user.id));
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async assign(req, res) {
    try {
      res.status(200).json(await this.assignOrderToDelivery.execute({
        orderId: req.params.id,
        deliveryId: req.body.deliveryId
      }));
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async start(req, res) {
    try {
      res.status(200).json(await this.startDelivery.execute({
        orderId: req.params.id,
        deliveryId: req.user.id
      }));
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async complete(req, res) {
    try {
      res.status(200).json(await this.completeDelivery.execute({
        orderId: req.params.id,
        deliveryId: req.user.id
      }));
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async unassign(req, res) {
    try {
      res.status(200).json(await this.unassignDelivery.execute({
        orderId: req.params.id,
        requester: req.user
      }));
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = DeliveryController;
