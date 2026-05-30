// Gestión del panel de control

class Panel {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            const [duenos, mascotas, citasHoy, proximasCitas] = await Promise.all([
                API.get('/duenos'),
                API.get('/mascotas'),
                API.get('/citas/today'),
                API.get('/citas/upcoming')
            ]);

            document.getElementById('totalDuenos').textContent = duenos.length;
            document.getElementById('totalMascotas').textContent = mascotas.length;
            document.getElementById('citasHoy').textContent = citasHoy.length;
            document.getElementById('proximasCitas').textContent = proximasCitas.length;

            this.loadRecentDuenos(duenos.slice(-5).reverse());
            this.loadUpcomingCitas(proximasCitas.slice(0, 5));
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        }
    }

    loadRecentDuenos(duenos) {
        const tbody = document.getElementById('recentDuenos');
        tbody.innerHTML = duenos.map(dueno => `
            <tr>
                <td>${dueno.nombre}</td>
                <td>${dueno.telefono}</td>
                <td>${new Date(dueno.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    loadUpcomingCitas(citas) {
        const tbody = document.getElementById('recentCitas');
        tbody.innerHTML = citas.map(cita => `
            <tr>
                <td>${cita.mascota_nombre}</td>
                <td>${cita.dueno_nombre}</td>
                <td>${new Date(cita.fecha).toLocaleDateString()}</td>
                <td>${cita.hora}</td>
            </tr>
        `).join('');
    }
}

if (document.querySelector('.dashboard')) {
    new Panel();
}