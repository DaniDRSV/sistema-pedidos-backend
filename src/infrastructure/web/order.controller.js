const { sendSuccess } = require('./response');

class OrderController {
  constructor({ createOrder, getMyOrders, getPreparationOrders, updateOrderStatus, getOrderById }) {
    this.createOrder = createOrder;
    this.getMyOrders = getMyOrders;
    this.getPreparationOrders = getPreparationOrders;
    this.updateOrderStatus = updateOrderStatus;
    this.getOrderById = getOrderById;
  }

  async create(req, res) {
    const simulateFailure =
      process.env.ENABLE_FAILURE_SIMULATION === 'true' && req.headers['x-simulate-failure'] === 'true';
    const result = await this.createOrder.execute({ ...req.body, clientId: req.user.id }, { simulateFailure });
    sendSuccess(res, result, { status: 201, message: 'Pedido creado' });
  }

  async getMine(req, res) {
    const result = await this.getMyOrders.execute(req.user.id);
    sendSuccess(res, result);
  }

  async getPreparationQueue(req, res) {
    const result = await this.getPreparationOrders.execute({ status: req.query.status });
    sendSuccess(res, result);
  }

  async getById(req, res) {
    const result = await this.getOrderById.execute(Number(req.params.id), req.user);
    sendSuccess(res, result);
  }

  async updateStatus(req, res) {
    const { status, reason } = req.body || {};
    const result = await this.updateOrderStatus.execute({ orderId: Number(req.params.id), status, reason });
    sendSuccess(res, result, { message: 'Estado del pedido actualizado' });
  }
}

module.exports = OrderController;
