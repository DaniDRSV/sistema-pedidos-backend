class GetCategories {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute() {
    const categories = await this.categoryRepository.findAll();
    return categories.map(category => category.toResponse());
  }
}
module.exports = GetCategories;