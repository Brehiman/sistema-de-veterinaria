const pool = require('../config/db');

const duenosController = {
    // OBTENER TODOS LOS DUEÑOS
    getAll: async (req, res) => {
        try {
            const [duenos] = await pool.query(
                `SELECT d.*, 
                 (SELECT COUNT(*) FROM mascotas WHERE dueno_id = d.id) as total_mascotas
                 FROM duenos d
                 ORDER BY d.created_at DESC`
            );
            res.json(duenos);
        } catch (error) {
            console.error('Error al obtener dueños:', error);
            res.status(500).json({ error: 'Error al obtener dueños' });
        }
    },

    // BUSCAR DUEÑOS
    search: async (req, res) => {
        try {
            const { q } = req.query;
            const [duenos] = await pool.query(
                `SELECT d.*, 
                 (SELECT COUNT(*) FROM mascotas WHERE dueno_id = d.id) as total_mascotas
                 FROM duenos d
                 WHERE d.nombre LIKE ? OR d.telefono LIKE ?
                 ORDER BY d.created_at DESC`,
                [`%${q}%`, `%${q}%`]
            );
            res.json(duenos);
        } catch (error) {
            console.error('Error al buscar dueños:', error);
            res.status(500).json({ error: 'Error al buscar dueños' });
        }
    },

    // OBTENER UN DUEÑO
    getOne: async (req, res) => {
        try {
            const [duenos] = await pool.query(
                `SELECT d.*, 
                 (SELECT COUNT(*) FROM mascotas WHERE dueno_id = d.id) as total_mascotas
                 FROM duenos d
                 WHERE d.id = ?`,
                [req.params.id]
            );

            if (duenos.length === 0) {
                return res.status(404).json({ error: 'Dueño no encontrado' });
            }

            res.json(duenos[0]);
        } catch (error) {
            console.error('Error al obtener dueño:', error);
            res.status(500).json({ error: 'Error al obtener dueño' });
        }
    },

    // CREAR DUEÑO
    create: async (req, res) => {
        try {
            const { nombre, telefono, email, direccion, notas } = req.body;

            if (!nombre || !telefono) {
                return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
            }

            const [result] = await pool.query(
                'INSERT INTO duenos (nombre, telefono, email, direccion, notas) VALUES (?, ?, ?, ?, ?)',
                [nombre, telefono, email || null, direccion || null, notas || null]
            );

            res.status(201).json({
                message: 'Dueño registrado exitosamente',
                id: result.insertId
            });

        } catch (error) {
            console.error('Error al crear dueño:', error);
            res.status(500).json({ error: 'Error al registrar dueño' });
        }
    },

    // ACTUALIZAR DUEÑO
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, telefono, email, direccion, notas } = req.body;

            if (!nombre || !telefono) {
                return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
            }

            const [result] = await pool.query(
                'UPDATE duenos SET nombre = ?, telefono = ?, email = ?, direccion = ?, notas = ? WHERE id = ?',
                [nombre, telefono, email || null, direccion || null, notas || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dueño no encontrado' });
            }

            res.json({ message: 'Dueño actualizado exitosamente' });

        } catch (error) {
            console.error('Error al actualizar dueño:', error);
            res.status(500).json({ error: 'Error al actualizar dueño' });
        }
    },

    // ELIMINAR DUEÑO
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si tiene mascotas
            const [mascotas] = await pool.query(
                'SELECT COUNT(*) as total FROM mascotas WHERE dueno_id = ?',
                [id]
            );

            if (mascotas[0].total > 0) {
                return res.status(400).json({
                    error: `No se puede eliminar. El dueño tiene ${mascotas[0].total} mascota(s) asociada(s).`
                });
            }

            const [result] = await pool.query('DELETE FROM duenos WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dueño no encontrado' });
            }

            res.json({ message: 'Dueño eliminado exitosamente' });

        } catch (error) {
            console.error('Error al eliminar dueño:', error);
            res.status(500).json({ error: 'Error al eliminar dueño' });
        }
    }
};

module.exports = duenosController;