const express = require('express');
const router = express.Router();
const controller = require('../controllers/recetasController');
const { verificarSesion } = require('../middleware/auth');

router.use(verificarSesion);
router.post('/', controller.create);
router.get('/cita/:cita_id', controller.getByCita);
router.get('/imprimir/:cita_id', controller.imprimir);

module.exports = router;