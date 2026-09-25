class UpdateCategory {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id, { name, description, imageUrl, isActive }) {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) throw new Error('Categoría no encontrada.');

    const updatedCategory = await this.categoryRepository.update(id, {
      name: name || existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      imageUrl: imageUrl !== undefined ? imageUrl : existingCategory.imageUrl,
      isActive: isActive !== undefined ? isActive : existingCategory.isActive
    });

    return updatedCategory.toResponse();
  }
}
module.exports = UpdateCategory;
