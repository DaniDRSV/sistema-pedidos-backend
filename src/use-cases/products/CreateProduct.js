class CreateProduct {
  constructor({ productRepository, categoryRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute({ categoryId, sku, name, description, price, stock, imageUrl }) {
    if (!name || !price || !sku) throw new Error('Nombre, SKU y precio son obligatorios.');

    // Validar que la categoría exista
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new Error('La categoría especificada no existe.');

    const newProduct = await this.productRepository.create({
      categoryId,
      sku,
      name,
      description,
      price,
      stock: stock || 0,
      imageUrl,
      isActive: true
    });

    return newProduct.toResponse();
  }
}
module.exports = CreateProduct;