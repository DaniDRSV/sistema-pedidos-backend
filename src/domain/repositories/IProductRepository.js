class IProductRepository {
  async create(productData) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findAll(filters) { throw new Error('Not implemented'); }
  async update(id, productData) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = IProductRepository;