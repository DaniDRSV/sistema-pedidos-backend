const express = require('express');

module.exports = (productController, authenticate, authorizeRoles) => {
  const router = express.Router();

  // Rutas públicas
  // Cualquiera puede consultar el catálogo
  router.get('/', (req, res) => productController.getAll(req, res));

  router.get('/:id', (req, res) => productController.getById(req, res));

  // Rutas protegidas
  // Solo administradores pueden modificar el catálogo
  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => productController.create(req, res)
  );

  router.put(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => productController.update(req, res)
  );

  // Eliminación lógica
  router.delete(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => productController.delete(req, res)
  );

  // Activar / desactivar producto
  router.patch(
    '/:id/status',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => productController.toggleStatus(req, res)
  );

  return router;
};