const express = require('express');

module.exports = (orderController, authenticate, authorizeRoles) => {
  const router = express.Router();

  router.post('/', authenticate, authorizeRoles('CLIENT'), (req, res) => orderController.create(req, res));
  router.get('/me', authenticate, authorizeRoles('CLIENT'), (req, res) => orderController.getMine(req, res));
  router.get('/preparation', authenticate, authorizeRoles('ADMIN', 'DELIVERY'), (req, res) => orderController.getPreparationQueue(req, res));
  router.get('/:id', authenticate, (req, res) => orderController.getById(req, res));
  router.patch('/:id/status', authenticate, authorizeRoles('ADMIN'), (req, res) => orderController.updateStatus(req, res));

  return router;
};
