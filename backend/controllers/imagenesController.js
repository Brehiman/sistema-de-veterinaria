const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const imagenesController = {
    guardar: async (req, res) => {
        try {
            const { entidad_tipo, entidad_id } = req.body;
            const ruta = '/uploads/' + req.file.filename;

            const [result] = await pool.query(
                'INSERT INTO imagenes (entidad_tipo, entidad_id, nombre_original, ruta) VALUES (?, ?, ?, ?)',
                [entidad_tipo, entidad_id, req.file.originalname, ruta]
            );

            res.json({ message: 'Imagen guardada', id: result.insertId, ruta });
        } catch (error) {
            res.status(500).json({ error: 'Error al guardar imagen' });
        }
    },

    getByEntidad: async (req, res) => {
        try {
            const { tipo, id } = req.params;
            const [imagenes] = await pool.query(
                'SELECT * FROM imagenes WHERE entidad_tipo = ? AND entidad_id = ? ORDER BY created_at DESC',
                [tipo, id]
            );
            res.json(imagenes);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    },

    eliminar: async (req, res) => {
        try {
            const [img] = await pool.query('SELECT * FROM imagenes WHERE id = ?', [req.params.id]);
            if (img.length === 0) return res.status(404).json({ error: 'No encontrada' });

            // Eliminar archivo físico
            const filePath = path.join(__dirname, '..', '..', 'frontend', img[0].ruta);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            await pool.query('DELETE FROM imagenes WHERE id = ?', [req.params.id]);
            res.json({ message: 'Imagen eliminada' });
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    }
};

module.exports = imagenesController;