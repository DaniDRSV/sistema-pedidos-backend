const AppError = require('../../domain/errors/AppError');

class UpdateProduct {
  constructor({ productRepository, categoryRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute(id, { categoryId, sku, name, description, price, stock, imageUrl, isActive }) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) throw new AppError('Producto no encontrado.', 404);
    if (price !== undefined && !(Number(price) > 0)) throw new AppError('El precio debe ser mayor que 0.', 400);
    if (stock !== undefined && !(Number.isInteger(Number(stock)) && Number(stock) >= 0)) {
      throw new AppError('El stock debe ser un número entero mayor o igual a 0.', 400);
    }

    if (categoryId && Number(categoryId) !== Number(existingProduct.categoryId)) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) throw new AppError('La nueva categoría especificada no existe.', 400);
    }

    const updatedProduct = await this.productRepository.update(id, {
      categoryId: categoryId || existingProduct.categoryId,
      sku: sku || existingProduct.sku,
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      price: price !== undefined ? price : existingProduct.price,
      stock: stock !== undefined ? stock : existingProduct.stock,
      imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
      isActive: isActive !== undefined ? isActive : existingProduct.isActive
    });

    return updatedProduct.toResponse();
  }
}
module.exports = UpdateProduct;