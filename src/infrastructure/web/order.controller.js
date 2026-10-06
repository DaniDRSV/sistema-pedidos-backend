class OrderController {
  constructor({ createOrder, getMyOrders, getPreparationOrders, updateOrderStatus, getOrderById }) {
    this.createOrder = createOrder;
    this.getMyOrders = getMyOrders;
    this.getPreparationOrders = getPreparationOrders;
    this.updateOrderStatus = updateOrderStatus;
    this.getOrderById = getOrderById;
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

  async getPreparationQueue(req, res) {
    try {
      const { status } = req.query;
      const result = await this.getPreparationOrders.execute({ status });
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.getOrderById.execute(Number(id));
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      if (!status) {
        return res.status(400).json({ error: "El campo 'status' es obligatorio." });
      }
      const result = await this.updateOrderStatus.execute({ orderId: Number(id), status, reason });
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        error: error.message,
        allowedStates: error.allowedStates || []
      });
    }
  }
}

module.exports = OrderController;
