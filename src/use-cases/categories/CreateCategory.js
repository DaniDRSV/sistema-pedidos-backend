class CreateCategory {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ name, description, imageUrl }) {
    if (!name) throw new Error('El nombre de la categoría es obligatorio.');

    const newCategory = await this.categoryRepository.create({
      name,
      description,
      imageUrl,
      isActive: true
    });

    return newCategory.toResponse();
  }
}
module.exports = CreateCategory;