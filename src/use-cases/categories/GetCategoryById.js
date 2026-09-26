class GetCategoryById {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new Error('Categoría no encontrada.');
    return category.toResponse();
  }
}
module.exports = GetCategoryById;