require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/infrastructure/web/auth.routes');
const categoryRoutes = require('./src/infrastructure/web/category.routes');

// Middleware
const { authenticate, authorizeRoles } = require('./src/infrastructure/web/middlewares/auth.middleware');

// Repositories (Infraestructura)
const CategoryRepositoryPG = require('./src/infrastructure/database/category.repository.pg');

// Casos de Uso 
const CreateCategory = require('./src/use-cases/categories/CreateCategory');
const GetCategories = require('./src/use-cases/categories/GetCategories');
const GetCategoryById = require('./src/use-cases/categories/GetCategoryById');
const UpdateCategory = require('./src/use-cases/categories/UpdateCategory');
const ToggleCategoryStatus = require('./src/use-cases/categories/ToggleCategoryStatus');
// Controllers
const CategoryController = require('./src/infrastructure/web/category.controller');


const app = express();

app.use(cors());
app.use(express.json());


// Repsositories
const categoryRepository = new CategoryRepositoryPG();

// Casos de Uso
// categories
const createCategory = new CreateCategory({ categoryRepository });
const getCategories = new GetCategories({ categoryRepository });
const getCategoryById = new GetCategoryById({ categoryRepository });
const updateCategory = new UpdateCategory({ categoryRepository });
const toggleCategoryStatus = new ToggleCategoryStatus({categoryRepository});

// Controllers
// categories
const categoryController = new CategoryController({
  createCategory, getCategories, getCategoryById, updateCategory, toggleCategoryStatus
});

// Ruta raíz de prueba para evitar el "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor Backend ejecutándose correctamente'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use(
  '/api/categories',
  categoryRoutes(
    categoryController,
    authenticate,
    authorizeRoles
  )
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});