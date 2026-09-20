const Product = require('../../domain/entities/Product');
const IProductRepository = require('../../domain/repositories/IProductRepository');
const pool = require('./postgres');

class ProductRepositoryPG extends IProductRepository {
  async create({ categoryId, sku, name, description, price, stock, imageUrl, isActive }) {
    const query = `
      INSERT INTO products (category_id, sku, name, description, price, stock, image_url, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (now() at time zone 'America/El_Salvador'), (now() at time zone 'America/El_Salvador'))RETURNING *;
    `;
    const values = [categoryId, sku, name, description, price, stock, imageUrl, isActive];
    const { rows } = await pool.query(query, values);
    return new Product(this.mapToEntity(rows[0]));
  }

  async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    
    if (filters.categoryId) {
      values.push(filters.categoryId);
      query += ` AND category_id = $${values.length}`;
    }
    
    query += ' ORDER BY id DESC';
    const { rows } = await pool.query(query, values);
    return rows.map(row => new Product(this.mapToEntity(row)));
  }

    async findById(id) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return new Product(this.mapToEntity(rows[0]));
  }

  async update(id, { categoryId, sku, name, description, price, stock, imageUrl, isActive }) {
    const query = `
      UPDATE products 
      SET category_id = $1, sku = $2, name = $3, description = $4, 
          price = $5, stock = $6, image_url = $7, is_active = $8, updated_at = (now() at time zone 'America/El_Salvador')
      WHERE id = $9 RETURNING *;
    `;
    const values = [categoryId, sku, name, description, price, stock, imageUrl, isActive, id];
    const { rows } = await pool.query(query, values);
    return new Product(this.mapToEntity(rows[0]));
  }

    async toggleStatus(id) {
    const query = `
      update products
      set
        is_active = not is_active,
        updated_at = (now() at time zone 'America/El_Salvador')
      where id = $1
      returning *;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return new Product(this.mapToEntity(rows[0]));
  }

  mapToEntity(dbRow) {
    return {
      id: dbRow.id,
      categoryId: dbRow.category_id,
      sku: dbRow.sku,
      name: dbRow.name,
      description: dbRow.description,
      price: parseFloat(dbRow.price), // numeric viene como string en pg
      stock: dbRow.stock,
      imageUrl: dbRow.image_url,
      isActive: dbRow.is_active,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }
}
module.exports = ProductRepositoryPG;