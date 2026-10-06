const { calculateLine } = require('../services/pricing');
const { OrderState, OrderStateMachine } = require('./OrderStateMachine');

class Order {
  constructor({
    id,
    orderNumber,
    clientId,
    clientName,
    clientEmail,
    status = OrderState.CREADO,
    paymentMethod,
    paymentStatus,
    addressSnapshot,
    phoneSnapshot,
    subtotal,
    deliveryFee,
    total,
    notes,
    createdAt,
    preparedAt,
    shippedAt,
    deliveredAt,
    cancelledAt,
    items = []
  }) {
    this.id = id;
    this.orderNumber = orderNumber;
    this.clientId = clientId;
    this.clientName = clientName;
    this.clientEmail = clientEmail;
    this.status = OrderStateMachine.normalize(status || OrderState.CREADO);
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.addressSnapshot = addressSnapshot;
    this.phoneSnapshot = phoneSnapshot;
    this.subtotal = subtotal;
    this.deliveryFee = deliveryFee;
    this.total = total;
    this.notes = notes;
    this.createdAt = createdAt;
    this.preparedAt = preparedAt;
    this.shippedAt = shippedAt;
    this.deliveredAt = deliveredAt;
    this.cancelledAt = cancelledAt;
    this.items = items;
  }

  /**
   * Ejecuta una transición de estado a través de la máquina de estados finita.
   * Valida invariantes y actualiza los timestamps del dominio según corresponda.
   */
  transitionTo(nextStatus) {
    const validatedStatus = OrderStateMachine.validateTransition(this.status, nextStatus);
    const now = new Date();

    this.status = validatedStatus;

    if (validatedStatus === OrderState.PAGADO) {
      this.paymentStatus = 'PAID';
    } else if (validatedStatus === OrderState.EN_PREPARACION) {
      this.preparedAt = this.preparedAt || now;
    } else if (validatedStatus === OrderState.EN_CAMINO) {
      this.shippedAt = this.shippedAt || now;
    } else if (validatedStatus === OrderState.ENTREGADO) {
      this.deliveredAt = this.deliveredAt || now;
      this.paymentStatus = 'PAID'; // Si es efectivo contra entrega, queda saldado
    } else if (validatedStatus === OrderState.CANCELADO) {
      this.cancelledAt = this.cancelledAt || now;
    }

    return this;
  }

  /**
   * Métodos semánticos de dominio para cada evento de transición
   */
  markAsPaid() {
    return this.transitionTo(OrderState.PAGADO);
  }

  startPreparation() {
    return this.transitionTo(OrderState.EN_PREPARACION);
  }

  dispatch() {
    return this.transitionTo(OrderState.EN_CAMINO);
  }

  deliver() {
    return this.transitionTo(OrderState.ENTREGADO);
  }

  cancel(reason) {
    if (reason) {
      this.notes = this.notes ? `${this.notes} | Cancelado: ${reason}` : `Cancelado: ${reason}`;
    }
    return this.transitionTo(OrderState.CANCELADO);
  }

  canTransitionTo(targetState) {
    return OrderStateMachine.canTransition(this.status, targetState);
  }

  getAllowedTransitions() {
    return OrderStateMachine.getAllowedTransitions(this.status);
  }

  isTerminal() {
    return OrderStateMachine.isTerminal(this.status);
  }

  toResponse() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      clientId: this.clientId,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      status: this.status,
      allowedTransitions: this.getAllowedTransitions(),
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      addressSnapshot: this.addressSnapshot,
      phoneSnapshot: this.phoneSnapshot,
      subtotal: this.subtotal,
      tax: Math.round((this.total - this.subtotal - (this.deliveryFee || 0)) * 100) / 100,
      deliveryFee: this.deliveryFee,
      total: this.total,
      notes: this.notes,
      createdAt: this.createdAt,
      preparedAt: this.preparedAt,
      shippedAt: this.shippedAt,
      deliveredAt: this.deliveredAt,
      cancelledAt: this.cancelledAt,
      items: this.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        ...calculateLine({ unitPrice: item.unitPrice, quantity: item.quantity })
      }))
    };
  }
}

module.exports = Order;
