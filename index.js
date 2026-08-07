require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/infrastructure/web/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta raíz de prueba para evitar el "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor Backend ejecutándose correctamente'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});