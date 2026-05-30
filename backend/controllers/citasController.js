const pool = require('../config/db');

const citasController = {
    getAll: async (req, res) => {
        try {
            const { fecha } = req.query;
            let query = `
                SELECT c.*, m.nombre as mascota_nombre, m.especie,
                       d.nombre as dueno_nombre, d.telefono as dueno_telefono,
                       v.nombre as veterinario_nombre, v.especialidad as veterinario_especialidad
                FROM citas c
                JOIN mascotas m ON c.mascota_id = m.id
                JOIN duenos d ON m.dueno_id = d.id
                LEFT JOIN veterinarios v ON c.veterinario_id = v.id
            `;
            const params = [];

            if (fecha) {
                query += ' WHERE c.fecha = ?';
                params.push(fecha);
            }

            query += ' ORDER BY c.fecha DESC, c.hora DESC';

            const [citas] = await pool.query(query, params);
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener citas:', error);
            res.status(500).json({ error: 'Error al obtener citas' });
        }
    },

    getToday: async (req, res) => {
        try {
            const [citas] = await pool.query(
                `SELECT c.*, m.nombre as mascota_nombre, m.especie,
                        d.nombre as dueno_nombre, d.telefono as dueno_telefono,
                        v.nombre as veterinario_nombre, v.especialidad as veterinario_especialidad
                 FROM citas c
                 JOIN mascotas m ON c.mascota_id = m.id
                 JOIN duenos d ON m.dueno_id = d.id
                 LEFT JOIN veterinarios v ON c.veterinario_id = v.id
                 WHERE c.fecha = CURDATE()
                 ORDER BY c.hora`
            );
            res.json(citas);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener citas de hoy' });
        }
    },

    getUpcoming: async (req, res) => {
        try {
            const [citas] = await pool.query(
                `SELECT c.*, m.nombre as mascota_nombre, m.especie,
                        d.nombre as dueno_nombre, d.telefono as dueno_telefono,
                        v.nombre as veterinario_nombre, v.especialidad as veterinario_especialidad
                 FROM citas c
                 JOIN mascotas m ON c.mascota_id = m.id
                 JOIN duenos d ON m.dueno_id = d.id
                 LEFT JOIN veterinarios v ON c.veterinario_id = v.id
                 WHERE c.fecha >= CURDATE()
                 ORDER BY c.fecha ASC, c.hora ASC`
            );
            res.json(citas);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener próximas citas' });
        }
    },

    getOne: async (req, res) => {
        try {
            const [citas] = await pool.query(
                `SELECT c.*, m.nombre as mascota_nombre, m.especie,
                        d.nombre as dueno_nombre, d.telefono as dueno_telefono,
                        v.nombre as veterinario_nombre, v.especialidad as veterinario_especialidad
                 FROM citas c
                 JOIN mascotas m ON c.mascota_id = m.id
                 JOIN duenos d ON m.dueno_id = d.id
                 LEFT JOIN veterinarios v ON c.veterinario_id = v.id
                 WHERE c.id = ?`,
                [req.params.id]
            );

            if (citas.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
            res.json(citas[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener cita' });
        }
    },

    create: async (req, res) => {
        try {
            const { fecha, hora, mascota_id, veterinario_id, motivo, estado, notas } = req.body;

            if (!fecha || !hora || !mascota_id || !motivo) {
                return res.status(400).json({ error: 'Fecha, hora, mascota y motivo son obligatorios' });
            }

            const [mascotas] = await pool.query('SELECT id FROM mascotas WHERE id = ?', [mascota_id]);
            if (mascotas.length === 0) {
                return res.status(400).json({ error: 'La mascota seleccionada no existe' });
            }

            const [result] = await pool.query(
                'INSERT INTO citas (fecha, hora, mascota_id, veterinario_id, motivo, estado, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [fecha, hora, mascota_id, veterinario_id || null, motivo, estado || 'Pendiente', notas || null]
            );

            res.status(201).json({ message: 'Cita agendada exitosamente', id: result.insertId });
        } catch (error) {
            console.error('Error al crear cita:', error);
            res.status(500).json({ error: 'Error al agendar cita' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { fecha, hora, mascota_id, veterinario_id, motivo, estado, notas } = req.body;

            if (!fecha || !hora || !mascota_id || !motivo) {
                return res.status(400).json({ error: 'Fecha, hora, mascota y motivo son obligatorios' });
            }

            const [result] = await pool.query(
                'UPDATE citas SET fecha = ?, hora = ?, mascota_id = ?, veterinario_id = ?, motivo = ?, estado = ?, notas = ? WHERE id = ?',
                [fecha, hora, mascota_id, veterinario_id || null, motivo, estado || 'Pendiente', notas || null, id]
            );

            if (result.affectedRows === 0) return res.status(404).json({ error: 'Cita no encontrada' });
            res.json({ message: 'Cita actualizada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar cita' });
        }
    },

    delete: async (req, res) => {
        try {
            const [result] = await pool.query('DELETE FROM citas WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Cita no encontrada' });
            res.json({ message: 'Cita eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar cita' });
        }
    }
};

module.exports = citasController;