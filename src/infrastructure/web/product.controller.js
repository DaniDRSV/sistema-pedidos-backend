const { sendSuccess } = require('./response');

class ProductController {
  constructor({ createProduct, getProducts, getProductById, updateProduct, toggleProductStatus, deleteProduct }) {
    this.createProduct = createProduct;
    this.getProducts = getProducts;
    this.getProductById = getProductById;
    this.updateProduct = updateProduct;
    this.toggleProductStatus = toggleProductStatus;
    this.deleteProduct = deleteProduct;
  }

  async create(req, res) {
    const result = await this.createProduct.execute(req.body);
    sendSuccess(res, result, { status: 201, message: 'Producto creado' });
  }

  async getAll(req, res) {
    const result = await this.getProducts.execute({
      categoryId: req.query.categoryId,
      isActive: req.query.isActive
    });
    sendSuccess(res, result);
  }

  async getById(req, res) {
    const result = await this.getProductById.execute(req.params.id);
    sendSuccess(res, result);
  }

  async update(req, res) {
    const result = await this.updateProduct.execute(req.params.id, req.body);
    sendSuccess(res, result, { message: 'Producto actualizado' });
  }

  async toggleStatus(req, res) {
    const result = await this.toggleProductStatus.execute(req.params.id);
    sendSuccess(res, result, { message: 'Estado del producto actualizado' });
  }

  async delete(req, res) {
    const result = await this.deleteProduct.execute(req.params.id);
    sendSuccess(res, result, { message: 'Producto eliminado' });
  }
}

module.exports = ProductController;
