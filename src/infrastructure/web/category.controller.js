class CategoryController {
  constructor({ createCategory, getCategories, getCategoryById, updateCategory, toggleCategoryStatus }) {
    this.createCategory = createCategory;
    this.getCategories = getCategories;
    this.getCategoryById = getCategoryById;
    this.updateCategory = updateCategory;
    this.toggleCategoryStatus = toggleCategoryStatus;
  }

  async create(req, res) {
    try {
      const result = await this.createCategory.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getCategories.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const result = await this.getCategoryById.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateCategory.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

    async toggleStatus(req, res) {
    try {
        const result = await this.toggleCategoryStatus.execute(req.params.id);

        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
        error: error.message
        });
    }
    }
}
module.exports = CategoryController;