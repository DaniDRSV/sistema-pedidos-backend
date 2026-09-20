const express = require('express');

module.exports = (categoryController, authenticate, authorizeRoles) => {
  const router = express.Router();

  // Rutas públicas
  router.get('/', (req, res) =>
    categoryController.getAll(req, res)
  );

  router.get('/:id', (req, res) =>
    categoryController.getById(req, res)
  );

  // Rutas protegidas - solo administrador
  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => categoryController.create(req, res)
  );

  router.put(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => categoryController.update(req, res)
  );

  router.patch(
    '/:id/status',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => categoryController.toggleStatus(req, res)
    );

  return router;
};