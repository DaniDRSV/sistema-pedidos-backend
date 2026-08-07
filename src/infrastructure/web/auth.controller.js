const LoginUser = require('../../use-cases/auth/LoginUser');
const UserRepositoryPg = require('../database/user.repository.pg');
const PasswordHasher = require('../security/password.hasher');
const JwtTokenService = require('../security/jwt.token.service');

const userRepository = new UserRepositoryPg();
const passwordHasher = new PasswordHasher();
const tokenService = new JwtTokenService();

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Correo y contraseña requeridos' 
        });
      }

      const loginUseCase = new LoginUser({ userRepository, passwordHasher, tokenService });
      const result = await loginUseCase.execute({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      // Si es un error controlado de credenciales (Lógica de negocio)
      if (error.message === 'Credenciales inválidas o cuenta desactivada' || error.message === 'Credenciales inválidas') {
        return res.status(401).json({
          success: false,
          message: 'Usuario y/o contraseña incorrectos'
        });
      }

      // Si es un error de infraestructura/Base de datos (ENOTFOUND, timeout, etc.)
      console.error('Error interno durante el login:', error);
      return res.status(500).json({
        success: false,
        message: 'Servicio no disponible temporalmente. Intente más tarde.'
      });
    }
  }
};

module.exports = authController;