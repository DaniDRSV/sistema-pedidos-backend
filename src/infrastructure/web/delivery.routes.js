const express = require('express');

module.exports = (deliveryController, authenticate, authorizeRoles) => {
  const router = express.Router();

  router.get('/couriers', authenticate, authorizeRoles('ADMIN'), (req, res) =>
    deliveryController.getCouriers(req, res)
  );
  router.get('/orders/me', authenticate, authorizeRoles('DELIVERY'), (req, res) =>
    deliveryController.getMyOrders(req, res)
  );
  router.put('/orders/:id/assignment', authenticate, authorizeRoles('ADMIN'), (req, res) =>
    deliveryController.assign(req, res)
  );
  router.delete('/orders/:id/assignment', authenticate, authorizeRoles('ADMIN', 'DELIVERY'), (req, res) =>
    deliveryController.unassign(req, res)
  );
  router.patch('/orders/:id/start', authenticate, authorizeRoles('DELIVERY'), (req, res) =>
    deliveryController.start(req, res)
  );
  router.patch('/orders/:id/complete', authenticate, authorizeRoles('DELIVERY'), (req, res) =>
    deliveryController.complete(req, res)
  );

  return router;
};
