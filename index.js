require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/infrastructure/web/auth.routes');
const categoryRoutes = require('./src/infrastructure/web/category.routes');
const productRoutes = require('./src/infrastructure/web/product.routes');
const orderRoutes = require('./src/infrastructure/web/order.routes');
const deliveryRoutes = require('./src/infrastructure/web/delivery.routes');

// Middleware
const { authenticate, authorizeRoles } = require('./src/infrastructure/web/middlewares/auth.middleware');

// Repositories
const CategoryRepositoryPG = require('./src/infrastructure/database/category.repository.pg');
const ProductRepositoryPG = require('./src/infrastructure/database/product.repository.pg');
const OrderRepositoryPG = require('./src/infrastructure/database/order.repository.pg');
const UserRepositoryPG = require('./src/infrastructure/database/user.repository.pg');

// Use Cases - Categories
const CreateCategory = require('./src/use-cases/categories/CreateCategory');
const GetCategories = require('./src/use-cases/categories/GetCategories');
const GetCategoryById = require('./src/use-cases/categories/GetCategoryById');
const UpdateCategory = require('./src/use-cases/categories/UpdateCategory');
const ToggleCategoryStatus = require('./src/use-cases/categories/ToggleCategoryStatus');
const DeleteCategory = require('./src/use-cases/categories/DeleteCategory');

// Use Cases - Products
const CreateProduct = require('./src/use-cases/products/CreateProduct');
const GetProducts = require('./src/use-cases/products/GetProducts');
const GetProductById = require('./src/use-cases/products/GetProductById');
const UpdateProduct = require('./src/use-cases/products/UpdateProduct');
const ToggleProductStatus = require('./src/use-cases/products/ToggleProductStatus');
const DeleteProduct = require('./src/use-cases/products/DeleteProduct');

// Use Cases - Orders
const CreateOrder = require('./src/use-cases/orders/CreateOrder');
const GetMyOrders = require('./src/use-cases/orders/GetMyOrders');
const GetPreparationOrders = require('./src/use-cases/orders/GetPreparationOrders');
const UpdateOrderStatus = require('./src/use-cases/orders/UpdateOrderStatus');
const GetOrderById = require('./src/use-cases/orders/GetOrderById');

// Use Cases - Delivery
const GetDeliveryCouriers = require('./src/use-cases/delivery/GetDeliveryCouriers');
const GetMyDeliveryOrders = require('./src/use-cases/delivery/GetMyDeliveryOrders');
const AssignOrderToDelivery = require('./src/use-cases/delivery/AssignOrderToDelivery');
const StartDelivery = require('./src/use-cases/delivery/StartDelivery');
const CompleteDelivery = require('./src/use-cases/delivery/CompleteDelivery');
const UnassignDelivery = require('./src/use-cases/delivery/UnassignDelivery');

// Controllers
const CategoryController = require('./src/infrastructure/web/category.controller');
const ProductController = require('./src/infrastructure/web/product.controller');
const OrderController = require('./src/infrastructure/web/order.controller');
const DeliveryController = require('./src/infrastructure/web/delivery.controller');

const app = express();

app.use(cors());
app.use(express.json());

// Repositories instantiation
const categoryRepository = new CategoryRepositoryPG();
const productRepository = new ProductRepositoryPG();
const orderRepository = new OrderRepositoryPG();
const userRepository = new UserRepositoryPG();

// Use Cases instantiation - Categories
const createCategory = new CreateCategory({ categoryRepository });
const getCategories = new GetCategories({ categoryRepository });
const getCategoryById = new GetCategoryById({ categoryRepository });
const updateCategory = new UpdateCategory({ categoryRepository });
const toggleCategoryStatus = new ToggleCategoryStatus({ categoryRepository });
const deleteCategory = new DeleteCategory({ categoryRepository });

// Use Cases instantiation - Products
const createProduct = new CreateProduct({ productRepository, categoryRepository });
const getProducts = new GetProducts({ productRepository });
const getProductById = new GetProductById({ productRepository });
const updateProduct = new UpdateProduct({ productRepository, categoryRepository });
const toggleProductStatus = new ToggleProductStatus({ productRepository });
const deleteProduct = new DeleteProduct({ productRepository });

// Use Cases instantiation - Orders
const createOrder = new CreateOrder({ orderRepository });
const getMyOrders = new GetMyOrders({ orderRepository });
const getPreparationOrders = new GetPreparationOrders({ orderRepository });
const updateOrderStatus = new UpdateOrderStatus({ orderRepository });
const getOrderById = new GetOrderById({ orderRepository });

// Use Cases instantiation - Delivery
const getDeliveryCouriers = new GetDeliveryCouriers({ userRepository });
const getMyDeliveryOrders = new GetMyDeliveryOrders({ orderRepository });
const assignOrderToDelivery = new AssignOrderToDelivery({ orderRepository, userRepository });
const startDelivery = new StartDelivery({ orderRepository });
const completeDelivery = new CompleteDelivery({ orderRepository });
const unassignDelivery = new UnassignDelivery({ orderRepository });

// Controllers instantiation
const categoryController = new CategoryController({
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory
});

const productController = new ProductController({
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct
});

const orderController = new OrderController({
  createOrder,
  getMyOrders,
  getPreparationOrders,
  updateOrderStatus,
  getOrderById
});

const deliveryController = new DeliveryController({
  getDeliveryCouriers,
  getMyDeliveryOrders,
  assignOrderToDelivery,
  startDelivery,
  completeDelivery,
  unassignDelivery
});

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor Backend ejecutándose correctamente'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes(categoryController, authenticate, authorizeRoles));
app.use('/api/products', productRoutes(productController, authenticate, authorizeRoles));
app.use('/api/orders', orderRoutes(orderController, authenticate, authorizeRoles));
app.use('/api/deliveries', deliveryRoutes(deliveryController, authenticate, authorizeRoles));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
