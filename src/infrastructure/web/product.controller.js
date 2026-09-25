class ProductController {
  constructor({ createProduct, getProducts, getProductById, updateProduct, toggleProductStatus }) {
    this.createProduct = createProduct;
    this.getProducts = getProducts;
    this.getProductById = getProductById;
    this.updateProduct = updateProduct;
    this.toggleProductStatus = toggleProductStatus;
  }

  async create(req, res) {
    try {
      const result = await this.createProduct.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const filters = { 
        categoryId: req.query.categoryId,
        isActive: req.query.isActive 
      };
      const result = await this.getProducts.execute(filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const result = await this.getProductById.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateProduct.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const result = await this.toggleProductStatus.execute(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
}
  
}
module.exports = ProductController;