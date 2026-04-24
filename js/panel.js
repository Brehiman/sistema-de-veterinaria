// Gestión del panel de control
class Panel {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        // Simular carga de datos (reemplazar con datos reales de localStorage o API)
        const duenos = JSON.parse(localStorage.getItem('duenos') || '[]');
        const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');

        // Actualizar contadores
        document.getElementById('totalDuenos').textContent = duenos.length;
        document.getElementById('totalMascotas').textContent = mascotas.length;

        // Calcular citas de hoy
        const today = new Date().toISOString().split('T')[0];
        const citasHoy = citas.filter(cita => cita.fecha === today);
        document.getElementById('citasHoy').textContent = citasHoy.length;

        // Próximas citas
        const proximasCitas = citas.filter(cita => cita.fecha > today);
        document.getElementById('proximasCitas').textContent = proximasCitas.length;

        // Cargar últimos dueños registrados
        this.loadRecentDuenos(duenos.slice(-5).reverse());

        // Cargar próximas citas
        this.loadUpcomingCitas(proximasCitas.slice(0, 5));
    }

    loadRecentDuenos(duenos) {
        const tbody = document.getElementById('recentDuenos');
        tbody.innerHTML = duenos.map(dueno => `
            <tr>
                <td>${dueno.nombre}</td>
                <td>${dueno.telefono}</td>
                <td>${new Date(dueno.fechaRegistro).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    loadUpcomingCitas(citas) {
        const tbody = document.getElementById('recentCitas');
        tbody.innerHTML = citas.map(cita => `
            <tr>
                <td>${cita.mascota}</td>
                <td>${cita.dueno}</td>
                <td>${new Date(cita.fecha).toLocaleDateString()}</td>
                <td>${cita.hora}</td>
            </tr>
        `).join('');
    }
}

// Inicializar panel
if (document.querySelector('.dashboard')) {
    new Panel();
}