require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/infrastructure/web/auth.routes');
const categoryRoutes = require('./src/infrastructure/web/category.routes');
const productRoutes = require('./src/infrastructure/web/product.routes');
const orderRoutes = require('./src/infrastructure/web/order.routes');
const deliveryRoutes = require('./src/infrastructure/web/delivery.routes');
const userRoutes = require('./src/infrastructure/web/user.routes');

// Middlewares
const createAuthMiddleware = require('./src/infrastructure/web/middlewares/auth.middleware');
const { errorHandler, notFoundHandler } = require('./src/infrastructure/web/middlewares/error.middleware');

// Security
const PasswordHasher = require('./src/infrastructure/security/password.hasher');
const JwtTokenService = require('./src/infrastructure/security/jwt.token.service');

// Repositories
const CategoryRepositoryPG = require('./src/infrastructure/database/category.repository.pg');
const ProductRepositoryPG = require('./src/infrastructure/database/product.repository.pg');
const OrderRepositoryPG = require('./src/infrastructure/database/order.repository.pg');
const UserRepositoryPG = require('./src/infrastructure/database/user.repository.pg');

// Use Cases - Auth
const LoginUser = require('./src/use-cases/auth/LoginUser');
const RegisterUser = require('./src/use-cases/auth/RegisterUser');

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

// Use Cases - Users
const GetUsers = require('./src/use-cases/users/GetUsers');
const GetUserById = require('./src/use-cases/users/GetUserById');
const GetUserOrders = require('./src/use-cases/users/GetUserOrders');
const CreateUser = require('./src/use-cases/users/CreateUser');
const UpdateUser = require('./src/use-cases/users/UpdateUser');
const ToggleUserStatus = require('./src/use-cases/users/ToggleUserStatus');
const ToggleDeliveryAvailability = require('./src/use-cases/users/ToggleDeliveryAvailability');
const ResetUserPassword = require('./src/use-cases/users/ResetUserPassword');

// Controllers
const AuthController = require('./src/infrastructure/web/auth.controller');
const CategoryController = require('./src/infrastructure/web/category.controller');
const ProductController = require('./src/infrastructure/web/product.controller');
const OrderController = require('./src/infrastructure/web/order.controller');
const DeliveryController = require('./src/infrastructure/web/delivery.controller');
const UserController = require('./src/infrastructure/web/user.controller');

const app = express();

app.use(cors());
app.use(express.json());

// Repositories instantiation
const categoryRepository = new CategoryRepositoryPG();
const productRepository = new ProductRepositoryPG();
const orderRepository = new OrderRepositoryPG();
const userRepository = new UserRepositoryPG();
const passwordHasher = new PasswordHasher();
const tokenService = new JwtTokenService();
const { authenticate, authorizeRoles } = createAuthMiddleware(tokenService);

// Use Cases instantiation - Auth
const loginUser = new LoginUser({ userRepository, passwordHasher, tokenService });
const registerUser = new RegisterUser({ userRepository, passwordHasher });

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

// Use Cases instantiation - Users
const getUsers = new GetUsers({ userRepository });
const getUserById = new GetUserById({ userRepository });
const getUserOrders = new GetUserOrders({ userRepository, orderRepository });
const createUser = new CreateUser({ userRepository, passwordHasher });
const updateUser = new UpdateUser({ userRepository });
const toggleUserStatus = new ToggleUserStatus({ userRepository });
const toggleDeliveryAvailability = new ToggleDeliveryAvailability({ userRepository });
const resetUserPassword = new ResetUserPassword({ userRepository, passwordHasher });

// Controllers instantiation
const authController = new AuthController({ loginUser, registerUser });

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

const userController = new UserController({
  getUsers,
  getUserById,
  getUserOrders,
  createUser,
  updateUser,
  toggleUserStatus,
  toggleDeliveryAvailability,
  resetUserPassword
});

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor Backend ejecutándose correctamente'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes(authController, authenticate));
app.use('/api/categories', categoryRoutes(categoryController, authenticate, authorizeRoles));
app.use('/api/products', productRoutes(productController, authenticate, authorizeRoles));
app.use('/api/orders', orderRoutes(orderController, authenticate, authorizeRoles));
app.use('/api/deliveries', deliveryRoutes(deliveryController, authenticate, authorizeRoles));
app.use('/api/users', userRoutes(userController, authenticate, authorizeRoles));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
