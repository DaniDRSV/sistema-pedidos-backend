const express = require('express');

module.exports = (authController, authenticate) => {
  const router = express.Router();

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/register', (req, res) => authController.register(req, res));
  router.get('/me', authenticate, (req, res) => authController.me(req, res));

  return router;
};
