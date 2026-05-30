const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicamentosController');
const { verificarSesion } = require('../middleware/auth');

router.use(verificarSesion);
router.get('/', controller.getAll);
router.get('/search', controller.search);

module.exports = router;