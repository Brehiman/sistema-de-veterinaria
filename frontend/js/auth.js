// Sistema de autenticación

class Auth {
    constructor() {
        this.usuario = null;
        this.init();
    }

    async init() {
        // Verificar si estamos en la página de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.setupLoginForm();
            return;
        }

        // Verificar sesión activa en páginas protegidas
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('index.html')) {
            await this.checkSession();
        }

        // Configurar botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                this.showError('Por favor complete todos los campos');
                return;
            }

            try {
                const response = await API.post('/auth/login', { username, password });
                
                if (response.usuario) {
                    this.usuario = response.usuario;
                    // Mostrar nombre en navbar si existe
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = this.usuario.nombre;
                    }
                    window.location.href = '/panel.html';
                }
            } catch (error) {
                this.showError(error.message || 'Error al iniciar sesión');
            }
        });
    }

    async checkSession() {
        try {
            const response = await API.get('/auth/verificar');
            
            if (!response.autenticado) {
                window.location.href = '/login.html';
                return;
            }

            this.usuario = response.usuario;
            
            // Mostrar nombre de usuario en navbar
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.usuario.nombre;
            }
        } catch (error) {
            window.location.href = '/login.html';
        }
    }

    async logout() {
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
        this.usuario = null;
        window.location.href = '/login.html';
    }

    getUsuario() {
        return this.usuario;
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
}

// Inicializar sistema de autenticación
const auth = new Auth();

// Sistema de carrusel para login
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.currentSlide = 0;
        this.init();
    }

    init() {
        if (this.slides.length > 0 && this.dots.length > 0) {
            this.startAutoPlay();
            this.setupDots();
        }
    }

    showSlide(index) {
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
    }

    startAutoPlay() {
        setInterval(() => this.nextSlide(), 5000);
    }

    setupDots() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.showSlide(index));
        });
    }
}

// Inicializar carrusel si existe
if (document.querySelector('.carousel-slides')) {
    new Carousel();
}