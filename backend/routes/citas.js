const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const { verificarSesion } = require('../middleware/auth');

router.use(verificarSesion);

router.get('/', citasController.getAll);
router.get('/today', citasController.getToday);
router.get('/upcoming', citasController.getUpcoming);
router.get('/:id', citasController.getOne);
router.post('/', citasController.create);
router.put('/:id', citasController.update);
router.delete('/:id', citasController.delete);

module.exports = router;