const AppError = require('../../domain/errors/AppError');

class GetProductById {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Producto no encontrado.', 404);
    return product.toResponse();
  }
}
module.exports = GetProductById;