class GetCategories {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(filters = {}) {
    const categories = await this.categoryRepository.findAll(filters);
    return categories.map(category => category.toResponse());
  }
}
module.exports = GetCategories;