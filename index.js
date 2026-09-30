require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/infrastructure/web/auth.routes');
const categoryRoutes = require('./src/infrastructure/web/category.routes');
const productRoutes = require('./src/infrastructure/web/product.routes');
const orderRoutes = require('./src/infrastructure/web/order.routes');

// Middleware
const { authenticate, authorizeRoles } = require('./src/infrastructure/web/middlewares/auth.middleware');


// Repositories 
const CategoryRepositoryPG = require('./src/infrastructure/database/category.repository.pg');
const ProductRepositoryPG = require('./src/infrastructure/database/product.repository.pg');
const OrderRepositoryPG = require('./src/infrastructure/database/order.repository.pg');


// Use Cases Import
// Categories
const CreateCategory = require('./src/use-cases/categories/CreateCategory');
const GetCategories = require('./src/use-cases/categories/GetCategories');
const GetCategoryById = require('./src/use-cases/categories/GetCategoryById');
const UpdateCategory = require('./src/use-cases/categories/UpdateCategory');
const ToggleCategoryStatus = require('./src/use-cases/categories/ToggleCategoryStatus');
const DeleteCategory = require('./src/use-cases/categories/DeleteCategory');
// Products
const CreateProduct = require('./src/use-cases/products/CreateProduct');
const GetProducts = require('./src/use-cases/products/GetProducts');
const GetProductById = require('./src/use-cases/products/GetProductById');
const UpdateProduct = require('./src/use-cases/products/UpdateProduct');
const ToggleProductStatus = require('./src/use-cases/products/ToggleProductStatus');
const DeleteProduct = require('./src/use-cases/products/DeleteProduct');
// Orders
const CreateOrder = require('./src/use-cases/orders/CreateOrder');
const GetMyOrders = require('./src/use-cases/orders/GetMyOrders');


// Controllers
const CategoryController = require('./src/infrastructure/web/category.controller');
const ProductController = require('./src/infrastructure/web/product.controller');
const OrderController = require('./src/infrastructure/web/order.controller');

const app = express();

app.use(cors());
app.use(express.json());


// Repsositories instantiation
const categoryRepository = new CategoryRepositoryPG();
const productRepository = new ProductRepositoryPG();
const orderRepository = new OrderRepositoryPG();


// Use Cases instantiation
// Categories
const createCategory = new CreateCategory({ categoryRepository });
const getCategories = new GetCategories({ categoryRepository });
const getCategoryById = new GetCategoryById({ categoryRepository });
const updateCategory = new UpdateCategory({ categoryRepository });
const toggleCategoryStatus = new ToggleCategoryStatus({categoryRepository});
const deleteCategory = new DeleteCategory({ categoryRepository });
// Products
const createProduct = new CreateProduct({ productRepository, categoryRepository });
const getProducts = new GetProducts({ productRepository });
const getProductById = new GetProductById({ productRepository });
const updateProduct = new UpdateProduct({ productRepository, categoryRepository });
const toggleProductStatus = new ToggleProductStatus({ productRepository });
const deleteProduct = new DeleteProduct({ productRepository });
// Orders
const createOrder = new CreateOrder({ orderRepository });
const getMyOrders = new GetMyOrders({ orderRepository });

// Controllers instantiation
// categories
const categoryController = new CategoryController({
  createCategory, getCategories, getCategoryById, updateCategory, toggleCategoryStatus, deleteCategory
});
// products
const productController = new ProductController({
  createProduct, getProducts, getProductById, updateProduct, toggleProductStatus, deleteProduct
});
// orders
const orderController = new OrderController({ createOrder, getMyOrders });



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
app.use(
  '/api/products',
  productRoutes(
    productController,
    authenticate,
    authorizeRoles
  )
);

app.use(
  '/api/orders',
  orderRoutes(
    orderController,
    authenticate,
    authorizeRoles
  )
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});