const { calculateLine } = require('../services/pricing');

class Order {
  constructor({ id, orderNumber, clientId, status, paymentMethod, paymentStatus, addressSnapshot, phoneSnapshot, subtotal, deliveryFee, total, notes, createdAt, items = [] }) {
    this.id = id;
    this.orderNumber = orderNumber;
    this.clientId = clientId;
    this.status = status;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.addressSnapshot = addressSnapshot;
    this.phoneSnapshot = phoneSnapshot;
    this.subtotal = subtotal;
    this.deliveryFee = deliveryFee;
    this.total = total;
    this.notes = notes;
    this.createdAt = createdAt;
    this.items = items;
  }

  toResponse() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      clientId: this.clientId,
      status: this.status,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      addressSnapshot: this.addressSnapshot,
      phoneSnapshot: this.phoneSnapshot,
      subtotal: this.subtotal,
      tax: Math.round((this.total - this.subtotal - this.deliveryFee) * 100) / 100,
      deliveryFee: this.deliveryFee,
      total: this.total,
      notes: this.notes,
      createdAt: this.createdAt,
      items: this.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        ...calculateLine({ unitPrice: item.unitPrice, quantity: item.quantity })
      }))
    };
  }
}

module.exports = Order;
