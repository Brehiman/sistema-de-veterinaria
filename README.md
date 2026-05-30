## README.md

```markdown
# 🐾 VetCare - Sistema de Gestión Veterinaria

![VetCare](frontend/img/logo.png)

Sistema integral para la administración de clínicas veterinarias. Desarrollado como proyecto académico del curso **Programación y Servicios Web**.

---

## 👥 Equipo de Desarrollo

| Nombre | Rol | Módulo |
|--------|-----|--------|
| **Brehiman** | Líder / Full Stack | Arquitectura, Autenticación, Dashboard, Diseño CSS |
| **Juliana** | Desarrollador | Dueños |

---

## 🛠️ Tecnologías

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Diseño responsive con Flexbox y Grid
- Fetch API para consumo REST

### Backend
- **Node.js** + **Express.js**
- **MySQL** (Base de datos relacional)
- **bcrypt** (Hash de contraseñas)
- **express-session** (Sesiones seguras)
- **Multer** (Carga de imágenes)

### Seguridad
- **Helmet** (Cabeceras HTTP seguras)
- **CORS** (Protección cross-origin)
- **dotenv** (Variables de entorno)
- Contraseñas encriptadas (nunca en texto plano)

---

## 📁 Estructura del Proyecto

```
veterinaria/
│
├── backend/
│   ├── server.js                 # Servidor Express
│   ├── config/
│   │   └── db.js                 # Conexión a MySQL
│   ├── controllers/              # Lógica de negocio
│   │   ├── authController.js
│   │   ├── duenosController.js
│   │   ├── mascotasController.js
│   │   ├── citasController.js
│   │   ├── veterinariosController.js
│   │   ├── medicamentosController.js
│   │   ├── recetasController.js
│   │   └── imagenesController.js
│   ├── routes/                   # Rutas API REST
│   │   ├── auth.js
│   │   ├── duenos.js
│   │   ├── mascotas.js
│   │   ├── citas.js
│   │   ├── veterinarios.js
│   │   ├── medicamentos.js
│   │   ├── recetas.js
│   │   └── imagenes.js
│   ├── middleware/
│   │   └── auth.js               # Protección de rutas
│   ├── database/
│   │   └── schema.sql            # Estructura BD
│   └── .env                      # Variables de entorno
│
├── frontend/
│   ├── index.html
│   ├── login.html                # Login con carrusel
│   ├── panel.html                # Dashboard
│   ├── duenos.html               # Gestión de dueños
│   ├── mascotas.html             # Gestión de mascotas
│   ├── citas.html                # Gestión de citas
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js                # Cliente HTTP unificado
│   │   ├── auth.js               # Autenticación
│   │   ├── panel.js              # Dashboard
│   │   ├── duenos.js             # CRUD dueños
│   │   ├── mascotas.js           # CRUD mascotas + imágenes
│   │   └── citas.js              # CRUD citas + recetas + imágenes
│   ├── img/
│   │   └── logo.png
│   └── uploads/                  # Imágenes subidas
│
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Funcionalidades

### 🔐 Autenticación
- Inicio de sesión con validación
- Registro de usuarios (solo admin)
- Sesiones con cookies seguras
- Protección de rutas privadas
- Cierre de sesión

### 📊 Dashboard
- Total de dueños, mascotas y citas
- Citas del día y próximas
- Últimos registros

### 👤 Dueños
- CRUD completo
- Búsqueda por nombre o teléfono
- Visualización de detalle
- Conteo de mascotas asociadas

### 🐶 Mascotas
- CRUD completo
- Asociación con dueño existente
- Búsqueda por nombre, especie o dueño
- **Carga de imágenes** (fotos de la mascota)

### 📅 Citas
- CRUD completo
- Asignación de veterinario
- Filtros por fecha
- Estados visuales (Pendiente, Confirmada, etc.)
- **Carga de imágenes** (evidencias de consulta)

### 💊 Recetas Médicas
- Creación de recetas por cita
- Selección de medicamentos
- Diagnóstico e indicaciones
- **Impresión de receta** (HTML imprimible)

### 🩺 Veterinarios
- Registro de veterinarios
- Especialidades
- Asignación a citas

### 💉 Medicamentos
- Catálogo de medicamentos
- Presentación y stock

---

## ⚙️ Instalación

### Requisitos
- **Node.js** v18 o superior
- **MySQL** Server 8.0 o superior
- **MySQL Workbench** (recomendado)

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/Brehiman/sistema-de-veterinaria.git
cd veterinaria
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Crear carpeta uploads
```bash
mkdir frontend/uploads
```

### Paso 4: Configurar base de datos
1. Abrir **MySQL Workbench**
2. Ejecutar el archivo `backend/database/schema.sql`
3. Verificar que se crearon las tablas

### Paso 5: Configurar variables de entorno
Crear archivo `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=veterinaria
DB_PORT=3306
SESSION_SECRET=vetcare_secret_key_2024
PORT=3000
```

### Paso 6: Iniciar el servidor
```bash
npm run dev
```

### Paso 7: Acceder al sistema
```
http://localhost:3000/login.html
```

---

## 🔑 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador |
| `recepcion` | `recepcion123` | Recepcionista |

> **Nota:** Si los usuarios no funcionan, ejecuta en MySQL Workbench:
> ```sql
> SET SQL_SAFE_UPDATES = 0;
> DELETE FROM usuarios;
> INSERT INTO usuarios (username, password, nombre, rol) 
> VALUES ('admin', '$2b$10$hash_generado', 'Administrador', 'admin');
> ```
> Genera el hash con: `node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));"`

---

## 📡 APIs REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registro` | Registrar usuario |
| GET | `/api/auth/verificar` | Verificar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/duenos` | Listar dueños |
| POST | `/api/duenos` | Crear dueño |
| PUT | `/api/duenos/:id` | Editar dueño |
| DELETE | `/api/duenos/:id` | Eliminar dueño |
| GET | `/api/mascotas` | Listar mascotas |
| POST | `/api/mascotas` | Crear mascota |
| GET | `/api/citas` | Listar citas |
| GET | `/api/citas/today` | Citas de hoy |
| GET | `/api/citas/upcoming` | Próximas citas |
| POST | `/api/recetas` | Crear receta |
| GET | `/api/recetas/imprimir/:id` | Imprimir receta |
| POST | `/api/imagenes` | Subir imagen |

---

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| Verde principal | `#4CAF50` | Botones, elementos activos |
| Verde oscuro | `#2E7D32` | Encabezados, degradados |
| Blanco | `#FFFFFF` | Fondos, tarjetas |
| Gris | `#E5E7EB` | Bordes, placeholders |

---

## 📝 Licencia

Este proyecto fue desarrollado con fines académicos para el curso de **Programación y Servicios Web**.

---