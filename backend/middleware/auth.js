const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ error: 'No autorizado. Inicie sesión.' });
    }
    next();
};

const verificarAdmin = (req, res, next) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    if (req.session.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

module.exports = { verificarSesion, verificarAdmin };