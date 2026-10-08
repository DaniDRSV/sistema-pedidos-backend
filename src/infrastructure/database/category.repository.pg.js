const Category = require('../../domain/entities/Category');
const ICategoryRepository = require('../../domain/repositories/ICategoryRepository');
const pool = require('./postgres'); 

class CategoryRepositoryPG extends ICategoryRepository {
  async create({ name, description, imageUrl, isActive }) {
    const query = `
      INSERT INTO categories (name, description, image_url, is_active, created_at)
      VALUES ($1, $2, $3, $4, (now() AT TIME ZONE 'America/El_Salvador')) RETURNING *;
    `;
    const values = [name, description, imageUrl, isActive];
    const { rows } = await pool.query(query, values);
    return new Category(this.mapToEntity(rows[0]));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return new Category(this.mapToEntity(rows[0]));
  }

  async findAll(filters = {}) {
    const values = [];
    let query = 'SELECT * FROM categories';
    if (filters.isActive !== undefined && filters.isActive !== 'all') {
      values.push(filters.isActive === true || filters.isActive === 'true');
      query += ' WHERE is_active = $1';
    }
    const { rows } = await pool.query(`${query} ORDER BY id DESC`, values);
    return rows.map(row => new Category(this.mapToEntity(row)));
  }

  async update(id, { name, description, imageUrl, isActive }) {
    const query = `
      UPDATE categories
      SET name = $1, description = $2, image_url = $3, is_active = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [name, description, imageUrl, isActive, id];
    const { rows } = await pool.query(query, values);
    return new Category(this.mapToEntity(rows[0]));
  }

  async toggleStatus(id) {
    const query = `
      UPDATE categories
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return new Category(this.mapToEntity(rows[0]));
  }

  async countProducts(id) {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM products WHERE category_id = $1', [id]);
    return rows[0].total;
  }

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return rowCount > 0;
  }

  mapToEntity(dbRow) {
    return {
      id: dbRow.id,
      name: dbRow.name,
      description: dbRow.description,
      imageUrl: dbRow.image_url,
      isActive: dbRow.is_active,
      createdAt: dbRow.created_at
    };
  }
}
module.exports = CategoryRepositoryPG;