const AppError = require('../../domain/errors/AppError');

class CreateProduct {
  constructor({ productRepository, categoryRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute({ categoryId, sku, name, description, price, stock, imageUrl }) {
    if (!name || !sku) throw new AppError('Nombre y SKU son obligatorios.', 400);
    if (!(Number(price) > 0)) throw new AppError('El precio debe ser mayor que 0.', 400);
    if (stock !== undefined && !(Number.isInteger(Number(stock)) && Number(stock) >= 0)) {
      throw new AppError('El stock debe ser un número entero mayor o igual a 0.', 400);
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new AppError('La categoría especificada no existe.', 400);

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