import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Reconstruir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Rutas de las vistas HTML
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/ubicacion', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/location.html'));
});

router.get('/calculadora', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/calculator.html'));
});

export default router;