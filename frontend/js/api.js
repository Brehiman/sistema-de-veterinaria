// CLIENTE HTTP UNIFICADO PARA VETCARE

const API = {
    baseURL: 'http://localhost:3000/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Importante para cookies de sesión
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Si no está autenticado, redirigir al login
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error API:', error);
            throw error;
        }
    },

    // Métodos HTTP
    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    },
};