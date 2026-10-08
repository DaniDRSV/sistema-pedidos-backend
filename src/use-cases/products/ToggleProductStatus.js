const AppError = require('../../domain/errors/AppError');

class ToggleProductStatus {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const product = await this.productRepository.toggleStatus(id);

    if (!product) {
      throw new AppError('Producto no encontrado.', 404);
    }

    return product.toResponse();
  }
}

module.exports = ToggleProductStatus;