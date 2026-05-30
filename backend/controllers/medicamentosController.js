const pool = require('../config/db');

const medicamentosController = {
    getAll: async (req, res) => {
        try {
            const [meds] = await pool.query('SELECT * FROM medicamentos ORDER BY nombre');
            res.json(meds);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    },

    search: async (req, res) => {
        try {
            const { q } = req.query;
            const [meds] = await pool.query(
                'SELECT * FROM medicamentos WHERE nombre LIKE ?',
                [`%${q}%`]
            );
            res.json(meds);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    }
};

module.exports = medicamentosController;