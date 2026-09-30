const { calculateTotals } = require('../../domain/services/pricing');

const DELIVERY_FEE = 0;

const fail = (message, statusCode, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

class CreateOrder {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ clientId, items, addressId, address, notes }, options = {}) {
    if (!Array.isArray(items) || items.length === 0) throw fail('El carrito está vacío.', 400);

    const cart = new Map();
    for (const item of items) {
      const quantity = Number(item?.quantity);
      if (!item?.productId || !Number.isInteger(quantity) || quantity < 1) {
        throw fail('Cada producto necesita productId y una cantidad entera mayor que 0.', 400);
      }
      const current = cart.get(Number(item.productId))?.quantity ?? 0;
      cart.set(Number(item.productId), { productId: Number(item.productId), quantity: current + quantity });
    }

    const info = await this.orderRepository.getDeliveryInfo(clientId, addressId);
    const addressSnapshot = info?.address || (typeof address === 'string' ? address.trim() : '');
    if (addressSnapshot.length < 5) throw fail('La dirección de entrega es obligatoria.', 400);

    const buildTotals = (products) => {
      const byId = new Map(products.map((p) => [p.id, p]));
      const unavailable = [...cart.values()].filter((item) => !byId.get(item.productId)?.isActive);
      if (unavailable.length) {
        throw fail('Uno o más productos no están disponibles.', 409, unavailable.map((i) => ({ productId: i.productId })));
      }

      const shortages = [...cart.values()]
        .filter((item) => byId.get(item.productId).stock < item.quantity)
        .map((item) => ({ productId: item.productId, name: byId.get(item.productId).name, requested: item.quantity, available: byId.get(item.productId).stock }));
      if (shortages.length) throw fail('Stock insuficiente para uno o más productos.', 409, shortages);

      return calculateTotals(
        [...cart.values()].map((item) => ({
          productId: item.productId,
          productName: byId.get(item.productId).name,
          unitPrice: byId.get(item.productId).price,
          quantity: item.quantity
        })),
        DELIVERY_FEE
      );
    };

    const order = await this.orderRepository.createWithItems(
      { clientId, items: [...cart.values()], addressSnapshot, phoneSnapshot: info.phone, notes: notes?.trim() || null },
      buildTotals,
      options
    );
    return order.toResponse();
  }
}

module.exports = CreateOrder;
