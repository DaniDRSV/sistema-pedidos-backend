const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('./middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);

// Ejemplo de ruta protegida: requiere Authorization: Bearer <token>
router.get('/me', authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router;
