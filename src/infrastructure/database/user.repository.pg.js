const db = require('./postgres');
const User = require('../../domain/entities/User');
const IUserRepository = require('../../domain/repositories/IUserRepository');
const AppError = require('../../domain/errors/AppError');

const USER_SELECT = `
  SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.email, u.phone, u.is_active, u.created_at,
    dp.user_id AS profile_user_id, dp.vehicle_type, dp.license_plate, dp.driver_license, dp.is_available,
    COALESCE(c.orders_count, 0) AS orders_count,
    COALESCE(c.total_spent, 0) AS total_spent,
    c.last_order_at,
    COALESCE(d.active_orders, 0) AS active_orders,
    COALESCE(d.delivered_orders, 0) AS delivered_orders
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
  LEFT JOIN delivery_profiles dp ON dp.user_id = u.id
  LEFT JOIN (
    SELECT client_id,
      COUNT(*)::int AS orders_count,
      SUM(total) FILTER (WHERE status <> 'CANCELADO') AS total_spent,
      MAX(created_at) AS last_order_at
    FROM orders
    GROUP BY client_id
  ) c ON c.client_id = u.id
  LEFT JOIN (
    SELECT delivery_id,
      COUNT(*) FILTER (WHERE status IN ('EN_PREPARACION', 'EN_CAMINO'))::int AS active_orders,
      COUNT(*) FILTER (WHERE status = 'ENTREGADO')::int AS delivered_orders
    FROM orders
    WHERE delivery_id IS NOT NULL
    GROUP BY delivery_id
  ) d ON d.delivery_id = u.id
`;

class UserRepositoryPg extends IUserRepository {
  mapToEntity(row) {
    return new User({
      id: row.id,
      roleId: row.role_id,
      roleName: row.role_name,
      fullName: row.full_name,
      email: row.email,
      passwordHash: row.password_hash,
      phone: row.phone,
      isActive: row.is_active,
      createdAt: row.created_at,
      activeOrders: row.active_orders,
      deliveredOrders: row.delivered_orders,
      ordersCount: row.orders_count,
      totalSpent: row.total_spent,
      lastOrderAt: row.last_order_at,
      deliveryProfile: row.profile_user_id
        ? {
          vehicleType: row.vehicle_type,
          licensePlate: row.license_plate,
          driverLicense: row.driver_license,
          isAvailable: row.is_available
        }
        : null
    });
  }

  async findByEmail(email) {
    const result = await db.query(
      `SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.email, u.password_hash, u.phone, u.is_active
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE LOWER(TRIM(u.email)) = $1`,
      [email]
    );
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await db.query(`${USER_SELECT} WHERE u.id = $1`, [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll({ role, search } = {}) {
    const conditions = [];
    const values = [];

    if (role) {
      values.push(role);
      conditions.push(`r.name = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.phone ILIKE $${values.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`${USER_SELECT} ${where} ORDER BY u.created_at DESC, u.id DESC`, values);
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async getRoleIdByName(client, roleName) {
    const result = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (result.rows.length === 0) {
      throw new AppError(`El rol '${roleName}' no existe.`, 400);
    }
    return result.rows[0].id;
  }

  async saveDeliveryProfile(client, userId, profile = {}) {
    await client.query(
      `INSERT INTO delivery_profiles (user_id, vehicle_type, license_plate, driver_license, is_available)
       VALUES ($1, $2, $3, $4, COALESCE($5, true))
       ON CONFLICT (user_id) DO UPDATE
       SET vehicle_type = EXCLUDED.vehicle_type,
           license_plate = EXCLUDED.license_plate,
           driver_license = EXCLUDED.driver_license,
           is_available = COALESCE($5, delivery_profiles.is_available),
           updated_at = CURRENT_TIMESTAMP`,
      [userId, profile.vehicleType || 'MOTORCYCLE', profile.licensePlate || null, profile.driverLicense || null, profile.isAvailable ?? null]
    );
  }

  async create({ fullName, email, passwordHash, phone, roleName = 'CLIENT', deliveryProfile }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const roleId = await this.getRoleIdByName(client, roleName);
      const { rows } = await client.query(
        `INSERT INTO users (role_id, full_name, email, password_hash, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [roleId, fullName, email, passwordHash, phone]
      );
      if (roleName === 'DELIVERY') {
        await this.saveDeliveryProfile(client, rows[0].id, deliveryProfile);
      }
      await client.query('COMMIT');
      return this.findById(rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, { fullName, email, phone, roleName, deliveryProfile }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const roleId = await this.getRoleIdByName(client, roleName);
      await client.query(
        `UPDATE users
         SET full_name = $1, email = $2, phone = $3, role_id = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [fullName, email, phone, roleId, id]
      );
      if (roleName === 'DELIVERY') {
        await this.saveDeliveryProfile(client, id, deliveryProfile);
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

  async setActive(id, isActive) {
    await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, id]
    );
    return this.findById(id);
  }

  async setAvailability(id, isAvailable) {
    await db.query(
      `INSERT INTO delivery_profiles (user_id, is_available)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET is_available = EXCLUDED.is_available, updated_at = CURRENT_TIMESTAMP`,
      [id, isAvailable]
    );
    return this.findById(id);
  }

  async updatePassword(id, passwordHash) {
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );
  }

  async countActiveAdmins() {
    const result = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'ADMIN' AND u.is_active = true`
    );
    return result.rows[0].total;
  }

  async findActiveDeliveryById(userId) {
    const result = await db.query(
      `${USER_SELECT} WHERE u.id = $1 AND r.name = 'DELIVERY' AND u.is_active = true`,
      [userId]
    );
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findActiveDeliveryUsers() {
    const result = await db.query(
      `${USER_SELECT} WHERE r.name = 'DELIVERY' AND u.is_active = true ORDER BY u.full_name ASC`
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }
}

module.exports = UserRepositoryPg;
