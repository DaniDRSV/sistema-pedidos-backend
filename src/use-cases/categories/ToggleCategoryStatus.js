class ToggleCategoryStatus {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    const category = await this.categoryRepository.toggleStatus(id);

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  }
}

module.exports = ToggleCategoryStatus;