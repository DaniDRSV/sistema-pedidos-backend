const { Pool } = require('pg');

// Creamos la piscina de conexiones usando la variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones seguras en nubes como Supabase/Render
  }
});

pool.on('connect', () => {
  console.log('⚡ Conectado exitosamente a PostgreSQL en Supabase');
});

pool.on('error', (err) => {
  console.error('❌ Error imprevisto en la base de datos PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};