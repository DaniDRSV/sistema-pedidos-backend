class UpdateProduct {
  constructor({ productRepository, categoryRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute(id, { categoryId, sku, name, description, price, stock, imageUrl, isActive }) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) throw new Error('Producto no encontrado.');

    // Si se intenta cambiar la categoría, validamos que la nueva exista
    if (categoryId && categoryId !== existingProduct.categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) throw new Error('La nueva categoría especificada no existe.');
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