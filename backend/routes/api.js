import { Router } from 'express';
// OJO AQUÍ: Debes poner '.js' al final del import
import SolarController from '../controllers/SolarController.js';

const router = Router();

// Ruta POST para recibir los datos y calcular
router.post('/calcular', SolarController.calcularAhorro);

export default router;