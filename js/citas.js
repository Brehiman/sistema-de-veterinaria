// Gestión de Citas
class CitasManager {
    constructor() {
        this.citas = JSON.parse(localStorage.getItem('citas') || '[]');
        this.currentId = null;
        this.filterMode = 'all';
        this.init();
    }

    init() {
        this.setDefaultDate();
        this.cargarMascotasSelect();
        this.cargarCitas();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('filterFecha').value = today;
    }

    cargarMascotasSelect() {
        const select = document.getElementById('citaMascota');
        const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        
        select.innerHTML = '<option value="">Seleccionar mascota</option>' +
            mascotas.map(mascota => {
                const dueno = duenos.find(d => d.id === mascota.duenoId);
                return `<option value="${mascota.id}">${mascota.nombre} (${mascota.especie}) - Dueño: ${dueno ? dueno.nombre : 'Sin dueño'}</option>`;
            }).join('');
    }

    cargarCitas(citasFiltradas = null) {
        const tbody = document.getElementById('citasTableBody');
        const noResults = document.getElementById('noResultsCitas');
        const citas = citasFiltradas || this.citas;
        
        if (citas.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        tbody.innerHTML = citas.map(cita => {
            const estadoClass = this.getEstadoClass(cita.estado);
            return `
                <tr>
                    <td>${new Date(cita.fecha).toLocaleDateString()}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.mascotaNombre}</td>
                    <td>${cita.duenoNombre}</td>
                    <td>${cita.motivo}</td>
                    <td><span class="estado-badge ${estadoClass}">${cita.estado}</span></td>
                    <td class="actions">
                        <button class="btn-action btn-view" onclick="verDetalleCita('${cita.id}')" title="Ver detalle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="btn-action btn-edit" onclick="editarCita('${cita.id}')" title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="confirmarEliminarCita('${cita.id}')" title="Eliminar">
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

    getEstadoClass(estado) {
        const classes = {
            'Pendiente': 'estado-pendiente',
            'Confirmada': 'estado-confirmada',
            'En proceso': 'estado-proceso',
            'Completada': 'estado-completada',
            'Cancelada': 'estado-cancelada'
        };
        return classes[estado] || '';
    }

    guardarCita(datos) {
        // Obtener información de mascota y dueño
        const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        
        const mascota = mascotas.find(m => m.id === datos.mascotaId);
        const dueno = duenos.find(d => d.id === mascota.duenoId);

        const citaCompleta = {
            ...datos,
            mascotaNombre: mascota ? mascota.nombre : '',
            duenoNombre: dueno ? dueno.nombre : '',
            duenoId: dueno ? dueno.id : ''
        };

        if (this.currentId) {
            const index = this.citas.findIndex(c => c.id === this.currentId);
            if (index !== -1) {
                this.citas[index] = { ...this.citas[index], ...citaCompleta };
            }
        } else {
            const nuevaCita = {
                id: Date.now().toString(),
                ...citaCompleta,
                fechaCreacion: new Date().toISOString()
            };
            this.citas.unshift(nuevaCita);
        }

        // Ordenar citas por fecha y hora
        this.citas.sort((a, b) => {
            const fechaA = new Date(a.fecha + 'T' + a.hora);
            const fechaB = new Date(b.fecha + 'T' + b.hora);
            return fechaB - fechaA;
        });

        localStorage.setItem('citas', JSON.stringify(this.citas));
        this.cargarCitas();
        this.currentId = null;
    }

    eliminarCita(id) {
        this.citas = this.citas.filter(c => c.id !== id);
        localStorage.setItem('citas', JSON.stringify(this.citas));
        this.cargarCitas();
    }

    filtrarCitas() {
        const fechaSeleccionada = document.getElementById('filterFecha').value;
        if (!fechaSeleccionada) {
            this.cargarCitas();
            return;
        }

        const citasFiltradas = this.citas.filter(cita => cita.fecha === fechaSeleccionada);
        this.cargarCitas(citasFiltradas);
        this.filterMode = 'date';
    }

    mostrarCitasHoy() {
        const today = new Date().toISOString().split('T')[0];
        const citasHoy = this.citas.filter(cita => cita.fecha === today);
        this.cargarCitas(citasHoy);
        this.filterMode = 'today';
        this.updateFilterButtons('today');
    }

    mostrarProximasCitas() {
        const today = new Date().toISOString().split('T')[0];
        const proximasCitas = this.citas.filter(cita => cita.fecha >= today);
        this.cargarCitas(proximasCitas);
        this.filterMode = 'upcoming';
        this.updateFilterButtons('upcoming');
    }

    mostrarTodasCitas() {
        this.cargarCitas();
        this.filterMode = 'all';
        this.updateFilterButtons('all');
    }

    updateFilterButtons(active) {
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        const buttonMap = {
            'all': 0,
            'today': 1,
            'upcoming': 2
        };
        const buttons = document.querySelectorAll('.btn-filter');
        if (buttons[buttonMap[active]]) {
            buttons[buttonMap[active]].classList.add('active');
        }
    }
}

const citasManager = new CitasManager();

// Funciones globales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    if (modalId === 'citaModal') {
        document.getElementById('citaModalTitle').textContent = 'Agendar Nueva Cita';
        document.getElementById('citaForm').reset();
        document.getElementById('citaId').value = '';
        document.getElementById('citaEstado').value = 'Pendiente';
        citasManager.cargarMascotasSelect();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function cargarDuenoMascota() {
    const mascotaId = document.getElementById('citaMascota').value;
    const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
    const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
    
    const mascota = mascotas.find(m => m.id === mascotaId);
    if (mascota) {
        const dueno = duenos.find(d => d.id === mascota.duenoId);
        document.getElementById('citaDueño').value = dueno ? dueno.nombre : 'Dueño no encontrado';
    } else {
        document.getElementById('citaDueño').value = '';
    }
}

function guardarCita(event) {
    event.preventDefault();
    
    const datos = {
        fecha: document.getElementById('citaFecha').value,
        hora: document.getElementById('citaHora').value,
        mascotaId: document.getElementById('citaMascota').value,
        motivo: document.getElementById('citaMotivo').value,
        estado: document.getElementById('citaEstado').value || 'Pendiente',
        notas: document.getElementById('citaNotas').value.trim()
    };

    if (!datos.fecha || !datos.hora || !datos.mascotaId || !datos.motivo) {
        alert('Por favor complete los campos obligatorios');
        return;
    }

    citasManager.guardarCita(datos);
    closeModal('citaModal');
}

function editarCita(id) {
    const cita = citasManager.citas.find(c => c.id === id);
    if (!cita) return;

    document.getElementById('citaModalTitle').textContent = 'Editar Cita';
    document.getElementById('citaId').value = cita.id;
    document.getElementById('citaFecha').value = cita.fecha;
    document.getElementById('citaHora').value = cita.hora;
    document.getElementById('citaMascota').value = cita.mascotaId;
    document.getElementById('citaMotivo').value = cita.motivo;
    document.getElementById('citaEstado').value = cita.estado;
    document.getElementById('citaNotas').value = cita.notas || '';
    
    citasManager.currentId = id;
    cargarDuenoMascota();
    openModal('citaModal');
}

function confirmarEliminarCita(id) {
    document.getElementById('confirmDeleteBtn').onclick = function() {
        citasManager.eliminarCita(id);
        closeModal('confirmModal');
    };
    openModal('confirmModal');
}

function verDetalleCita(id) {
    const cita = citasManager.citas.find(c => c.id === id);
    if (!cita) return;

    alert(`
        Detalle de la Cita:
        
        Fecha: ${new Date(cita.fecha).toLocaleDateString()}
        Hora: ${cita.hora}
        Mascota: ${cita.mascotaNombre}
        Dueño: ${cita.duenoNombre}
        Motivo: ${cita.motivo}
        Estado: ${cita.estado}
        Notas: ${cita.notas || 'Sin notas'}
        Creada: ${new Date(cita.fechaCreacion).toLocaleString()}
    `);
}

function filtrarCitas() {
    citasManager.filtrarCitas();
}

function mostrarTodasCitas() {
    citasManager.mostrarTodasCitas();
}

function mostrarCitasHoy() {
    citasManager.mostrarCitasHoy();
}

function mostrarProximasCitas() {
    citasManager.mostrarProximasCitas();
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}