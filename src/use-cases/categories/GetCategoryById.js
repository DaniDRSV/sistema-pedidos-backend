const AppError = require('../../domain/errors/AppError');

class GetCategoryById {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Categoría no encontrada.', 404);
    return category.toResponse();
  }
}
module.exports = GetCategoryById;