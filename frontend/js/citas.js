class CitasManager {
    constructor() {
        this.citas = [];
        this.currentId = null;
        this.init();
    }

    async init() {
        this.setDefaultDate();
        await this.cargarMascotasSelect();
        await this.cargarVeterinariosSelect();
        await this.cargarCitas();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const filterFecha = document.getElementById('filterFecha');
        if (filterFecha) filterFecha.value = today;
    }

    async cargarMascotasSelect() {
        try {
            const mascotas = await API.get('/mascotas');
            const select = document.getElementById('citaMascota');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar mascota</option>' +
                    mascotas.map(m => `<option value="${m.id}" data-dueno="${m.dueno_nombre}">${m.nombre} (${m.especie}) - ${m.dueno_nombre}</option>`).join('');
                
                select.addEventListener('change', function() {
                    const option = this.options[this.selectedIndex];
                    const dueno = option.getAttribute('data-dueno') || '';
                    document.getElementById('citaDueño').value = dueno;
                });
            }
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
        }
    }

    async cargarVeterinariosSelect() {
        try {
            const veterinarios = await API.get('/veterinarios');
            const select = document.getElementById('citaVeterinario');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar veterinario</option>' +
                    veterinarios.map(v => `<option value="${v.id}">${v.nombre} - ${v.especialidad}</option>`).join('');
            }
        } catch (error) {
            console.error('Error al cargar veterinarios:', error);
        }
    }

    async cargarCitas() {
        try {
            this.citas = await API.get('/citas');
            this.renderizarTabla();
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    }

    renderizarTabla(citasFiltradas = null) {
        const tbody = document.getElementById('citasTableBody');
        const noResults = document.getElementById('noResultsCitas');
        const citas = citasFiltradas || this.citas;

        if (!tbody) return;

        if (citas.length === 0) {
            tbody.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        tbody.innerHTML = citas.map(c => {
            const estadoClass = this.getEstadoClass(c.estado);
            return `
                <tr>
                    <td>${new Date(c.fecha).toLocaleDateString()}</td>
                    <td>${c.hora.substring(0, 5)}</td>
                    <td>${c.mascota_nombre}</td>
                    <td>${c.dueno_nombre}</td>
                    <td>${c.veterinario_nombre || 'Sin asignar'}</td>
                    <td>${c.motivo}</td>
                    <td><span class="estado-badge ${estadoClass}">${c.estado}</span></td>
                    <td class="actions">
                        <button class="btn-action btn-info" data-id="${c.id}" title="Ver">👁️</button>
                        <button class="btn-action btn-edit" data-id="${c.id}" title="Editar">✏️</button>
                        <button class="btn-action btn-delete" data-id="${c.id}" title="Eliminar">🗑️</button>
                        <button class="btn-action btn-receta" data-id="${c.id}" title="Receta">💊</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-info').forEach(btn => {
            btn.addEventListener('click', function() {
                verInfoCita(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                editarCita(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                confirmarEliminarCita(parseInt(this.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-receta').forEach(btn => {
            btn.addEventListener('click', function() {
                verCita(parseInt(this.getAttribute('data-id')));
            });
        });
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

    async guardarCita(datos) {
        try {
            const id = document.getElementById('citaId').value;
            if (id) {
                await API.put(`/citas/${id}`, datos);
            } else {
                await API.post('/citas', datos);
            }
            this.currentId = null;
            await this.cargarCitas();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    async eliminarCita(id) {
        try {
            await API.delete(`/citas/${id}`);
            await this.cargarCitas();
        } catch (error) {
            alert(error.message);
        }
    }

    async filtrarPorFecha(fecha) {
        try {
            const citas = await API.get(`/citas?fecha=${fecha}`);
            this.renderizarTabla(citas);
        } catch (error) {
            console.error('Error al filtrar:', error);
        }
    }

    async mostrarCitasHoy() {
        try {
            const citas = await API.get('/citas/today');
            this.renderizarTabla(citas);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async mostrarProximasCitas() {
        try {
            const citas = await API.get('/citas/upcoming');
            this.renderizarTabla(citas);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async mostrarTodasCitas() {
        await this.cargarCitas();
    }
}

const citasManager = new CitasManager();

function abrirModalNuevaCita() {
    document.getElementById('citaModalTitle').textContent = 'Agendar Nueva Cita';
    document.getElementById('citaForm').reset();
    document.getElementById('citaId').value = '';
    document.getElementById('citaEstado').value = 'Pendiente';
    document.getElementById('citaDueño').value = '';
    citasManager.cargarMascotasSelect();
    citasManager.cargarVeterinariosSelect();
    openModal('citaModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

async function guardarCita(event) {
    event.preventDefault();
    const datos = {
        fecha: document.getElementById('citaFecha').value,
        hora: document.getElementById('citaHora').value,
        mascota_id: parseInt(document.getElementById('citaMascota').value),
        veterinario_id: parseInt(document.getElementById('citaVeterinario').value) || null,
        motivo: document.getElementById('citaMotivo').value,
        estado: document.getElementById('citaEstado').value || 'Pendiente',
        notas: document.getElementById('citaNotas').value.trim()
    };
    if (!datos.fecha || !datos.hora || !datos.mascota_id || !datos.motivo) {
        alert('Complete los campos obligatorios');
        return;
    }
    const exito = await citasManager.guardarCita(datos);
    if (exito) closeModal('citaModal');
}

function verInfoCita(id) {
    const c = citasManager.citas.find(c => c.id === id);
    if (!c) return;
    
    const info = `
        📋 DATOS DE LA CITA
        ━━━━━━━━━━━━━━━━━━━
        📅 Fecha: ${new Date(c.fecha).toLocaleDateString()}
        ⏰ Hora: ${c.hora.substring(0, 5)}
        🐾 Mascota: ${c.mascota_nombre}
        👤 Dueño: ${c.dueno_nombre}
        🩺 Veterinario: ${c.veterinario_nombre || 'Sin asignar'}
        🏥 Motivo: ${c.motivo}
        📊 Estado: ${c.estado}
        📝 Notas: ${c.notas || 'Sin notas'}
    `;
    
    const modalHTML = `
        <div id="viewModal" class="modal" style="display:block">
            <div class="modal-content" style="max-width:500px">
                <div class="modal-header">
                    <h2>Información de la Cita</h2>
                    <button class="modal-close" onclick="document.getElementById('viewModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <pre style="font-family:'Poppins',sans-serif;font-size:15px;line-height:2;white-space:pre-wrap">${info}</pre>
                    <h3>📸 Evidencias</h3>
                    <div id="imagenesContainer${c.id}" style="margin:10px 0">
                        <small>Cargando imágenes...</small>
                    </div>
                    <input type="file" accept="image/*" onchange="subirImagen(this, 'cita', ${c.id})" style="margin-top:10px">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('viewModal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    cargarImagenes('cita', c.id);
}

async function verCita(id) {
    try {
        const receta = await API.get(`/recetas/cita/${id}`);
        if (!receta || receta.error) {
            abrirFormularioReceta(id);
            return;
        }
        window.open(`http://localhost:3000/api/recetas/imprimir/${id}`, '_blank');
    } catch (error) {
        abrirFormularioReceta(id);
    }
}

async function abrirFormularioReceta(citaId) {
    const veterinarios = await API.get('/veterinarios');
    const medicamentos = await API.get('/medicamentos');
    
    let html = `
    <div id="recetaModal" class="modal" style="display:block">
        <div class="modal-content" style="max-width:700px">
            <div class="modal-header">
                <h2>Crear Receta Médica</h2>
                <button class="modal-close" onclick="document.getElementById('recetaModal').remove()">×</button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="recetaCitaId" value="${citaId}">
                <div class="form-group">
                    <label>Veterinario</label>
                    <select id="recetaVeterinario">
                        ${veterinarios.map(v => `<option value="${v.id}">${v.nombre} - ${v.especialidad}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Diagnóstico</label>
                    <textarea id="recetaDiagnostico" rows="2"></textarea>
                </div>
                <h3>Medicamentos</h3>
                <div id="medsContainer"></div>
                <button type="button" class="btn-secondary" onclick="agregarMedicamento()">+ Agregar</button>
                <div class="form-group" style="margin-top:15px">
                    <label>Indicaciones generales</label>
                    <textarea id="recetaIndicaciones" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('recetaModal').remove()">Cancelar</button>
                <button class="btn-primary" onclick="guardarReceta()">Guardar Receta</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    window.medsDisponibles = medicamentos;
    agregarMedicamento();
}

function agregarMedicamento() {
    const container = document.getElementById('medsContainer');
    const row = document.createElement('div');
    row.className = 'med-row';
    row.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;align-items:center;flex-wrap:wrap';
    row.innerHTML = `
        <select style="flex:2;min-width:150px" class="med-select">
            ${window.medsDisponibles.map(m => `<option value="${m.id}">${m.nombre} (${m.presentacion})</option>`).join('')}
        </select>
        <input type="text" placeholder="Dosis" style="flex:1;min-width:80px" class="med-dosis">
        <input type="text" placeholder="Frecuencia" style="flex:1;min-width:90px" class="med-frecuencia">
        <input type="text" placeholder="Duración" style="flex:1;min-width:90px" class="med-duracion">
        <button type="button" class="btn-action btn-delete" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

async function guardarReceta() {
    const cita_id = document.getElementById('recetaCitaId').value;
    const veterinario_id = document.getElementById('recetaVeterinario').value;
    const diagnostico = document.getElementById('recetaDiagnostico').value;
    const indicaciones = document.getElementById('recetaIndicaciones').value;
    
    const medicamentos = [];
    document.querySelectorAll('.med-row').forEach(row => {
        medicamentos.push({
            id: parseInt(row.querySelector('.med-select').value),
            dosis: row.querySelector('.med-dosis').value,
            frecuencia: row.querySelector('.med-frecuencia').value,
            duracion: row.querySelector('.med-duracion').value
        });
    });
    
    try {
        await API.post('/recetas', { cita_id, veterinario_id, diagnostico, indicaciones, medicamentos });
        document.getElementById('recetaModal').remove();
        window.open(`http://localhost:3000/api/recetas/imprimir/${cita_id}`, '_blank');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function editarCita(id) {
    const cita = citasManager.citas.find(c => c.id === id);
    if (!cita) {
        alert('Cita no encontrada');
        return;
    }
    Promise.all([citasManager.cargarMascotasSelect(), citasManager.cargarVeterinariosSelect()]).then(() => {
        document.getElementById('citaModalTitle').textContent = 'Editar Cita';
        document.getElementById('citaId').value = cita.id;
        document.getElementById('citaFecha').value = cita.fecha ? cita.fecha.split('T')[0] : '';
        document.getElementById('citaHora').value = cita.hora ? cita.hora.substring(0, 5) : '';
        document.getElementById('citaMascota').value = cita.mascota_id || '';
        document.getElementById('citaVeterinario').value = cita.veterinario_id || '';
        document.getElementById('citaMotivo').value = cita.motivo || '';
        document.getElementById('citaEstado').value = cita.estado || 'Pendiente';
        document.getElementById('citaNotas').value = cita.notas || '';
        
        const select = document.getElementById('citaMascota');
        const option = select.options[select.selectedIndex];
        document.getElementById('citaDueño').value = option ? option.getAttribute('data-dueno') || '' : '';
        
        openModal('citaModal');
    });
}

function confirmarEliminarCita(id) {
    document.getElementById('confirmDeleteBtn').onclick = async function() {
        await citasManager.eliminarCita(id);
        closeModal('confirmModal');
    };
    openModal('confirmModal');
}

function filtrarCitas() {
    const fecha = document.getElementById('filterFecha').value;
    if (fecha) citasManager.filtrarPorFecha(fecha);
}

function mostrarTodasCitas() { citasManager.mostrarTodasCitas(); }
function mostrarCitasHoy() { citasManager.mostrarCitasHoy(); }
function mostrarProximasCitas() { citasManager.mostrarProximasCitas(); }

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