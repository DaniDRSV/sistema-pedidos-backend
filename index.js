require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/infrastructure/database/postgres'); // Importamos la conexión DB

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de prueba de salud de la API y de la Base de Datos
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      message: 'Backend y PostgreSQL conectados correctamente',
      db_time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});