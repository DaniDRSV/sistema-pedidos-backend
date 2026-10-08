const express = require('express');

module.exports = (userController, authenticate, authorizeRoles) => {
  const router = express.Router();

  router.use(authenticate, authorizeRoles('ADMIN'));

  router.get('/', (req, res) => userController.getAll(req, res));
  router.post('/', (req, res) => userController.create(req, res));
  router.get('/:id', (req, res) => userController.getById(req, res));
  router.get('/:id/orders', (req, res) => userController.getOrders(req, res));
  router.put('/:id', (req, res) => userController.update(req, res));
  router.patch('/:id/status', (req, res) => userController.toggleStatus(req, res));
  router.patch('/:id/availability', (req, res) => userController.toggleAvailability(req, res));
  router.patch('/:id/password', (req, res) => userController.resetPassword(req, res));

  return router;
};
