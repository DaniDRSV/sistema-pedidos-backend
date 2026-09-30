const express = require('express');

module.exports = (orderController, authenticate, authorizeRoles) => {
  const router = express.Router();

  router.post('/', authenticate, authorizeRoles('CLIENT'), (req, res) => orderController.create(req, res));
  router.get('/me', authenticate, authorizeRoles('CLIENT'), (req, res) => orderController.getMine(req, res));

  return router;
};
