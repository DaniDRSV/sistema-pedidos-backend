const db = require('./postgres');
const User = require('../../domain/entities/User');
const IUserRepository = require('../../domain/repositories/IUserRepository');

class UserRepositoryPg extends IUserRepository {
  async findByEmail(email) {
    const query = `
      SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.email, u.password_hash, u.phone, u.is_active
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1;
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
}

module.exports = UserRepositoryPg;