const bcrypt = require('bcrypt');
const pool = require('../config/db');

const authController = {
    // REGISTRAR USUARIO (solo admin)
    registrar: async (req, res) => {
        try {
            const { username, password, nombre, rol } = req.body;

            // Validaciones
            if (!username || !password || !nombre) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            // Verificar si el usuario ya existe
            const [existing] = await pool.query(
                'SELECT id FROM usuarios WHERE username = ?',
                [username]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario
            const [result] = await pool.query(
                'INSERT INTO usuarios (username, password, nombre, rol) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, nombre, rol || 'recepcionista']
            );

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                usuario: {
                    id: result.insertId,
                    username,
                    nombre,
                    rol: rol || 'recepcionista'
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    },

    // INICIAR SESIÓN
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
            }

            // Buscar usuario
            const [usuarios] = await pool.query(
                'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
                [username]
            );

            if (usuarios.length === 0) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const usuario = usuarios[0];

            // Verificar contraseña
            const passwordValido = await bcrypt.compare(password, usuario.password);

            if (!passwordValido) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            // Crear sesión
            req.session.usuario = {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol
            };

            res.json({
                message: 'Inicio de sesión exitoso',
                usuario: req.session.usuario
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },

    // VERIFICAR SESIÓN
    verificarSesion: async (req, res) => {
        if (req.session && req.session.usuario) {
            res.json({ autenticado: true, usuario: req.session.usuario });
        } else {
            res.json({ autenticado: false });
        }
    },

    // CERRAR SESIÓN
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cerrar sesión' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Sesión cerrada exitosamente' });
        });
    }
};

module.exports = authController;