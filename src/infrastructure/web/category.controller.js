const { sendSuccess } = require('./response');

class CategoryController {
  constructor({ createCategory, getCategories, getCategoryById, updateCategory, toggleCategoryStatus, deleteCategory }) {
    this.createCategory = createCategory;
    this.getCategories = getCategories;
    this.getCategoryById = getCategoryById;
    this.updateCategory = updateCategory;
    this.toggleCategoryStatus = toggleCategoryStatus;
    this.deleteCategory = deleteCategory;
  }

  async create(req, res) {
    const result = await this.createCategory.execute(req.body);
    sendSuccess(res, result, { status: 201, message: 'Categoría creada' });
  }

  async getAll(req, res) {
    const result = await this.getCategories.execute({ isActive: req.query.isActive });
    sendSuccess(res, result);
  }

  async getById(req, res) {
    const result = await this.getCategoryById.execute(req.params.id);
    sendSuccess(res, result);
  }

  async update(req, res) {
    const result = await this.updateCategory.execute(req.params.id, req.body);
    sendSuccess(res, result, { message: 'Categoría actualizada' });
  }

  async toggleStatus(req, res) {
    const result = await this.toggleCategoryStatus.execute(req.params.id);
    sendSuccess(res, result, { message: 'Estado de la categoría actualizado' });
  }

  async delete(req, res) {
    const result = await this.deleteCategory.execute(req.params.id);
    sendSuccess(res, result, { message: 'Categoría eliminada' });
  }
}

module.exports = CategoryController;
