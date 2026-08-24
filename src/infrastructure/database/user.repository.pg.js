const db = require('./postgres');
const User = require('../../domain/entities/User');
const IUserRepository = require('../../domain/repositories/IUserRepository');

class UserRepositoryPg extends IUserRepository {
  async findByEmail(email) {
    const query = `
      SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.email, u.password_hash, u.phone, u.is_active
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE LOWER(TRIM(u.email)) = $1;
    `;
    const result = await db.query(query, [email]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new User({
      id: row.id,
      roleId: row.role_id,
      roleName: row.role_name,
      fullName: row.full_name,
      email: row.email,
      passwordHash: row.password_hash,
      phone: row.phone,
      isActive: row.is_active
    });
  }

  async getRoleIdByName(roleName) {
    const query = `SELECT id FROM roles WHERE name = $1;`;
    const result = await db.query(query, [roleName]);
    if (result.rows.length === 0) {
      throw new Error(`El rol '${roleName}' no existe.`);
    }
    return result.rows[0].id;
  }

  async create({ fullName, email, passwordHash, phone, roleName = 'CLIENT' }) {
    const roleId = await this.getRoleIdByName(roleName);

    const query = `
      INSERT INTO users (role_id, full_name, email, password_hash, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, role_id, full_name, email, password_hash, phone, is_active, created_at;
    `;
    const values = [roleId, fullName, email, passwordHash, phone];
    const result = await db.query(query, values);
    const row = result.rows[0];

    return new User({
      id: row.id,
      roleId: row.role_id,
      roleName: roleName,
      fullName: row.full_name,
      email: row.email,
      passwordHash: row.password_hash,
      phone: row.phone,
      isActive: row.is_active,
      createdAt: row.created_at
    });
  }
}

module.exports = UserRepositoryPg;
