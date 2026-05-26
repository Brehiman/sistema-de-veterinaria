// Gestión de Mascotas
class MascotasManager {
    constructor() {
        this.mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        this.currentId = null;
        this.init();
    }

    init() {
        this.cargarDuenosSelect();
        this.cargarMascotas();
    }

    cargarDuenosSelect() {
        const select = document.getElementById('duenoMascota');
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        
        select.innerHTML = '<option value="">Seleccionar dueño</option>' +
            duenos.map(dueno => `<option value="${dueno.id}">${dueno.nombre} - ${dueno.telefono}</option>`).join('');
    }

    cargarMascotas() {
        const tbody = document.getElementById('mascotasTableBody');
        const noResults = document.getElementById('noResultsMascotas');
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        
        if (this.mascotas.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        tbody.innerHTML = this.mascotas.map(mascota => {
            const dueno = duenos.find(d => d.id === mascota.duenoId);
            return `
                <tr>
                    <td>${mascota.nombre}</td>
                    <td>${mascota.especie}</td>
                    <td>${mascota.raza || '-'}</td>
                    <td>${mascota.edad || '-'}</td>
                    <td>${dueno ? dueno.nombre : 'Sin dueño'}</td>
                    <td>${dueno ? dueno.telefono : '-'}</td>
                    <td class="actions">
                        <button class="btn-action btn-edit" onclick="editarMascota('${mascota.id}')" title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarMascota('${mascota.id}')" title="Eliminar">
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

    guardarMascota(datos) {
        // Verificar que el dueño existe
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        const duenoExiste = duenos.find(d => d.id === datos.duenoId);
        
        if (!duenoExiste) {
            alert('El dueño seleccionado no existe');
            return;
        }

        if (this.currentId) {
            const index = this.mascotas.findIndex(m => m.id === this.currentId);
            if (index !== -1) {
                this.mascotas[index] = { ...this.mascotas[index], ...datos };
            }
        } else {
            const nuevaMascota = {
                id: Date.now().toString(),
                ...datos,
                fechaRegistro: new Date().toISOString()
            };
            this.mascotas.unshift(nuevaMascota);
        }

        localStorage.setItem('mascotas', JSON.stringify(this.mascotas));
        this.cargarMascotas();
        this.currentId = null;
    }

    eliminarMascota(id) {
        if (confirm('¿Está seguro de eliminar esta mascota?')) {
            this.mascotas = this.mascotas.filter(m => m.id !== id);
            localStorage.setItem('mascotas', JSON.stringify(this.mascotas));
            this.cargarMascotas();
        }
    }

    buscarMascotas(termino) {
        if (!termino) {
            this.cargarMascotas();
            return;
        }

        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        const filtradas = this.mascotas.filter(mascota => {
            const dueno = duenos.find(d => d.id === mascota.duenoId);
            const nombreDueno = dueno ? dueno.nombre : '';
            
            return mascota.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                   nombreDueno.toLowerCase().includes(termino.toLowerCase()) ||
                   mascota.especie.toLowerCase().includes(termino.toLowerCase());
        });

        const tbody = document.getElementById('mascotasTableBody');
        const noResults = document.getElementById('noResultsMascotas');

        if (filtradas.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
            tbody.innerHTML = filtradas.map(mascota => {
                const dueno = duenos.find(d => d.id === mascota.duenoId);
                return `
                    <tr>
                        <td>${mascota.nombre}</td>
                        <td>${mascota.especie}</td>
                        <td>${mascota.raza || '-'}</td>
                        <td>${mascota.edad || '-'}</td>
                        <td>${dueno ? dueno.nombre : 'Sin dueño'}</td>
                        <td>${dueno ? dueno.telefono : '-'}</td>
                        <td class="actions">
                            <button class="btn-action btn-edit" onclick="editarMascota('${mascota.id}')" title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-action btn-delete" onclick="eliminarMascota('${mascota.id}')" title="Eliminar">
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

const mascotasManager = new MascotasManager();

// Funciones globales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    if (modalId === 'mascotaModal') {
        document.getElementById('mascotaModalTitle').textContent = 'Registrar Nueva Mascota';
        document.getElementById('mascotaForm').reset();
        document.getElementById('mascotaId').value = '';
        mascotasManager.cargarDuenosSelect();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function guardarMascota(event) {
    event.preventDefault();
    
    const datos = {
        nombre: document.getElementById('nombreMascota').value.trim(),
        especie: document.getElementById('especie').value,
        raza: document.getElementById('raza').value.trim(),
        edad: document.getElementById('edad').value.trim(),
        color: document.getElementById('color').value.trim(),
        peso: document.getElementById('peso').value,
        duenoId: document.getElementById('duenoMascota').value,
        notas: document.getElementById('notasMascota').value.trim()
    };

    if (!datos.nombre || !datos.especie || !datos.duenoId) {
        alert('Por favor complete los campos obligatorios');
        return;
    }

    mascotasManager.guardarMascota(datos);
    closeModal('mascotaModal');
}

function editarMascota(id) {
    const mascota = mascotasManager.mascotas.find(m => m.id === id);
    if (!mascota) return;

    document.getElementById('mascotaModalTitle').textContent = 'Editar Mascota';
    document.getElementById('mascotaId').value = mascota.id;
    document.getElementById('nombreMascota').value = mascota.nombre || '';
    document.getElementById('especie').value = mascota.especie || '';
    document.getElementById('raza').value = mascota.raza || '';
    document.getElementById('edad').value = mascota.edad || '';
    document.getElementById('color').value = mascota.color || '';
    document.getElementById('peso').value = mascota.peso || '';
    document.getElementById('duenoMascota').value = mascota.duenoId || '';
    document.getElementById('notasMascota').value = mascota.notas || '';
    
    mascotasManager.currentId = id;
    mascotasManager.cargarDuenosSelect();
    openModal('mascotaModal');
}

function eliminarMascota(id) {
    mascotasManager.eliminarMascota(id);
}

function filtrarMascotas() {
    const termino = document.getElementById('searchMascota').value;
    mascotasManager.buscarMascotas(termino);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}