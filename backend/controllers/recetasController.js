const pool = require('../config/db');

const recetasController = {
    create: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const { cita_id, veterinario_id, diagnostico, indicaciones, medicamentos } = req.body;

            if (!cita_id || !veterinario_id || !medicamentos || medicamentos.length === 0) {
                return res.status(400).json({ error: 'Datos incompletos' });
            }

            // Crear receta
            const [receta] = await conn.query(
                'INSERT INTO recetas (cita_id, veterinario_id, diagnostico, indicaciones) VALUES (?,?,?,?)',
                [cita_id, veterinario_id, diagnostico, indicaciones]
            );

            // Insertar medicamentos
            for (const med of medicamentos) {
                await conn.query(
                    'INSERT INTO receta_medicamentos (receta_id, medicamento_id, dosis, frecuencia, duracion) VALUES (?,?,?,?,?)',
                    [receta.insertId, med.id, med.dosis, med.frecuencia, med.duracion]
                );
            }

            await conn.commit();
            res.status(201).json({ message: 'Receta creada', id: receta.insertId });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ error: 'Error al crear receta' });
        } finally {
            conn.release();
        }
    },

    getByCita: async (req, res) => {
        try {
            const { cita_id } = req.params;
            const [recetas] = await pool.query(
                `SELECT r.*, v.nombre as veterinario, v.especialidad
                 FROM recetas r
                 JOIN veterinarios v ON r.veterinario_id = v.id
                 WHERE r.cita_id = ?`,
                [cita_id]
            );

            if (recetas.length === 0) return res.json(null);

            const receta = recetas[0];
            const [medicamentos] = await pool.query(
                `SELECT rm.*, m.nombre as medicamento, m.presentacion
                 FROM receta_medicamentos rm
                 JOIN medicamentos m ON rm.medicamento_id = m.id
                 WHERE rm.receta_id = ?`,
                [receta.id]
            );

            res.json({ ...receta, medicamentos });
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    },

    imprimir: async (req, res) => {
        try {
            const { cita_id } = req.params;
            const [recetas] = await pool.query(
                `SELECT r.*, v.nombre as veterinario, v.especialidad, v.telefono as vet_telefono,
                        c.fecha, c.hora, m.nombre as mascota, d.nombre as dueno
                 FROM recetas r
                 JOIN veterinarios v ON r.veterinario_id = v.id
                 JOIN citas c ON r.cita_id = c.id
                 JOIN mascotas m ON c.mascota_id = m.id
                 JOIN duenos d ON m.dueno_id = d.id
                 WHERE r.cita_id = ?`,
                [cita_id]
            );

            if (recetas.length === 0) return res.status(404).json({ error: 'Sin receta' });

            const receta = recetas[0];
            const [medicamentos] = await pool.query(
                `SELECT rm.*, m.nombre as medicamento, m.presentacion
                 FROM receta_medicamentos rm
                 JOIN medicamentos m ON rm.medicamento_id = m.id
                 WHERE rm.receta_id = ?`,
                [receta.id]
            );

            // Devolver HTML imprimible
            const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receta</title>
<style>
body{font-family:Arial;max-width:800px;margin:auto;padding:20px}
.header{border-bottom:3px solid #2E7D32;padding-bottom:10px;margin-bottom:20px}
h1{color:#2E7D32} h2{color:#4CAF50}
.info{display:flex;justify-content:space-between;margin:10px 0}
table{width:100%;border-collapse:collapse;margin:15px 0}
th{background:#4CAF50;color:white;padding:8px}
td{border-bottom:1px solid #ddd;padding:8px}
.footer{margin-top:30px;border-top:1px solid #ccc;padding-top:10px}
@media print{.no-print{display:none}}
</style></head><body>
<div class="no-print" style="text-align:right"><button onclick="window.print()">🖨️ Imprimir</button></div>
<div class="header">
    <h1>🐾 VetCare - Receta Médica</h1>
    <p>Fecha: ${new Date(receta.fecha).toLocaleDateString()} | Hora: ${receta.hora}</p>
</div>
<div class="info">
    <div><strong>Paciente:</strong> ${receta.mascota}<br><strong>Dueño:</strong> ${receta.dueno}</div>
    <div><strong>Veterinario:</strong> ${receta.veterinario}<br><strong>Especialidad:</strong> ${receta.especialidad}</div>
</div>
<h2>Diagnóstico</h2><p>${receta.diagnostico || 'No especificado'}</p>
<h2>Medicamentos Recetados</h2>
<table><tr><th>Medicamento</th><th>Presentación</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr>
${medicamentos.map(m => `<tr><td>${m.medicamento}</td><td>${m.presentacion}</td><td>${m.dosis}</td><td>${m.frecuencia}</td><td>${m.duracion}</td></tr>`).join('')}
</table>
<h2>Indicaciones</h2><p>${receta.indicaciones || 'No especificadas'}</p>
<div class="footer"><p>VetCare - Sistema de Gestión Veterinaria</p></div>
</body></html>`;

            res.send(html);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    }
};

module.exports = recetasController;