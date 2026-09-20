class ToggleProductStatus {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const product = await this.productRepository.toggleStatus(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return product;
  }
}

module.exports = ToggleProductStatus;