class OrderController {
  constructor({ createOrder, getMyOrders }) {
    this.createOrder = createOrder;
    this.getMyOrders = getMyOrders;
  }

  async create(req, res) {
    try {
      const simulateFailure =
        process.env.ENABLE_FAILURE_SIMULATION === 'true' && req.headers['x-simulate-failure'] === 'true';
      const result = await this.createOrder.execute({ ...req.body, clientId: req.user.id }, { simulateFailure });
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
    }
  }

  async getMine(req, res) {
    try {
      const result = await this.getMyOrders.execute(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
