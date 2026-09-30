class DeleteProduct {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      const error = new Error('Producto no encontrado.');
      error.statusCode = 404;
      throw error;
    }
    return { id: Number(id) };
  }
}
module.exports = DeleteProduct;
