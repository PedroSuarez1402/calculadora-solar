import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Importar rutas
import webRoutes from './routes/web.js';
import apiRoutes from './routes/api.js';

// 1. Reconstruir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3000;

// 2. Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rutas
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// 4. Iniciar Servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado correctamente`);
    console.log(`👉 Accede a la aplicación: http://localhost:${PORT}\n`);
});