const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotasController');
const { verificarSesion } = require('../middleware/auth');

// Todas las rutas requieren sesión
router.use(verificarSesion);

// Rutas CRUD
router.get('/', mascotasController.getAll);
router.get('/search', mascotasController.search);
router.get('/:id', mascotasController.getOne);
router.post('/', mascotasController.create);
router.put('/:id', mascotasController.update);
router.delete('/:id', mascotasController.delete);

module.exports = router;