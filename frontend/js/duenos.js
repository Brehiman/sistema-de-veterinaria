class DuenosManager {
    constructor() {
        this.duenos = [];
        this.currentId = null;
        this.init();
    }

    async init() {
        await this.cargarDuenos();
    }

    async cargarDuenos() {
        try {
            this.duenos = await API.get('/duenos');
            this.renderizarTabla();
        } catch (error) {
            console.error('Error al cargar dueños:', error);
        }
    }

    renderizarTabla(duenosFiltrados = null) {
        const tbody = document.getElementById('duenosTableBody');
        const noResults = document.getElementById('noResults');
        const duenos = duenosFiltrados || this.duenos;

        if (!tbody) return;

        if (duenos.length === 0) {
            tbody.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';
        
        tbody.innerHTML = duenos.map(dueno => `
            <tr>
                <td>${dueno.nombre}</td>
                <td>${dueno.telefono}</td>
                <td>${dueno.email || '-'}</td>
                <td>${dueno.direccion || '-'}</td>
                <td><span class="badge">${dueno.total_mascotas || 0}</span></td>
                <td>${new Date(dueno.created_at).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="btn-action btn-view" data-id="${dueno.id}" title="Ver">👁️</button>
                    <button class="btn-action btn-edit" data-id="${dueno.id}" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" data-id="${dueno.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Asignar eventos a los botones
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                verDueno(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editarDueno(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                eliminarDueno(id);
            });
        });
    }

    async guardarDueno(datos) {
        try {
            const id = document.getElementById('duenoId').value;
            if (id) {
                await API.put(`/duenos/${id}`, datos);
            } else {
                await API.post('/duenos', datos);
            }
            this.currentId = null;
            await this.cargarDuenos();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    async eliminarDueno(id) {
        if (!confirm('¿Está seguro de eliminar este dueño?')) return;
        try {
            await API.delete(`/duenos/${id}`);
            await this.cargarDuenos();
        } catch (error) {
            alert(error.message);
        }
    }

    async buscarDuenos(termino) {
        if (!termino) {
            await this.cargarDuenos();
            return;
        }
        try {
            const duenos = await API.get(`/duenos/search?q=${encodeURIComponent(termino)}`);
            this.renderizarTabla(duenos);
        } catch (error) {
            console.error('Error al buscar:', error);
        }
    }
}

const duenosManager = new DuenosManager();

// Funciones globales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function abrirModalNuevoDueno() {
    document.getElementById('modalTitle').textContent = 'Registrar Nuevo Dueño';
    document.getElementById('duenoForm').reset();
    document.getElementById('duenoId').value = '';
    openModal('duenoModal');
}

async function guardarDueno(event) {
    event.preventDefault();
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        notas: document.getElementById('notas').value.trim()
    };
    if (!datos.nombre || !datos.telefono) {
        alert('Complete los campos obligatorios');
        return;
    }
    const exito = await duenosManager.guardarDueno(datos);
    if (exito) closeModal('duenoModal');
}

function verDueno(id) {
    const dueno = duenosManager.duenos.find(d => d.id === id);
    if (!dueno) return;
    
    const info = `
        📋 DATOS DEL DUEÑO
        ━━━━━━━━━━━━━━━━━━━
        🧑 Nombre: ${dueno.nombre}
        📞 Teléfono: ${dueno.telefono}
        📧 Email: ${dueno.email || 'No registrado'}
        🏠 Dirección: ${dueno.direccion || 'No registrada'}
        🐾 Mascotas: ${dueno.total_mascotas || 0}
        📅 Registro: ${new Date(dueno.created_at).toLocaleDateString()}
        📝 Notas: ${dueno.notas || 'Sin notas'}
    `;
    
    // Crear modal de vista
    const modalHTML = `
        <div id="viewModal" class="modal" style="display:block">
            <div class="modal-content" style="max-width:450px">
                <div class="modal-header">
                    <h2>Información del Dueño</h2>
                    <button class="modal-close" onclick="document.getElementById('viewModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <pre style="font-family:'Poppins',sans-serif;font-size:15px;line-height:2;white-space:pre-wrap">${info}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('viewModal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function editarDueno(id) {
    console.log('ID recibido:', id, 'Tipo:', typeof id);
    console.log('Dueños disponibles:', duenosManager.duenos);
    
    const dueno = duenosManager.duenos.find(d => d.id === id);
    console.log('Dueño encontrado:', dueno);
    
    if (!dueno) {
        alert('Dueño no encontrado. ID: ' + id);
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Editar Dueño';
    document.getElementById('duenoId').value = dueno.id;
    document.getElementById('nombre').value = dueno.nombre || '';
    document.getElementById('telefono').value = dueno.telefono || '';
    document.getElementById('email').value = dueno.email || '';
    document.getElementById('direccion').value = dueno.direccion || '';
    document.getElementById('notas').value = dueno.notas || '';
    openModal('duenoModal');
}

async function eliminarDueno(id) {
    await duenosManager.eliminarDueno(id);
}

function filtrarDuenos() {
    const termino = document.getElementById('searchDueno').value;
    duenosManager.buscarDuenos(termino);
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}