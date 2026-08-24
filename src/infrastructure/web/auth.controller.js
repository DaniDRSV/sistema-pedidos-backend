const LoginUser = require('../../use-cases/auth/LoginUser');
const RegisterUser = require('../../use-cases/auth/RegisterUser');
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
      if (error.message === 'Credenciales inválidas o cuenta desactivada' || error.message === 'Credenciales inválidas') {
        return res.status(401).json({
          success: false,
          message: 'Usuario y/o contraseña incorrectos'
        });
      }

      console.error('Error interno durante el login:', error);
      return res.status(500).json({
        success: false,
        message: 'Servicio no disponible temporalmente. Intente más tarde.'
      });
    }
  },

  register: async (req, res) => {
    try {
      const { fullName, email, phone, password } = req.body;

      if (!fullName || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (fullName, email, phone, password)'
        });
      }

      const registerUseCase = new RegisterUser({ userRepository, passwordHasher });
      const newUser = await registerUseCase.execute({ fullName, email, phone, password });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: newUser
      });
    } catch (error) {
      if (error.message === 'El correo electrónico ya está registrado.') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error interno durante el registro:', error);

      // RETORNAR EL MENSAJE REAL TEMPORALMENTE PARA DIAGNÓSTICO:
      return res.status(500).json({
        success: false,
        message: error.message || 'Servicio no disponible temporalmente. Intente más tarde.'
      });
    }
  }
};

module.exports = authController;