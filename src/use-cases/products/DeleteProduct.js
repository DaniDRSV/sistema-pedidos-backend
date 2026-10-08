const AppError = require('../../domain/errors/AppError');

class DeleteProduct {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new AppError('Producto no encontrado.', 404);
    }
    return { id: Number(id) };
  }
}
module.exports = DeleteProduct;
