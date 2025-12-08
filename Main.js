// ===============================
// CREAR BADGES DE SERVICIO EN CARDS
// ===============================
function createServiceBadges() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const servicio = item.dataset.servicio;
        const wrapper = item.querySelector('.gallery-image-wrapper');
        
        if (wrapper && servicio) {
            const badge = document.createElement('span');
            badge.className = 'service-badge';
            badge.dataset.servicio = servicio;
            badge.textContent = servicio.charAt(0).toUpperCase() + servicio.slice(1);
            wrapper.appendChild(badge);
        }
    });
}

// ===============================
// MODAL PARA EXPANDIR IMAGEN
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Crear badges de servicio
    createServiceBadges();
    
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.querySelector('.modal-close');
    const galleryImageWrappers = document.querySelectorAll('.gallery-image-wrapper');

    console.log('Wrappers encontrados:', galleryImageWrappers.length);

    // Abrir modal al hacer clic en el wrapper (contenedor de imagen)
    galleryImageWrappers.forEach((wrapper, index) => {
        console.log('Agregando evento al wrapper', index);
        wrapper.style.cursor = 'pointer';
        wrapper.addEventListener('click', function(e) {
            e.stopPropagation();
            const img = this.querySelector('.gallery-image');
            console.log('Click en wrapper, imagen:', img.src);
            modalImage.src = img.src;
            imageModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Cerrar modal al hacer clic en el botón X
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Cerrar modal al hacer clic fuera de la imagen
    imageModal.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && imageModal.classList.contains('active')) {
            imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// ===============================
// MENÚ LATERAL MÓVIL (SIDEBAR)
// ===============================
const hamburger = document.querySelector('.hamburger');
const sidebarMenu = document.querySelector('.sidebar-menu');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Abrir/Cerrar sidebar
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebarMenu.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
});

// Cerrar sidebar al hacer clic en un link
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
});

// Cerrar sidebar al hacer clic en el overlay
sidebarOverlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
});

// ===============================
// EFECTO PARALLAX EN HERO
// ===============================
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    
    if (!heroBackground) return;
    
    // Aplicar efecto parallax al hacer scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        // Mover el fondo a velocidad más lenta que el scroll (0.5x)
        heroBackground.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
    });
}

// Inicializar parallax cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initParallax);

// ===============================
// SCROLL SUAVE A SECCIONES
// ===============================
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Si no existe la sección, hacer scroll arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===============================
// SISTEMA DE FILTROS DE GALERÍA - SECCIÓN CORTES
// ===============================
class GalleryFilter {
    constructor() {
        // Elementos del DOM
        this.filterServicioGroup = document.getElementById('filter-servicio-group');
        this.filterBarberoGroup = document.getElementById('filter-barbero-group');
        this.expandBtn = document.getElementById('expand-btn');
        
        // Validar que los elementos existan
        if (!this.filterServicioGroup || !this.filterBarberoGroup || !this.expandBtn) {
            console.warn('Algunos elementos del filtro de galería no se encontraron');
            return;
        }

        // Caché de elementos
        this.allItems = document.querySelectorAll('.gallery-item');
        this.hiddenItems = document.querySelectorAll('.gallery-item.gallery-hidden');
        
        // Obtener todos los botones de filtro
        this.servicioButtons = this.filterServicioGroup.querySelectorAll('.filter-btn');
        this.barberoButtons = this.filterBarberoGroup.querySelectorAll('.filter-btn');
        
        // Estado
        this.state = {
            isExpanded: false,
            currentFilters: {
                servicio: 'todo',
                barbero: 'todos'
            }
        };

        this.init();
    }

    init() {
        // Event listeners para los botones de servicio
        this.servicioButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveButton(btn, this.servicioButtons);
                this.handleFilterChange('servicio', btn.dataset.value);
            });
        });

        // Event listeners para los botones de barbero
        this.barberoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveButton(btn, this.barberoButtons);
                this.handleFilterChange('barbero', btn.dataset.value);
            });
        });
        
        // Event listener para el botón expandir/contraer
        this.expandBtn.addEventListener('click', () => this.toggleExpand());
    }

    /**
     * Establece un botón como activo
     */
    setActiveButton(activeBtn, buttonGroup) {
        buttonGroup.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    /**
     * Maneja los cambios en los filtros
     */
    handleFilterChange(filterType, value) {
        // Actualizar el estado
        if (filterType === 'servicio') {
            this.state.currentFilters.servicio = value;
        } else if (filterType === 'barbero') {
            this.state.currentFilters.barbero = value;
        }

        // Aplicar filtros
        this.applyFilters();
        
        // Resetear expansión cuando cambian los filtros
        this.state.isExpanded = false;
        this.updateExpandButton();
        this.hideAllHiddenItems();
        
        // Si se selecciona un barbero específico, expandir automáticamente
        if (this.state.currentFilters.barbero !== 'todos') {
            this.state.isExpanded = true;
            this.showHiddenItemsForBarbero(this.state.currentFilters.barbero);
            this.updateExpandButton();
        }
    }

    /**
     * Aplica los filtros actuales a los items visibles
     */
    applyFilters() {
        const { servicio, barbero } = this.state.currentFilters;

        this.allItems.forEach(item => {
            const itemServicio = item.dataset.servicio;
            const itemBarbero = item.dataset.barbero;

            // Verificar coincidencia de filtros
            const servicioMatch = servicio === 'todo' || itemServicio === servicio;
            const barberoMatch = barbero === 'todos' || itemBarbero === barbero;

            // Aplicar o remover clase 'hidden'
            if (servicioMatch && barberoMatch) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    /**
     * Muestra los items ocultos para un barbero específico
     */
    showHiddenItemsForBarbero(barberName) {
        const { servicio } = this.state.currentFilters;
        
        this.hiddenItems.forEach(item => {
            const itemBarbero = item.dataset.barbero;
            const itemServicio = item.dataset.servicio;
            
            // Solo mostrar si coincide con el barbero Y con el servicio
            const barberoMatch = itemBarbero === barberName;
            const servicioMatch = servicio === 'todo' || itemServicio === servicio;
            
            if (barberoMatch && servicioMatch) {
                item.classList.add('show');
            }
        });
    }

    /**
     * Oculta todos los items marcados como hidden
     */
    hideAllHiddenItems() {
        this.hiddenItems.forEach(item => {
            item.classList.remove('show');
        });
    }

    /**
     * Alterna entre expandido y contraído
     */
    toggleExpand() {
        this.state.isExpanded = !this.state.isExpanded;
        
        if (this.state.isExpanded) {
            // Mostrar items ocultos según los filtros actuales
            const { barbero, servicio } = this.state.currentFilters;
            
            if (barbero === 'todos') {
                // Mostrar todos los ocultos que coincidan con el servicio
                this.hiddenItems.forEach(item => {
                    const itemServicio = item.dataset.servicio;
                    const servicioMatch = servicio === 'todo' || itemServicio === servicio;
                    
                    if (servicioMatch) {
                        item.classList.add('show');
                    }
                });
            } else {
                // Mostrar solo los del barbero seleccionado que coincidan con el servicio
                this.showHiddenItemsForBarbero(barbero);
            }
        } else {
            // Contraer todos los ocultos
            this.hideAllHiddenItems();
        }

        this.updateExpandButton();
    }

    /**
     * Actualiza el texto del botón expandir/contraer
     */
    updateExpandButton() {
        this.expandBtn.textContent = this.state.isExpanded ? 'Contraer' : 'Ver más';
    }
}

// Inicializar el sistema de filtros cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new GalleryFilter();
});

// Reproducir/pausar video de 'Sobre Nosotros' al entrar/salir de la sección
document.addEventListener('DOMContentLoaded', function() {
    const nosotrosSection = document.getElementById('nosotros');
    const nosotrosVideo = document.querySelector('.nosotros-video');

    if (!nosotrosVideo || !nosotrosSection) return;

    // Asegurar que esté silenciado para permitir autoplay
    nosotrosVideo.muted = true;

    // Intento de reproducir al cargar la página
    nosotrosVideo.play().catch(() => {
        // Silenciar rechazo silencioso si el navegador lo bloquea
    });

    // Usar IntersectionObserver para reproducir cuando la sección esté visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
                // Reproducir si al menos 40% visible
                nosotrosVideo.play().catch(() => {});
            } else {
                // Pausar cuando no esté visible
                nosotrosVideo.pause();
            }
        });
    }, { threshold: [0, 0.4, 0.6, 1] });

    observer.observe(nosotrosSection);
});

// ===============================
// BOTÓN FLOTANTE VOLVER ARRIBA
// ===============================
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

// Mostrar/Ocultar botón al hacer scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

// Scroll suave al hacer clic
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

/* ===============================
   LÓGICA MODAL RESERVAS + WHATSAPP
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
    const reservarModal = document.getElementById('reservar-modal');
    const reservarForm = document.getElementById('reservar-form');
    const abrirBtns = document.querySelectorAll('.open-reservar');
    if (!reservarModal || !reservarForm) return;

    const closeBtn = reservarModal.querySelector('.reservar-close');
    const cancelBtn = reservarModal.querySelector('.reservar-cancel');
    const selectBarbero = document.getElementById('res-barbero');

    // Poblar lista de barberos desde la DOM (si existen), si no usar fallback
    const barberoEls = document.querySelectorAll('.barbero-name');
    const nombres = Array.from(new Set(Array.from(barberoEls).map(el => el.textContent.trim()).filter(Boolean)));
    if (nombres.length === 0) {
        ['Diego','Martin','Leo'].forEach(n => nombres.push(n));
    }
    nombres.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        selectBarbero.appendChild(opt);
    });

    const barberPhones = {
        'Diego': '5491141948773', // Argentina: +54 9 1141948773
        'Martin': '56900000001',
        'Leo': '56900000002'
    };

    function openModal(preselectBarber) {
        if (preselectBarber) {
            // si el valor existe en el select, seleccionarlo
            const exists = Array.from(selectBarbero.options).some(o => o.value === preselectBarber);
            if (exists) selectBarbero.value = preselectBarber;
        }
        // Abrir overlay y aplicar clase 'active' que dispara la animación de entrada
        reservarModal.classList.add('active');
        reservarModal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        const content = reservarModal.querySelector('.reservar-modal-content');
        if (content) {
            content.classList.remove('closing');
            // dejar que CSS con .active dispare la animación modalIn
        }
        const nombreInput = document.getElementById('res-nombre');
        if (nombreInput) nombreInput.focus();
    }

    function closeModal() {
        const content = reservarModal.querySelector('.reservar-modal-content');
        if (content) {
            // iniciar animación de salida y esperar a su fin antes de ocultar
            content.classList.add('closing');
            content.addEventListener('animationend', function handler() {
                reservarModal.classList.remove('active');
                reservarModal.setAttribute('aria-hidden','true');
                content.classList.remove('closing');
                document.body.style.overflow = 'auto';
                reservarForm.reset();
                content.removeEventListener('animationend', handler);
            }, { once: true });
        } else {
            // fallback inmediato
            reservarModal.classList.remove('active');
            reservarModal.setAttribute('aria-hidden','true');
            document.body.style.overflow = 'auto';
            reservarForm.reset();
        }
    }

    abrirBtns.forEach(btn => {
        btn.addEventListener('click', function(e){
            e.preventDefault();
            const b = this.dataset.barbero;
            openModal(b);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Cerrar al click en overlay
    reservarModal.addEventListener('click', function(e){
        if (e.target === this) closeModal();
    });

    // Escape para cerrar
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && reservarModal.classList.contains('active')) closeModal();
    });

    // Envío: abrir WhatsApp con mensaje y número del barbero si existe
    reservarForm.addEventListener('submit', function(e){
        e.preventDefault();
        const nombre = document.getElementById('res-nombre').value.trim();
        const telefono = document.getElementById('res-telefono').value.trim();
        const barbero = selectBarbero.value;
        const fecha = document.getElementById('res-fecha').value;
        const hora = document.getElementById('res-hora').value;

        if (!nombre || !telefono || !barbero || !fecha || !hora) {
            alert('Por favor completa todos los campos.');
            return;
        }

        const msg = `Hola ${barbero}, quiero reservar un turno.\nNombre: ${nombre}\nTeléfono: ${telefono}\nFecha: ${fecha}\nHora: ${hora}`;
        const encoded = encodeURIComponent(msg);

        const phone = barberPhones[barbero];
        let url;
        if (phone && /^\+?\d+$/.test(phone)) {
            // normalizar: quitar + si existe
            const normalized = phone.replace(/[^\d]/g, '');
            url = `https://wa.me/${normalized}?text=${encoded}`;
        } else {
            // si no hay número, abrir WhatsApp Web con texto para que el usuario lo envíe
            url = `https://wa.me/?text=${encoded}`;
        }

        window.open(url,'_blank');
        closeModal();
    });

});



