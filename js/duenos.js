// Gestión de Dueños
class DuenosManager {
    constructor() {
        this.duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        this.currentId = null;
        this.init();
    }

    init() {
        this.cargarDuenos();
    }

    cargarDuenos() {
        const tbody = document.getElementById('duenosTableBody');
        const noResults = document.getElementById('noResults');
        
        if (this.duenos.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        tbody.innerHTML = this.duenos.map(dueno => {
            const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
            const mascotasDueno = mascotas.filter(m => m.duenoId === dueno.id).length;
            
            return `
                <tr>
                    <td>${dueno.nombre}</td>
                    <td>${dueno.telefono}</td>
                    <td>${dueno.email || '-'}</td>
                    <td>${dueno.direccion || '-'}</td>
                    <td>
                        <span class="badge">${mascotasDueno}</span>
                    </td>
                    <td>${new Date(dueno.fechaRegistro).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="btn-action btn-edit" onclick="editarDueno('${dueno.id}')" title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarDueno('${dueno.id}')" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    guardarDueno(datos) {
        if (this.currentId) {
            // Editar existente
            const index = this.duenos.findIndex(d => d.id === this.currentId);
            if (index !== -1) {
                this.duenos[index] = { ...this.duenos[index], ...datos };
            }
        } else {
            // Nuevo dueño
            const nuevoDueno = {
                id: Date.now().toString(),
                ...datos,
                fechaRegistro: new Date().toISOString()
            };
            this.duenos.unshift(nuevoDueno);
        }

        localStorage.setItem('duenos', JSON.stringify(this.duenos));
        this.cargarDuenos();
        this.currentId = null;
    }

    eliminarDueno(id) {
        // Verificar si tiene mascotas asociadas
        const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        const mascotasAsociadas = mascotas.filter(m => m.duenoId === id);
        
        if (mascotasAsociadas.length > 0) {
            alert(`No se puede eliminar este dueño porque tiene ${mascotasAsociadas.length} mascota(s) asociada(s). Elimine primero las mascotas.`);
            return;
        }

        if (confirm('¿Está seguro de eliminar este dueño?')) {
            this.duenos = this.duenos.filter(d => d.id !== id);
            localStorage.setItem('duenos', JSON.stringify(this.duenos));
            this.cargarDuenos();
        }
    }

    buscarDuenos(termino) {
        if (!termino) {
            this.cargarDuenos();
            return;
        }

        const filtrados = this.duenos.filter(dueno => 
            dueno.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            dueno.telefono.includes(termino)
        );

        const tbody = document.getElementById('duenosTableBody');
        const noResults = document.getElementById('noResults');

        if (filtrados.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
            tbody.innerHTML = filtrados.map(dueno => {
                const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
                const mascotasDueno = mascotas.filter(m => m.duenoId === dueno.id).length;
                
                return `
                    <tr>
                        <td>${dueno.nombre}</td>
                        <td>${dueno.telefono}</td>
                        <td>${dueno.email || '-'}</td>
                        <td>${dueno.direccion || '-'}</td>
                        <td>
                            <span class="badge">${mascotasDueno}</span>
                        </td>
                        <td>${new Date(dueno.fechaRegistro).toLocaleDateString()}</td>
                        <td class="actions">
                            <button class="btn-action btn-edit" onclick="editarDueno('${dueno.id}')" title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-action btn-delete" onclick="eliminarDueno('${dueno.id}')" title="Eliminar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

const duenosManager = new DuenosManager();

// Funciones globales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    if (modalId === 'duenoModal') {
        document.getElementById('modalTitle').textContent = 'Registrar Nuevo Dueño';
        document.getElementById('duenoForm').reset();
        document.getElementById('duenoId').value = '';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function guardarDueno(event) {
    event.preventDefault();
    
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        notas: document.getElementById('notas').value.trim()
    };

    if (!datos.nombre || !datos.telefono) {
        alert('Por favor complete los campos obligatorios');
        return;
    }

    duenosManager.guardarDueno(datos);
    closeModal('duenoModal');
}

function editarDueno(id) {
    const dueno = duenosManager.duenos.find(d => d.id === id);
    if (!dueno) return;

    document.getElementById('modalTitle').textContent = 'Editar Dueño';
    document.getElementById('duenoId').value = dueno.id;
    document.getElementById('nombre').value = dueno.nombre;
    document.getElementById('telefono').value = dueno.telefono;
    document.getElementById('email').value = dueno.email || '';
    document.getElementById('direccion').value = dueno.direccion || '';
    document.getElementById('notas').value = dueno.notas || '';
    
    duenosManager.currentId = id;
    openModal('duenoModal');
}

function eliminarDueno(id) {
    duenosManager.eliminarDueno(id);
}

function filtrarDuenos() {
    const termino = document.getElementById('searchDueno').value;
    duenosManager.buscarDuenos(termino);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}