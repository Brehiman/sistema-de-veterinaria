const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarSesion, verificarAdmin } = require('../middleware/auth');

router.post('/registro', verificarSesion, verificarAdmin, authController.registrar);
router.post('/login', authController.login);
router.get('/verificar', authController.verificarSesion);
router.post('/logout', authController.logout);

module.exports = router;