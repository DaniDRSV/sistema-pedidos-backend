const AppError = require('../../domain/errors/AppError');

class DeleteCategory {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada.', 404);
    }

    const totalProducts = await this.categoryRepository.countProducts(id);
    if (totalProducts > 0) {
      throw new AppError(`No se puede eliminar: la categoría tiene ${totalProducts} producto(s).`, 409);
    }

    await this.categoryRepository.delete(id);
    return { id: Number(id) };
  }
}
module.exports = DeleteCategory;
