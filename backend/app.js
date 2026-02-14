import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Importar rutas
import webRoutes from './routes/web.js';
import apiRoutes from './routes/api.js';

// Importar conexión a BD para verificar
import sequelize from './config/database.js';

// 1. Reconstruir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = [
    'http://localhost:3000', // Para desarrollo local
    'https://calculadora-solar-six.vercel.app', // Tu dominio de producción exacto
    'https://calculadora-solar-q97n2eqw7-pedrosuarez1402s-projects.vercel.app' // (Opcional) La URL de despliegue específica
];

// 2. Middlewares
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o Server-to-Server)
        if (!origin) return callback(null, true);

        // Si el origen está en la lista o es un subdominio de vercel (opcional), permitir
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rutas
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// 4. Verificar conexión a BD y iniciar servidor
try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor iniciado correctamente`);
        console.log(`👉 Accede a la aplicación: http://localhost:${PORT}\n`);
    });
} catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
}