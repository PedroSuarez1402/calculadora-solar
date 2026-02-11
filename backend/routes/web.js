import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Reconstruir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// URL de tu frontend en producción (Vercel)
const FRONTEND_URL = 'https://calculadora-solar-six.vercel.app';

// 1. Ruta Principal: Muestra una "Landing de API" creativa
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 2. Redirección Inteligente:
// Si alguien intenta entrar a las rutas viejas en el backend, lo mandamos al frontend nuevo
router.get('/ubicacion', (req, res) => res.redirect(`${FRONTEND_URL}/ubicacion`));
router.get('/calculadora', (req, res) => res.redirect(`${FRONTEND_URL}/calculadora`));

export default router;