const Order = require('../../domain/entities/Order');
const IOrderRepository = require('../../domain/repositories/IOrderRepository');
const pool = require('./postgres');

class OrderRepositoryPG extends IOrderRepository {
  async getDeliveryInfo(clientId, addressId) {
    const { rows } = await pool.query(
      `SELECT u.phone, a.address_line, a.city
       FROM users u
       LEFT JOIN client_addresses a ON a.id = $2 AND a.user_id = u.id
       WHERE u.id = $1`,
      [clientId, addressId || null]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      phone: row.phone,
      address: row.address_line ? `${row.address_line}, ${row.city}` : null
    };
  }

  // Transacción atómica: bloqueo de productos, cabecera, detalle y descuento de stock.
  async createWithItems(orderData, buildTotals, { simulateFailure = false } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productIds = orderData.items.map((item) => item.productId);
      const { rows: products } = await client.query(
        'SELECT id, name, price, stock, is_active FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE',
        [productIds]
      );

      const totals = buildTotals(products.map((p) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        stock: p.stock,
        isActive: p.is_active
      })));

      const { rows: orderRows } = await client.query(
        `WITH next AS (SELECT nextval('orders_id_seq') AS id)
         INSERT INTO orders (id, order_number, client_id, address_snapshot, phone_snapshot, subtotal, delivery_fee, total, notes)
         SELECT id, 'ORD-' || LPAD(id::text, 6, '0'), $1, $2, $3, $4, $5, $6, $7 FROM next
         RETURNING *`,
        [orderData.clientId, orderData.addressSnapshot, orderData.phoneSnapshot,
          totals.subtotal, totals.deliveryFee, totals.total, orderData.notes]
      );
      const order = orderRows[0];

      for (const line of totals.lines) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, line.productId, line.productName, line.quantity, line.unitPrice, line.subtotal]
        );

        const { rowCount } = await client.query(
          'UPDATE products SET stock = stock - $2 WHERE id = $1 AND stock >= $2',
          [line.productId, line.quantity]
        );
        if (rowCount === 0) {
          const error = new Error(`Stock insuficiente para ${line.productName}.`);
          error.statusCode = 409;
          throw error;
        }
      }

      if (simulateFailure) throw new Error('Fallo simulado para demostrar el ROLLBACK.');

      await client.query('COMMIT');
      return this.mapToEntity(order, totals.lines);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByClientId(clientId) {
    const { rows } = await pool.query(
      `SELECT o.*, COALESCE(json_agg(json_build_object(
          'productId', i.product_id, 'productName', i.product_name_snapshot,
          'quantity', i.quantity, 'unitPrice', i.unit_price
        ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items i ON i.order_id = o.id
       WHERE o.client_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [clientId]
    );
    return rows.map((row) => this.mapToEntity(row, row.items));
  }

  mapToEntity(row, items) {
    return new Order({
      id: row.id,
      orderNumber: row.order_number,
      clientId: row.client_id,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      addressSnapshot: row.address_snapshot,
      phoneSnapshot: row.phone_snapshot,
      subtotal: parseFloat(row.subtotal),
      deliveryFee: parseFloat(row.delivery_fee),
      total: parseFloat(row.total),
      notes: row.notes,
      createdAt: row.created_at,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      }))
    });
  }
}

module.exports = OrderRepositoryPG;
