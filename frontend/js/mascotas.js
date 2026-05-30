class MascotasManager {
    constructor() {
        this.mascotas = [];
        this.currentId = null;
        this.init();
    }

    async init() {
        await this.cargarMascotas();
    }

    async cargarDuenosSelect() {
        try {
            const duenos = await API.get('/duenos');
            const select = document.getElementById('duenoMascota');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar dueño</option>' +
                    duenos.map(d => `<option value="${d.id}">${d.nombre} - ${d.telefono}</option>`).join('');
            }
        } catch (error) {
            console.error('Error al cargar dueños:', error);
        }
    }

    async cargarMascotas() {
        try {
            this.mascotas = await API.get('/mascotas');
            this.renderizarTabla();
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
        }
    }

    renderizarTabla(mascotasFiltradas = null) {
        const tbody = document.getElementById('mascotasTableBody');
        const noResults = document.getElementById('noResultsMascotas');
        const mascotas = mascotasFiltradas || this.mascotas;

        if (!tbody) return;

        if (mascotas.length === 0) {
            tbody.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        tbody.innerHTML = mascotas.map(m => `
            <tr>
                <td>${m.nombre}</td>
                <td>${m.especie}</td>
                <td>${m.raza || '-'}</td>
                <td>${m.edad || '-'}</td>
                <td>${m.dueno_nombre || '-'}</td>
                <td>${m.dueno_telefono || '-'}</td>
                <td class="actions">
                    <button class="btn-action btn-view" data-id="${m.id}" title="Ver">👁️</button>
                    <button class="btn-action btn-edit" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" data-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                verMascota(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                editarMascota(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                eliminarMascota(parseInt(this.getAttribute('data-id')));
            });
        });
    }

    async guardarMascota(datos) {
        try {
            const id = document.getElementById('mascotaId').value;
            if (id) {
                await API.put(`/mascotas/${id}`, datos);
            } else {
                await API.post('/mascotas', datos);
            }
            this.currentId = null;
            await this.cargarMascotas();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    async eliminarMascota(id) {
        if (!confirm('¿Está seguro de eliminar esta mascota?')) return;
        try {
            await API.delete(`/mascotas/${id}`);
            await this.cargarMascotas();
        } catch (error) {
            alert(error.message);
        }
    }

    async buscarMascotas(termino) {
        if (!termino) {
            await this.cargarMascotas();
            return;
        }
        try {
            const mascotas = await API.get(`/mascotas/search?q=${encodeURIComponent(termino)}`);
            this.renderizarTabla(mascotas);
        } catch (error) {
            console.error('Error al buscar:', error);
        }
    }
}

const mascotasManager = new MascotasManager();

// Funciones globales
function abrirModalNuevaMascota() {
    document.getElementById('mascotaModalTitle').textContent = 'Registrar Nueva Mascota';
    document.getElementById('mascotaForm').reset();
    document.getElementById('mascotaId').value = '';
    mascotasManager.cargarDuenosSelect();
    openModal('mascotaModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

async function guardarMascota(event) {
    event.preventDefault();
    const datos = {
        nombre: document.getElementById('nombreMascota').value.trim(),
        especie: document.getElementById('especie').value,
        raza: document.getElementById('raza').value.trim(),
        edad: document.getElementById('edad').value.trim(),
        color: document.getElementById('color').value.trim(),
        peso: document.getElementById('peso').value || null,
        dueno_id: parseInt(document.getElementById('duenoMascota').value),
        notas: document.getElementById('notasMascota').value.trim()
    };
    if (!datos.nombre || !datos.especie || !datos.dueno_id) {
        alert('Complete los campos obligatorios');
        return;
    }
    const exito = await mascotasManager.guardarMascota(datos);
    if (exito) closeModal('mascotaModal');
}

function verMascota(id) {
    const m = mascotasManager.mascotas.find(m => m.id === id);
    if (!m) return;
    
    const info = `
        📋 DATOS DE LA MASCOTA
        ━━━━━━━━━━━━━━━━━━━━━
        🐶 Nombre: ${m.nombre}
        🐕 Especie: ${m.especie}
        🧬 Raza: ${m.raza || 'No especificada'}
        🎂 Edad: ${m.edad || 'No especificada'}
        🎨 Color: ${m.color || 'No especificado'}
        ⚖️ Peso: ${m.peso ? m.peso + ' kg' : 'No especificado'}
        👤 Dueño: ${m.dueno_nombre || 'Sin dueño'}
        📞 Tel Dueño: ${m.dueno_telefono || '-'}
        📝 Notas: ${m.notas || 'Sin notas'}
    `;
    
    const modalHTML = `
        <div id="viewModal" class="modal" style="display:block">
            <div class="modal-content" style="max-width:500px">
                <div class="modal-header">
                    <h2>Información de la Mascota</h2>
                    <button class="modal-close" onclick="document.getElementById('viewModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <pre style="font-family:'Poppins',sans-serif;font-size:15px;line-height:2;white-space:pre-wrap">${info}</pre>
                    <h3>📸 Fotos</h3>
                    <div id="imagenesContainer${m.id}" style="margin:10px 0">
                        <small>Cargando imágenes...</small>
                    </div>
                    <input type="file" accept="image/*" onchange="subirImagen(this, 'mascota', ${m.id})" style="margin-top:10px">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('viewModal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    cargarImagenes('mascota', m.id);
}

function editarMascota(id) {
    const mascota = mascotasManager.mascotas.find(m => m.id === id);
    if (!mascota) {
        alert('Mascota no encontrada');
        return;
    }
    mascotasManager.cargarDuenosSelect().then(() => {
        document.getElementById('mascotaModalTitle').textContent = 'Editar Mascota';
        document.getElementById('mascotaId').value = mascota.id;
        document.getElementById('nombreMascota').value = mascota.nombre || '';
        document.getElementById('especie').value = mascota.especie || '';
        document.getElementById('raza').value = mascota.raza || '';
        document.getElementById('edad').value = mascota.edad || '';
        document.getElementById('color').value = mascota.color || '';
        document.getElementById('peso').value = mascota.peso || '';
        document.getElementById('duenoMascota').value = mascota.dueno_id || '';
        document.getElementById('notasMascota').value = mascota.notas || '';
        openModal('mascotaModal');
    });
}

async function eliminarMascota(id) {
    await mascotasManager.eliminarMascota(id);
}

function filtrarMascotas() {
    const termino = document.getElementById('searchMascota').value;
    mascotasManager.buscarMascotas(termino);
}

// Funciones de imágenes
async function subirImagen(input, tipo, entidadId) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('entidad_tipo', tipo);
    formData.append('entidad_id', entidadId);

    try {
        const response = await fetch('http://localhost:3000/api/imagenes', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const data = await response.json();
        if (data.ruta) {
            cargarImagenes(tipo, entidadId);
        }
    } catch (error) {
        alert('Error al subir imagen');
    }
}

async function cargarImagenes(tipo, entidadId) {
    try {
        const response = await fetch(`http://localhost:3000/api/imagenes/${tipo}/${entidadId}`, {
            credentials: 'include'
        });
        const imagenes = await response.json();
        const container = document.getElementById(`imagenesContainer${entidadId}`);
        if (container) {
            if (imagenes.length === 0) {
                container.innerHTML = '<small>Sin imágenes</small>';
                return;
            }
            container.innerHTML = imagenes.map(img => `
                <div style="display:inline-block;margin:5px;position:relative">
                    <img src="${img.ruta}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;cursor:pointer" 
                         onclick="window.open('${img.ruta}', '_blank')">
                    <button onclick="eliminarImagen(${img.id}, '${tipo}', ${entidadId})" 
                            style="position:absolute;top:-5px;right:-5px;background:red;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:12px">×</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar imágenes');
    }
}

async function eliminarImagen(id, tipo, entidadId) {
    if (!confirm('¿Eliminar imagen?')) return;
    try {
        await fetch(`http://localhost:3000/api/imagenes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        cargarImagenes(tipo, entidadId);
    } catch (error) {
        alert('Error al eliminar');
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}