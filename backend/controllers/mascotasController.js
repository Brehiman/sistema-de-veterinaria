const pool = require('../config/db');

const mascotasController = {
    getAll: async (req, res) => {
        try {
            const [mascotas] = await pool.query(
                `SELECT m.*, d.nombre as dueno_nombre, d.telefono as dueno_telefono
                 FROM mascotas m
                 JOIN duenos d ON m.dueno_id = d.id
                 ORDER BY m.created_at DESC`
            );
            res.json(mascotas);
        } catch (error) {
            console.error('Error al obtener mascotas:', error);
            res.status(500).json({ error: 'Error al obtener mascotas' });
        }
    },

    search: async (req, res) => {
        try {
            const { q } = req.query;
            const [mascotas] = await pool.query(
                `SELECT m.*, d.nombre as dueno_nombre, d.telefono as dueno_telefono
                 FROM mascotas m
                 JOIN duenos d ON m.dueno_id = d.id
                 WHERE m.nombre LIKE ? OR d.nombre LIKE ? OR m.especie LIKE ?
                 ORDER BY m.created_at DESC`,
                [`%${q}%`, `%${q}%`, `%${q}%`]
            );
            res.json(mascotas);
        } catch (error) {
            console.error('Error al buscar mascotas:', error);
            res.status(500).json({ error: 'Error al buscar mascotas' });
        }
    },

    getOne: async (req, res) => {
        try {
            const [mascotas] = await pool.query(
                `SELECT m.*, d.nombre as dueno_nombre, d.telefono as dueno_telefono
                 FROM mascotas m
                 JOIN duenos d ON m.dueno_id = d.id
                 WHERE m.id = ?`,
                [req.params.id]
            );

            if (mascotas.length === 0) {
                return res.status(404).json({ error: 'Mascota no encontrada' });
            }

            res.json(mascotas[0]);
        } catch (error) {
            console.error('Error al obtener mascota:', error);
            res.status(500).json({ error: 'Error al obtener mascota' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, especie, raza, edad, color, peso, dueno_id, notas } = req.body;

            if (!nombre || !especie || !dueno_id) {
                return res.status(400).json({ error: 'Nombre, especie y dueño son obligatorios' });
            }

            // Verificar que el dueño existe
            const [duenos] = await pool.query('SELECT id FROM duenos WHERE id = ?', [dueno_id]);
            if (duenos.length === 0) {
                return res.status(400).json({ error: 'El dueño seleccionado no existe' });
            }

            const [result] = await pool.query(
                'INSERT INTO mascotas (nombre, especie, raza, edad, color, peso, dueno_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nombre, especie, raza || null, edad || null, color || null, peso || null, dueno_id, notas || null]
            );

            res.status(201).json({
                message: 'Mascota registrada exitosamente',
                id: result.insertId
            });

        } catch (error) {
            console.error('Error al crear mascota:', error);
            res.status(500).json({ error: 'Error al registrar mascota' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, especie, raza, edad, color, peso, dueno_id, notas } = req.body;

            if (!nombre || !especie || !dueno_id) {
                return res.status(400).json({ error: 'Nombre, especie y dueño son obligatorios' });
            }

            const [result] = await pool.query(
                'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, color = ?, peso = ?, dueno_id = ?, notas = ? WHERE id = ?',
                [nombre, especie, raza || null, edad || null, color || null, peso || null, dueno_id, notas || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Mascota no encontrada' });
            }

            res.json({ message: 'Mascota actualizada exitosamente' });

        } catch (error) {
            console.error('Error al actualizar mascota:', error);
            res.status(500).json({ error: 'Error al actualizar mascota' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const [result] = await pool.query('DELETE FROM mascotas WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Mascota no encontrada' });
            }

            res.json({ message: 'Mascota eliminada exitosamente' });

        } catch (error) {
            console.error('Error al eliminar mascota:', error);
            res.status(500).json({ error: 'Error al eliminar mascota' });
        }
    }
};

module.exports = mascotasController;