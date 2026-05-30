// ===================================
// 1. CONFIGURACIÓN INICIAL
// ===================================
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');

// ===================================
// 2. INICIALIZAR APP (¡IMPORTANTE!)
// ===================================
const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// 3. CONFIGURACIÓN DE MULTER (UPLOADS)
// ===================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'frontend', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Solo imágenes (jpg, png, gif, webp)'));
        }
    }
});

// ===================================
// 4. MIDDLEWARES GLOBALES
// ===================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// ===================================
// 5. ARCHIVOS ESTÁTICOS
// ===================================
// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'frontend', 'uploads')));

// ===================================
// 6. IMPORTAR RUTAS
// ===================================
const authRoutes = require('./routes/auth');
const duenosRoutes = require('./routes/duenos');
const mascotasRoutes = require('./routes/mascotas');
const citasRoutes = require('./routes/citas');
const imagenesRoutes = require('./routes/imagenes');
const vetRoutes = require('./routes/veterinarios');
const medRoutes = require('./routes/medicamentos');
const recRoutes = require('./routes/recetas');

// ===================================
// 7. RUTAS API
// ===================================
app.use('/api/auth', authRoutes);
app.use('/api/duenos', duenosRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/veterinarios', vetRoutes);
app.use('/api/medicamentos', medRoutes);
app.use('/api/recetas', recRoutes);

// ===================================
// 8. RUTAS DEL FRONTEND
// ===================================
// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Ruta para páginas HTML
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', page));
    } else {
        next();
    }
});

// ===================================
// 9. MANEJO DE ERRORES
// ===================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ===================================
// 10. INICIAR SERVIDOR
// ===================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});