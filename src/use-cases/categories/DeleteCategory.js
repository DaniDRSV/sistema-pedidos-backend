class DeleteCategory {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      const error = new Error('Categoría no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    const totalProducts = await this.categoryRepository.countProducts(id);
    if (totalProducts > 0) {
      const error = new Error(`No se puede eliminar: la categoría tiene ${totalProducts} producto(s).`);
      error.statusCode = 409;
      throw error;
    }

    await this.categoryRepository.delete(id);
    return { id: Number(id) };
  }
}
module.exports = DeleteCategory;
