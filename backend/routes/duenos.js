const express = require('express');
const router = express.Router();
const duenosController = require('../controllers/duenosController');
const { verificarSesion } = require('../middleware/auth');

router.use(verificarSesion); // Todas las rutas requieren sesión

router.get('/', duenosController.getAll);
router.get('/search', duenosController.search);
router.get('/:id', duenosController.getOne);
router.post('/', duenosController.create);
router.put('/:id', duenosController.update);
router.delete('/:id', duenosController.delete);

module.exports = router;