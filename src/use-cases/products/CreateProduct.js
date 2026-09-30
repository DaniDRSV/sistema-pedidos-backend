class CreateProduct {
  constructor({ productRepository, categoryRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute({ categoryId, sku, name, description, price, stock, imageUrl }) {
    if (!name || !sku) throw new Error('Nombre y SKU son obligatorios.');
    if (!(Number(price) > 0)) throw new Error('El precio debe ser mayor que 0.');
    if (stock !== undefined && !(Number.isInteger(Number(stock)) && Number(stock) >= 0)) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0.');
    }

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