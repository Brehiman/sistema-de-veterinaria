-- BASE DE DATOS VETERINARIA

CREATE DATABASE IF NOT EXISTS veterinaria;
USE veterinaria;

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'recepcionista') DEFAULT 'recepcionista',
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de dueños
CREATE TABLE duenos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de mascotas
CREATE TABLE mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad VARCHAR(50),
    color VARCHAR(50),
    peso DECIMAL(5,2),
    dueno_id INT NOT NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dueno_id) REFERENCES duenos(id) ON DELETE RESTRICT
);

-- Tabla de citas
CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    mascota_id INT NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    estado ENUM('Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE RESTRICT
);

-- Insertar usuarios de prueba (contraseña: admin123 y recepcion123)
-- Las contraseñas se generarán con bcrypt desde el backend
INSERT INTO usuarios (username, password, nombre, rol) VALUES 
('admin', '$2b$10$rQp4YVqLq8Wq9XqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZq', 'Administrador', 'admin'),
('recepcion', '$2b$10$rQp4YVqLq8Wq9XqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZq', 'Recepcionista', 'recepcionista');

USE veterinaria;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM usuarios;
INSERT INTO usuarios (username, password, nombre, rol) 
VALUES ('admin', '$2b$10$gdVrSMHOE9A5Bbi7/i0Hd.h4T2g/ywygRcfArpmYN6UBm0MLtMCMq', 'Administrador', 'admin');
SET SQL_SAFE_UPDATES = 1;

USE veterinaria;

-- Tabla de veterinarios
CREATE TABLE veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de medicamentos
CREATE TABLE medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    presentacion VARCHAR(100),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recetas
CREATE TABLE recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    diagnostico TEXT,
    indicaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cita_id) REFERENCES citas(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
);

-- Tabla detalle receta (medicamentos por receta)
CREATE TABLE receta_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receta_id INT NOT NULL,
    medicamento_id INT NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    FOREIGN KEY (receta_id) REFERENCES recetas(id),
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id)
);

-- Datos de prueba
INSERT INTO veterinarios (nombre, especialidad, telefono, email) VALUES
('Dr. Juan Pérez', 'Medicina General', '3001112233', 'juan@vetcare.com'),
('Dra. María López', 'Dermatología', '3004445566', 'maria@vetcare.com'),
('Dr. Carlos Ruiz', 'Cirugía', '3007778899', 'carlos@vetcare.com'),
('Dra. Ana Torres', 'Cardiología', '3000001122', 'ana@vetcare.com');

INSERT INTO medicamentos (nombre, descripcion, presentacion, stock) VALUES
('Dexametasona', 'Antiinflamatorio esteroideo', 'Inyectable 4mg/ml', 50),
('Amoxicilina', 'Antibiótico de amplio espectro', 'Tabletas 250mg', 100),
('Meloxicam', 'Antiinflamatorio no esteroideo', 'Suspensión oral', 30),
('Ivermectina', 'Antiparasitario', 'Inyectable 1%', 80),
('Omeprazol', 'Protector gástrico', 'Cápsulas 20mg', 60),
('Prednisolona', 'Corticosteroide', 'Tabletas 5mg', 40);

ALTER TABLE citas ADD COLUMN veterinario_id INT NULL AFTER mascota_id;
ALTER TABLE citas ADD FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id);
