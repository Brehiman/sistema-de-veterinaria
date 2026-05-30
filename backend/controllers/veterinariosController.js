const pool = require('../config/db');

const veterinariosController = {
    getAll: async (req, res) => {
        try {
            const [veterinarios] = await pool.query(
                'SELECT * FROM veterinarios WHERE activo = 1 ORDER BY nombre'
            );
            res.json(veterinarios);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener veterinarios' });
        }
    },

    getOne: async (req, res) => {
        try {
            const [vet] = await pool.query('SELECT * FROM veterinarios WHERE id = ?', [req.params.id]);
            if (vet.length === 0) return res.status(404).json({ error: 'No encontrado' });
            res.json(vet[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, especialidad, telefono, email } = req.body;
            if (!nombre || !especialidad) return res.status(400).json({ error: 'Campos obligatorios' });
            const [result] = await pool.query(
                'INSERT INTO veterinarios (nombre, especialidad, telefono, email) VALUES (?,?,?,?)',
                [nombre, especialidad, telefono, email]
            );
            res.status(201).json({ message: 'Veterinario creado', id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear' });
        }
    }
};

module.exports = veterinariosController;