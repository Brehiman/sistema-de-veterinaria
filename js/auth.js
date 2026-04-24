// Sistema de autenticación
class Auth {
    constructor() {
        this.users = [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
            { username: 'recepcion', password: 'recepcion123', role: 'recepcionista', name: 'Recepcionista' }
        ];
        this.init();
    }

    init() {
        // Verificar si estamos en la página de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.setupLoginForm();
        }

        // Verificar sesión activa en páginas protegidas
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('index.html')) {
            this.checkSession();
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

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                this.showError('Por favor complete todos los campos');
                return;
            }

            const user = this.users.find(u => u.username === username && u.password === password);

            if (user) {
                this.setSession(user);
                window.location.href = 'panel.html';
            } else {
                this.showError('Usuario o contraseña incorrectos');
            }
        });
    }

    setSession(user) {
        const session = {
            username: user.username,
            name: user.name,
            role: user.role,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('vetcare_session', JSON.stringify(session));
    }

    getSession() {
        const session = localStorage.getItem('vetcare_session');
        return session ? JSON.parse(session) : null;
    }

    checkSession() {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // Verificar si la sesión ha expirado (24 horas)
        const now = new Date().getTime();
        const sessionTime = session.timestamp;
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            this.logout();
            return;
        }

        // Mostrar nombre de usuario en navbar
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = session.name;
        }
    }

    logout() {
        localStorage.removeItem('vetcare_session');
        window.location.href = 'login.html';
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            setTimeout(() => {
                errorElement.textContent = '';
            }, 3000);
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