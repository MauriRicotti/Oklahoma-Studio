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

            // Mapa de iconos Bootstrap por servicio
            const iconMap = {
                corte: 'bi-scissors',
                color: 'bi-droplet-half',
                tratamiento: 'bi-heart-pulse',
                barbero: 'bi-person-badge',
                default: 'bi-tag'
            };

            const iconEl = document.createElement('i');
            iconEl.classList.add('badge-icon', 'bi');
            const chosen = iconMap[servicio] || iconMap.default;
            iconEl.classList.add(chosen);
            iconEl.setAttribute('aria-hidden', 'true');

            const label = document.createElement('span');
            label.className = 'badge-label';
            label.textContent = servicio.charAt(0).toUpperCase() + servicio.slice(1);

            badge.appendChild(iconEl);
            badge.appendChild(label);
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
        
        // Asegurar atributos ARIA iniciales
        this.servicioButtons.forEach(btn => {
            if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        });
        this.barberoButtons.forEach(btn => {
            if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        });
        
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

            // Soporte teclado explícito: Enter / Space
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Event listeners para los botones de barbero
        this.barberoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveButton(btn, this.barberoButtons);
                this.handleFilterChange('barbero', btn.dataset.value);
            });

            // Soporte teclado explícito: Enter / Space
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
        
        // Event listener para el botón expandir/contraer
        this.expandBtn.addEventListener('click', () => this.toggleExpand());
    }

    /**
     * Establece un botón como activo
     */
    setActiveButton(activeBtn, buttonGroup) {
        buttonGroup.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
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

    const AUDIO_PREF_KEY = 'audioSobreNosotros';
    const audioToggleBtn = document.getElementById('nosotros-audio-toggle');

    // Flag para evitar reanudar automáticamente cuando el usuario pausó manualmente
    let userManuallyPaused = false;

    // Escuchar eventos de play/pause para detectar acciones del usuario (event.isTrusted)
    nosotrosVideo.addEventListener('pause', (e) => {
        if (e && e.isTrusted) userManuallyPaused = true;
    });
    nosotrosVideo.addEventListener('play', (e) => {
        if (e && e.isTrusted) userManuallyPaused = false;
    });

    // Aplicar estado inicial según preferencia guardada (por defecto: silenciado)
    const savedPref = localStorage.getItem(AUDIO_PREF_KEY);
    const audioEnabled = savedPref === 'true';

    // Mantener muted=true por defecto para permitir autoplay en la mayoría de navegadores
    nosotrosVideo.muted = !audioEnabled;

    // Intento de reproducir al cargar la página (si el navegador lo permite)
    nosotrosVideo.play().catch(() => {
        // Ignorar errores (navegador puede bloquear autoplay con audio)
    });

    // Refrescar el estado del botón (si existe)
    function updateAudioButton(enabled) {
        if (!audioToggleBtn) return;
        audioToggleBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        audioToggleBtn.title = enabled ? 'Desactivar audio' : 'Activar audio';
        audioToggleBtn.innerHTML = enabled ? '<i class="bi bi-volume-up" aria-hidden="true"></i><span class="visually-hidden">Desactivar audio</span>' : '<i class="bi bi-volume-mute" aria-hidden="true"></i><span class="visually-hidden">Activar audio</span>';
    }

    updateAudioButton(audioEnabled);

    // Toggle handler: al hacer clic, alternar y persistir preferencia
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const currentlyMuted = nosotrosVideo.muted;
            const willEnable = currentlyMuted; // si estaba silenciado, al hacer click activamos audio

            // Si activamos audio, debemos intentar reproducir desde un gesto de usuario
            if (willEnable) {
                nosotrosVideo.muted = false;
                nosotrosVideo.play().catch(() => {});
            } else {
                nosotrosVideo.muted = true;
            }

            localStorage.setItem(AUDIO_PREF_KEY, willEnable ? 'true' : 'false');
            updateAudioButton(willEnable);
        });

        // Soporte teclado (Enter / Space)
        audioToggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                audioToggleBtn.click();
            }
        });
    }

    /* --- Play / Pause button --- */
    const playToggleBtn = document.getElementById('nosotros-play-toggle');

    function updatePlayButton(isPlaying) {
        if (!playToggleBtn) return;
        playToggleBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        playToggleBtn.title = isPlaying ? 'Pausar video' : 'Reproducir video';
        playToggleBtn.innerHTML = isPlaying ? '<i class="bi bi-pause-fill" aria-hidden="true"></i><span class="visually-hidden">Pausar video</span>' : '<i class="bi bi-play-fill" aria-hidden="true"></i><span class="visually-hidden">Reproducir video</span>';
    }

    // Estado inicial del botón según si el video está en pausa
    updatePlayButton(!nosotrosVideo.paused);

    if (playToggleBtn) {
        playToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (nosotrosVideo.paused) {
                // reproducir
                nosotrosVideo.play().catch(() => {});
                updatePlayButton(true);
                // acción de usuario que reproduce -> no considerar como pausa manual
                userManuallyPaused = false;
            } else {
                // pausar
                nosotrosVideo.pause();
                updatePlayButton(false);
                // acción de usuario que pausa -> marcar para no reanudar automáticamente
                userManuallyPaused = true;
            }
        });

        playToggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playToggleBtn.click();
            }
        });
    }

    // Usar IntersectionObserver para reproducir/pausar cuando la sección esté visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
                // Reproducir si al menos 40% visible y el usuario no lo pausó manualmente
                if (!userManuallyPaused) {
                    nosotrosVideo.play().catch(() => {});
                }
            } else {
                // Pausar cuando no esté visible (programático => no marcar como pausa manual)
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

// Mostrar/Ocultar botón al hacer scroll y alternar sombra del navbar
window.addEventListener('scroll', () => {
    // Mostrar/ocultar botón "volver arriba" (si existe)
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }

    // Alternar la clase que quita la sombra en el navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 0) {
            navbar.classList.add('no-shadow');
        } else {
            navbar.classList.remove('no-shadow');
        }
    }
});

// Inicializar estado visual al cargar (ejecuta el handler de scroll una vez)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.dispatchEvent(new Event('scroll')));
} else {
    window.dispatchEvent(new Event('scroll'));
}

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

    // --- Validación y ajuste: forzar pasos de 30 minutos en el selector de hora ---
    const timeInput = document.getElementById('res-hora');
    if (timeInput) {
        // Refuerzo por JS por si algún navegador no respeta el atributo HTML
        timeInput.setAttribute('step', '1800');
        timeInput.setAttribute('title', 'Selecciona horario en pasos de 30 minutos (ej. 15:00 o 15:30)');

        // Helpers para mostrar mensajes inline en el modal
        let _resMessageTimeout = null;
        function showReservarMessage(msg, type = 'info', timeout = 4200) {
            const container = document.getElementById('res-message');
            if (!container) {
                // fallback a alert si no existe el container
                alert(msg);
                return;
            }
            container.textContent = msg;
            container.classList.remove('reservar-alert--error');
            if (type === 'error') container.classList.add('reservar-alert--error');
            container.style.display = 'block';
            container.classList.add('show');
            container.classList.remove('hide');
            if (_resMessageTimeout) clearTimeout(_resMessageTimeout);
            _resMessageTimeout = setTimeout(() => {
                container.classList.add('hide');
                setTimeout(() => { container.style.display = 'none'; container.classList.remove('show','hide'); }, 260);
            }, timeout);
        }

        function parseHHMMToMinutes(str) {
            const p = String(str || '').split(':');
            if (p.length < 2) return null;
            const h = parseInt(p[0], 10);
            const m = parseInt(p[1], 10);
            if (Number.isNaN(h) || Number.isNaN(m)) return null;
            return h * 60 + m;
        }

        function minutesToHHMM(mins) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        }

        function snapToNearest30(e) {
            const el = e.target || this;
            if (!el.value) return;
            const total = parseHHMMToMinutes(el.value);
            if (total === null) return;

            // calcular snapped a 30 minutos
            let snapped = Math.round(total / 30) * 30;

            // obtener min/max desde atributos (fallback a 08:00/22:00)
            const minAttr = el.getAttribute('min') || '08:00';
            const maxAttr = el.getAttribute('max') || '22:00';
            const minM = parseHHMMToMinutes(minAttr);
            const maxM = parseHHMMToMinutes(maxAttr);

            if (minM !== null && snapped < minM) {
                snapped = minM;
            }
            if (maxM !== null && snapped > maxM) {
                snapped = maxM;
            }

            const newVal = minutesToHHMM(snapped);
            if (newVal !== el.value) {
                el.value = newVal;
                el.classList.add('time-snapped');
                setTimeout(() => el.classList.remove('time-snapped'), 700);
                // notificar si el usuario ingresó fuera de rango
                if (total < (minM||0) || total > (maxM||24*60)) {
                    showReservarMessage('El horario está fuera del horario de atención. Se ajustó a ' + newVal + '.', 'info', 4200);
                }
            }
        }

        timeInput.addEventListener('blur', snapToNearest30);
        timeInput.addEventListener('change', snapToNearest30);
    }

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

        // Asegurar que la hora esté en múltiplos de 30 minutos y dentro de min/max (08:00-22:00).
        if (hora) {
            const parts = hora.split(':');
            if (parts.length === 2) {
                const hh = parseInt(parts[0], 10);
                const mm = parseInt(parts[1], 10);
                if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
                    const total = hh * 60 + mm;
                    // snap a 30
                    let snapped = Math.round(total / 30) * 30;

                    // obtener min/max desde el input
                    const timeEl = document.getElementById('res-hora');
                    const minAttr = (timeEl && timeEl.getAttribute('min')) ? timeEl.getAttribute('min') : '08:00';
                    const maxAttr = (timeEl && timeEl.getAttribute('max')) ? timeEl.getAttribute('max') : '22:00';
                    const minParts = minAttr.split(':');
                    const maxParts = maxAttr.split(':');
                    const minM = (!isNaN(parseInt(minParts[0],10)) ? parseInt(minParts[0],10)*60 + parseInt(minParts[1],10) : 8*60);
                    const maxM = (!isNaN(parseInt(maxParts[0],10)) ? parseInt(maxParts[0],10)*60 + parseInt(maxParts[1],10) : 22*60);

                    if (snapped < minM) snapped = minM;
                    if (snapped > maxM) snapped = maxM;

                    const newH = Math.floor(snapped / 60);
                    const newM = snapped % 60;
                    const newVal = String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
                    if (newVal !== hora) {
                        document.getElementById('res-hora').value = newVal;
                        hora = newVal;
                        // Mostrar aviso inline en lugar de alert
                        const container = document.getElementById('res-message');
                        if (container) {
                            // usar la función si existe
                            try { showReservarMessage('La hora fue ajustada a ' + newVal + ' para cumplir pasos de 30 minutos y horario de atención.', 'info', 4200); } catch(e){ container.textContent = 'La hora fue ajustada a ' + newVal + '.'; container.style.display='block'; }
                        } else {
                            alert('La hora fue ajustada a ' + newVal + ' para cumplir pasos de 30 minutos y horario de atención.');
                        }
                    }
                }
            }
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

/* ===============================
   FORMULARIO CURSO DE BARBERÍA + WHATSAPP
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
    const cursoForm = document.getElementById('curso-form');
    if (!cursoForm) return;

    const diegoPhone = '5491141948773'; // Número de WhatsApp de Diego (Argentina)

    cursoForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('curso-nombre').value.trim();
        const edad = document.getElementById('curso-edad').value.trim();
        const telefono = document.getElementById('curso-telefono').value.trim();
        const email = document.getElementById('curso-email').value.trim();
        const experiencia = document.getElementById('curso-experiencia').value;
        const mensaje = document.getElementById('curso-mensaje').value.trim();

        // Validar campos requeridos
        if (!nombre || !edad || !telefono || !email || !experiencia) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // Crear mensaje para WhatsApp
        const whatsappMsg = `*SOLICITUD DE CURSO DE BARBERÍA*\n\n` +
            `📋 *Datos Personales:*\n` +
            `Nombre: ${nombre}\n` +
            `Edad: ${edad}\n` +
            `Teléfono: ${telefono}\n` +
            `Email: ${email}\n\n` +
            `🎓 *Información del Curso:*\n` +
            `Experiencia: ${experiencia}\n` +
            `${mensaje ? `\nMensaje: ${mensaje}` : ''}`;

        const encoded = encodeURIComponent(whatsappMsg);
        const normalized = diegoPhone.replace(/[^\d]/g, '');
        const whatsappUrl = `https://wa.me/${normalized}?text=${encoded}`;

        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');

        // Limpiar formulario
        cursoForm.reset();

        // Mostrar mensaje de confirmación
        alert('Tu solicitud ha sido enviada a Diego. Te contactará pronto.');
    });

});


/* ===============================
   ANIMACIÓN ACORDEONES FAQ
   - Usa max-height dinámico para animar apertura/cierre
   - Mantiene un solo acordeón abierto (cierra los demás)
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
    const details = document.querySelectorAll('.faq-list details');
    if (!details || details.length === 0) return;

    details.forEach(d => {
        const answer = d.querySelector('.faq-answer');
        if (!answer) return;

        // Estado inicial
        if (d.open) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.opacity = '1';
        } else {
            answer.style.maxHeight = '0px';
            answer.style.opacity = '0';
        }

        // Cuando cambia el atributo open
        d.addEventListener('toggle', () => {
            // Si hay otros abiertos, cerrarlos (aniamción gestionada abajo)
            if (d.open) {
                // Cerrar demás detalles abiertos
                details.forEach(other => {
                    if (other !== d && other.open) {
                        const otherAns = other.querySelector('.faq-answer');
                        // iniciar cierre visual
                        if (otherAns) {
                            // Si estaba en 'none', fijar a su altura actual para poder animar
                            if (otherAns.style.maxHeight === 'none') {
                                otherAns.style.maxHeight = otherAns.scrollHeight + 'px';
                            }
                            // forzar reflow y luego colapsar
                            requestAnimationFrame(() => {
                                other.open = false;
                                otherAns.style.maxHeight = '0px';
                                otherAns.style.opacity = '0';
                            });
                        } else {
                            other.open = false;
                        }
                    }
                });

                // Preparar apertura del actual
                // Si antes estaba en 'none', fijarlo a su scrollHeight para animar
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';

                // Al terminar la transición, quitar max-height para permitir contenido dinámico
                const onEnd = (e) => {
                    if (e.propertyName === 'max-height') {
                        answer.style.maxHeight = 'none';
                        answer.removeEventListener('transitionend', onEnd);
                    }
                };
                answer.addEventListener('transitionend', onEnd);

            } else {
                // Cierre: si estaba en 'none', fijar altura para animar hacia 0
                if (answer.style.maxHeight === 'none') {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    // forzar repaint antes de colapsar
                    requestAnimationFrame(() => {
                        answer.style.maxHeight = '0px';
                        answer.style.opacity = '0';
                    });
                } else {
                    answer.style.maxHeight = '0px';
                    answer.style.opacity = '0';
                }
            }
        });
    });
});



