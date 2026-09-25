class Product {
  constructor({ id, categoryId, sku, name, description, price, stock, imageUrl, isActive, createdAt, updatedAt }) {
    this.id = id;
    this.categoryId = categoryId;
    this.sku = sku;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toResponse() {
    return {
      id: this.id,
      categoryId: this.categoryId,
      sku: this.sku,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;