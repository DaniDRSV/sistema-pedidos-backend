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
      `SELECT o.*, u.full_name AS client_name, u.email AS client_email,
        COALESCE(json_agg(json_build_object(
          'productId', i.product_id, 'productName', i.product_name_snapshot,
          'quantity', i.quantity, 'unitPrice', i.unit_price
        ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN users u ON u.id = o.client_id
       LEFT JOIN order_items i ON i.order_id = o.id
       WHERE o.client_id = $1
       GROUP BY o.id, u.full_name, u.email
       ORDER BY o.created_at DESC`,
      [clientId]
    );
    return rows.map((row) => this.mapToEntity(row, row.items));
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT o.*, u.full_name AS client_name, u.email AS client_email,
        COALESCE(json_agg(json_build_object(
          'productId', i.product_id, 'productName', i.product_name_snapshot,
          'quantity', i.quantity, 'unitPrice', i.unit_price
        ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN users u ON u.id = o.client_id
       LEFT JOIN order_items i ON i.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, u.full_name, u.email`,
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0], rows[0].items);
  }

  async findPreparationOrders({ status } = {}) {
    let whereClause = '';
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status.toUpperCase());
      whereClause = 'WHERE o.status = $1';
    } else {
      whereClause = "WHERE o.status = ANY(ARRAY['CREADO', 'PAGADO', 'EN_PREPARACION', 'PENDING', 'PREPARING', 'READY'])";
    }

    const { rows } = await pool.query(
      `SELECT o.*, u.full_name AS client_name, u.email AS client_email,
        COALESCE(json_agg(json_build_object(
          'productId', i.product_id, 'productName', i.product_name_snapshot,
          'quantity', i.quantity, 'unitPrice', i.unit_price
        ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN users u ON u.id = o.client_id
       LEFT JOIN order_items i ON i.order_id = o.id
       ${whereClause}
       GROUP BY o.id, u.full_name, u.email
       ORDER BY 
         CASE o.status 
           WHEN 'EN_PREPARACION' THEN 1
           WHEN 'PREPARING' THEN 1
           WHEN 'PAGADO' THEN 2
           WHEN 'CREADO' THEN 3
           WHEN 'PENDING' THEN 3 
           WHEN 'READY' THEN 4 
           ELSE 5 
         END,
         o.created_at ASC`,
      params
    );

    return rows.map((row) => this.mapToEntity(row, row.items));
  }

  async updateStatus(id, newStatus, { paymentStatus, notes } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let extraSet = '';
      if (newStatus === 'EN_PREPARACION' || newStatus === 'READY' || newStatus === 'PREPARING') {
        extraSet += ', prepared_at = COALESCE(prepared_at, CURRENT_TIMESTAMP)';
      } else if (newStatus === 'EN_CAMINO' || newStatus === 'IN_DELIVERY') {
        extraSet += ', shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP)';
      } else if (newStatus === 'ENTREGADO' || newStatus === 'DELIVERED') {
        extraSet += ', delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)';
      } else if (newStatus === 'CANCELADO' || newStatus === 'CANCELLED') {
        extraSet += ', cancelled_at = COALESCE(cancelled_at, CURRENT_TIMESTAMP)';
        const { rows: items } = await client.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [id]
        );
        for (const item of items) {
          await client.query(
            'UPDATE products SET stock = stock + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }

      if (paymentStatus) {
        extraSet += `, payment_status = '${paymentStatus.replace(/'/g, "''")}'`;
      }
      if (notes) {
        extraSet += `, notes = '${notes.replace(/'/g, "''")}'`;
      }

      const updateQuery = `
        UPDATE orders 
        SET status = $1 ${extraSet}
        WHERE id = $2
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [newStatus, id]);
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query('COMMIT');
      return this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  mapToEntity(row, items) {
    return new Order({
      id: row.id,
      orderNumber: row.order_number,
      clientId: row.client_id,
      clientName: row.client_name || null,
      clientEmail: row.client_email || null,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      addressSnapshot: row.address_snapshot,
      phoneSnapshot: row.phone_snapshot,
      subtotal: parseFloat(row.subtotal),
      deliveryFee: parseFloat(row.delivery_fee || 0),
      total: parseFloat(row.total),
      notes: row.notes,
      createdAt: row.created_at,
      preparedAt: row.prepared_at,
      shippedAt: row.shipped_at,
      deliveredAt: row.delivered_at,
      cancelledAt: row.cancelled_at,
      items: (items || []).map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      }))
    });
  }
}

module.exports = OrderRepositoryPG;
