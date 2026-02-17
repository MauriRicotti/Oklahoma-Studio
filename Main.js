// ===============================
// VERIFICAR HORARIOS EN TIEMPO REAL
// ===============================
function updateBusinessStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (!statusIndicator) return;
    
    // Horarios de atención
    const businessHours = {
        0: null,           // Domingo: cerrado
        1: [9, 19],       // Lunes: 09:00 - 19:00
        2: [9, 19],       // Martes: 09:00 - 19:00
        3: [9, 19],       // Miércoles: 09:00 - 19:00
        4: [9, 19],       // Jueves: 09:00 - 19:00
        5: [9, 19],       // Viernes: 09:00 - 19:00
        6: [10, 18]       // Sábado: 10:00 - 18:00
    };
    
    function checkIfOpen() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHour + (currentMinutes / 60);
        
        const hours = businessHours[dayOfWeek];
        
        if (!hours) {
            return false; // Cerrado (domingo)
        }
        
        return currentTime >= hours[0] && currentTime < hours[1];
    }
    
    function updateStatus() {
        const isOpen = checkIfOpen();
        
        if (isOpen) {
            statusIndicator.classList.remove('closed');
            statusText.textContent = 'Abierto ahora';
            statusDot.style.backgroundColor = '#4CAF50';
        } else {
            statusIndicator.classList.add('closed');
            statusText.textContent = 'Cerrado';
            statusDot.style.backgroundColor = '#F44336';
        }
    }
    
    // Actualizar al cargar y cada minuto
    updateStatus();
    setInterval(updateStatus, 60000);
}

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
// SISTEMA DE FILTROS DE CORTES
// ===============================
function initializeFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const verTodoBtn = document.getElementById('ver-todo-btn');
    const ITEMS_PER_PAGE = 6;
    let isExpandedAll = false;
    let currentFilter = 'todos';

    // Función para aplicar filtro y mostrar/ocultar items
    function applyFilter(filterValue, shouldResetExpanded = true) {
        if (shouldResetExpanded) {
            isExpandedAll = false; // Reset cuando cambia filtro
        }
        
        currentFilter = filterValue;
        let visibleCount = 0;

        // Mostrar/ocultar items según filtro y estado expandido
        galleryItems.forEach(item => {
            const servicio = item.dataset.servicio;
            const barbero = item.dataset.barbero;
            let shouldShow = false;

            // Determinar si este item debe ser visible según el filtro
            if (filterValue === 'todos') {
                shouldShow = true;
            } else if (filterValue === servicio || filterValue === barbero) {
                shouldShow = true;
            }

            if (shouldShow) {
                // En filtro 'todos' y no expandido, ocultar items después del 6to
                if (filterValue === 'todos' && !isExpandedAll && visibleCount >= ITEMS_PER_PAGE) {
                    item.classList.add('hidden');
                } else {
                    item.classList.remove('hidden');
                }
                visibleCount++;
            } else {
                // Este item no debe ser visible para este filtro
                item.classList.add('hidden');
            }
        });

        // Actualizar estado del botón "Ver todo"
        updateVerTodoButton(filterValue, visibleCount);
    }

    // Actualizar estado del botón
    function updateVerTodoButton(filterValue, totalItems) {
        if (filterValue === 'todos' && totalItems > ITEMS_PER_PAGE) {
            verTodoBtn.style.display = 'block';
            verTodoBtn.innerHTML = isExpandedAll ? '<i class="bi bi-chevron-up"></i> Mostrar menos' : '<i class="bi bi-chevron-down"></i> Ver todo';
        } else {
            verTodoBtn.style.display = 'none';
        }
    }

    // Event listeners para botones de filtro
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterValue = this.dataset.filter;

            // Actualizar estado de botones
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Aplicar filtro (con reset de isExpandedAll)
            applyFilter(filterValue, true);
        });
    });

    // Event listener para botón "Ver todo"
    verTodoBtn.addEventListener('click', function() {
        isExpandedAll = !isExpandedAll;
        // Reaplicar filtro sin resetear isExpandedAll
        applyFilter(currentFilter, false);
    });

    // Inicializar con filtro 'todos' activo
    applyFilter('todos', true);
}

// ===============================
// MODAL PARA EXPANDIR IMAGEN
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Crear badges de servicio
    createServiceBadges();
    
    // Inicializar filtros de cortes
    initializeFilterButtons();
    
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
// MENÚ LATERAL MÓVIL (SIDEBAR) - Mejoras accesibles
// ===============================
const hamburger = document.querySelector('.hamburger');
const sidebarMenu = document.querySelector('.sidebar-menu');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sidebarCloseBtn = document.querySelector('.sidebar-close');

let sidebarPreviouslyFocused = null;
let sidebarKeyHandler = null;

function openSidebar() {
    if (!sidebarMenu) return;
    sidebarPreviouslyFocused = document.activeElement;
    hamburger.classList.add('active');
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    sidebarMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');

    // focus al primer enlace
    const first = sidebarMenu.querySelector('.sidebar-link, .sidebar-close');
    if (first && typeof first.focus === 'function') first.focus();

    // keydown handler para Escape y Trap Tab
    sidebarKeyHandler = function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
            return;
        }
        if (e.key === 'Tab') {
            // trap focus
            const focusable = Array.from(sidebarMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
                .filter(el => !el.hasAttribute('disabled'));
            if (focusable.length === 0) return;
            const firstEl = focusable[0];
            const lastEl = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault(); lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault(); firstEl.focus();
            }
        }
    };

    document.addEventListener('keydown', sidebarKeyHandler);
}

function closeSidebar() {
    if (!sidebarMenu) return;
    hamburger.classList.remove('active');
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    sidebarMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');

    if (sidebarKeyHandler) {
        document.removeEventListener('keydown', sidebarKeyHandler);
        sidebarKeyHandler = null;
    }

    // devolver foco al elemento previo
    try { if (sidebarPreviouslyFocused && typeof sidebarPreviouslyFocused.focus === 'function') sidebarPreviouslyFocused.focus(); } catch (e) {}
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isOpen = sidebarMenu && sidebarMenu.classList.contains('active');
        if (isOpen) closeSidebar(); else openSidebar();
    });
}

// Cerrar con botón interno, links y overlay
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeSidebar();
    });
});

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// ===============================
// EFECTO PARALLAX EN HERO
// ===============================
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    
    if (!heroBackground) return;
    
    let ticking = false;
    let lastScrollPosition = 0;
    
    // Usar requestAnimationFrame para optimizar el parallax
    function updateParallax() {
        const scrollPosition = window.pageYOffset;
        heroBackground.style.backgroundPosition = `center ${scrollPosition * 1.01}px`;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        lastScrollPosition = window.pageYOffset;
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
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

// ===============================
// BOTÓN FLOTANTE VOLVER ARRIBA
// ===============================
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

// Throttling para optimizar el rendimiento en móviles
let isScrolling = false;
let scrollTimeout;
let lastScrollY = 0;

function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Mostrar/ocultar botón "volver arriba" (si existe)
    if (scrollToTopBtn) {
        if (currentScrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }

    // Efecto de glassmorphismo mejorado en navbar al hacer scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (currentScrollY > 0) {
            navbar.classList.add('scrolled');
            navbar.classList.add('no-shadow');
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('no-shadow');
        }
    }
    
    lastScrollY = currentScrollY;
}

// Usar requestAnimationFrame para optimización en móviles
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(handleScroll);
        isScrolling = false;
    }
}, { passive: true });

// Inicializar estado visual al cargar (ejecuta el handler de scroll una vez)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.dispatchEvent(new Event('scroll')));
} else {
    window.dispatchEvent(new Event('scroll'));
}

// Scroll suave al hacer clic
if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ===============================
   LÓGICA MODAL RESERVAS + WHATSAPP
   =============================== */
document.addEventListener('DOMContentLoaded', async function() {
    const reservarModal = document.getElementById('reservar-modal');
    const reservarForm = document.getElementById('reservar-form');
    const abrirBtns = document.querySelectorAll('.open-reservar');
    if (!reservarModal || !reservarForm) return;
    
    // Esperar a que Firebase esté listo
    if (window.firebaseReadyPromise) {
        await window.firebaseReadyPromise;
    }

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

    // Función para generar pills de horarios (10:00 a 21:00, cada 30 min)
    async function generarHorariosPills() {
        const container = document.getElementById('res-horarios-pills');
        const barberoNombre = selectBarbero.value;
        // Procesar el nombre del barbero igual que en dashboard.js
        const barbero = barberoNombre.replace(/\s+/g, '_').toLowerCase();
        const fecha = document.getElementById('res-fecha').value;
        
        container.innerHTML = '';
        
        if (!barbero || !fecha) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Selecciona barbero y fecha primero</p>';
            return;
        }

        // Verificar si la fecha es domingo
        const [year, month, day] = fecha.split('-');
        const selectedDate = new Date(year, month - 1, day);
        const isSunday = selectedDate.getDay() === 0;

        if (isSunday) {
            container.innerHTML = '<p style="color: #dc3545; font-size: 0.9rem; font-weight: 600;"><i class="bi bi-info-circle" style="margin-right: 0.5rem;"></i>No atendemos domingos. Selecciona otro día.</p>';
            return;
        }

        // Generar horarios de 10:00 a 21:00 cada 30 min
        const horarios = [];
        for (let h = 10; h <= 21; h++) {
            for (let m = 0; m < 60; m += 30) {
                horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
        }

        // Obtener turnos reservados para este barbero en esta fecha desde Firebase Realtime Database
        let turnosReservados = [];
        try {
            if (!window.firebaseDB) {
                console.warn('⚠ Firebase no disponible, mostrando todos los horarios');
            } else {
                // Leer los turnos del barbero desde Realtime Database
                const snapshot = await window.firebaseDB.ref(`turnos/${barbero}`).once('value');
                if (snapshot.exists()) {
                    const turnos = snapshot.val();
                    // Filtrar los turnos que coincidan con la fecha seleccionada
                    Object.values(turnos).forEach(turno => {
                        if (turno.fecha === fecha && turno.hora) {
                            turnosReservados.push(turno.hora);
                        }
                    });
                    console.log(`📅 Horarios ocupados para ${barberoNombre} el ${fecha}:`, turnosReservados);
                }
            }
        } catch (error) {
            console.error('❌ Error al cargar turnos desde Firebase:', error);
        }

        // Crear pills de horarios
        horarios.forEach(hora => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'horario-pill';
            pill.textContent = hora;
            
            const isDisabled = turnosReservados.includes(hora);
            if (isDisabled) {
                pill.classList.add('disabled');
                pill.title = 'Este horario ya está ocupado';
            }
            
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                if (!isDisabled) {
                    document.querySelectorAll('.horario-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    document.getElementById('res-hora').value = hora;
                    console.log('✅ Horario seleccionado:', hora);
                }
            });
            
            container.appendChild(pill);
        });
    }

    // Función para generar pills de servicios
    async function generarServiciosPills() {
        const container = document.getElementById('res-servicios-pills');
        container.innerHTML = '';

        // Obtener servicios desde Firebase
        let servicios = {};
        try {
            // Intentar cargar desde la colección 'precios' en Firestore
            if (typeof db !== 'undefined' && db.collection) {
                const snapshot = await db.collection('precios').get();
                snapshot.forEach(doc => {
                    servicios[doc.id] = doc.data();
                });
            }
        } catch (error) {
            console.log('Error al cargar precios desde Firestore:', error);
        }

        // Si no hay servicios en Firestore, usar los que están en el objeto precios del dashboard
        if (Object.keys(servicios).length === 0) {
            // Los servicios que aparecen en la sección de precios
            servicios = {
                'Corte de Pelo': 12000,
                'Coloración': 30000,
                'Arreglo de Barba': 3000,
                'Perfilado de Cejas': 2000,
                'Lavado': 1000,
                'Asesoría de Estilo': 1000
            };
        }

        // Crear pills de servicios
        Object.keys(servicios).forEach(servicio => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'servicio-pill-item';
            pill.textContent = servicio;
            
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                pill.classList.toggle('active');
                
                // Actualizar campo oculto con servicios seleccionados
                const serviciosActivos = Array.from(document.querySelectorAll('.servicio-pill-item.active'))
                    .map(p => p.textContent)
                    .join(', ');
                document.getElementById('res-servicios').value = serviciosActivos;
            });
            
            container.appendChild(pill);
        });
    }

    // Escuchar cambios en barbero y fecha para regenerar horarios
    selectBarbero.addEventListener('change', generarHorariosPills);
    document.getElementById('res-fecha').addEventListener('change', generarHorariosPills);

    // Generar servicios al abrir el modal
    function openModal(preselectBarber) {
        if (preselectBarber) {
            const exists = Array.from(selectBarbero.options).some(o => o.value === preselectBarber);
            if (exists) selectBarbero.value = preselectBarber;
        }
        
        generarServiciosPills();
        generarHorariosPills();
        
        reservarModal.classList.add('active');
        reservarModal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        const content = reservarModal.querySelector('.reservar-modal-content');
        if (content) {
            content.classList.remove('closing');
        }
        const nombreInput = document.getElementById('res-nombre');
        if (nombreInput) nombreInput.focus();
    }

    console.log('⚙️ Agregando evento submit al formulario de reservas...');
    console.log('Formulario encontrado:', reservarForm);
    console.log('Modal encontrado:', reservarModal);
    
    // Función para mostrar notificación desde la derecha
    function mostrarNotificacionReserva(mensaje) {
        const container = document.createElement('div');
        container.className = 'notificacion-reserva';
        container.innerHTML = `
            <div class="notificacion-contenido">
                <i class="bi bi-check-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        document.body.appendChild(container);
        
        // Trigger animation
        setTimeout(() => {
            container.classList.add('mostrar');
        }, 10);
        
        // Auto-remove después de 4 segundos
        setTimeout(() => {
            container.classList.remove('mostrar');
            setTimeout(() => {
                container.remove();
            }, 400);
        }, 4000);
    }
    
    // Función para procesar la reserva
    async function procesarReserva(e) {
        if (e) {
            e.preventDefault();
        }
        console.log('📋 Formulario enviado - Procesando reserva...');
        
        // Asegurar que Firebase esté listo antes de proceder
        if (window.firebaseReadyPromise) {
            await window.firebaseReadyPromise;
        }
        
        const nombre = document.getElementById('res-nombre').value.trim();
        const apellido = document.getElementById('res-apellido').value.trim();
        const telefono = document.getElementById('res-telefono').value.trim();
        const barberoNombre = selectBarbero.value;
        // Procesar el nombre del barbero igual que en dashboard.js para que coincidan en la BD
        const barbero = barberoNombre.replace(/\s+/g, '_').toLowerCase();
        const fecha = document.getElementById('res-fecha').value;
        const hora = document.getElementById('res-hora').value;
        const servicios = document.getElementById('res-servicios').value;

        console.log('Datos del formulario:', { nombre, apellido, telefono, barbero, fecha, hora, servicios });

        if (!nombre || !apellido || !telefono || !barbero || !fecha || !hora || !servicios) {
            console.warn('❌ Campos incompletos:', { nombre, apellido, telefono, barbero, fecha, hora, servicios });
            
            // Validación específica para horario
            if (!hora) {
                showReservarMessage('Por favor selecciona un horario disponible.', 'error', 4200);
                return;
            }
            
            showReservarMessage('Por favor completa todos los campos obligatorios.', 'error', 4200);
            return;
        }

        try {
            console.log('💾 Guardando en Firebase Realtime Database...');
            
            // Guardar en Realtime Database
            const turnoId = Date.now().toString();
            const turno = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                cliente: nombre + ' ' + apellido,
                servicio: servicios,
                barberonombre: barberoNombre,
                fecha: fecha,
                hora: hora,
                estado: 'pendiente',
                createdAt: new Date().toISOString()
            };
            
            // Guardar en Firebase Realtime Database
            if (window.firebaseDB) {
                await window.firebaseDB.ref(`turnos/${barbero}/${turnoId}`).set(turno);
                console.log('✅ Reserva guardada en Firebase Realtime Database:', turnoId);
                mostrarNotificacionReserva('Solicitud de reserva enviada');
                showReservarMessage('¡Reserva confirmada! El barbero la verá en su dashboard.', 'info', 4200);
                reservarForm.reset();
                closeModal();
            } else {
                throw new Error('Firebase no está disponible');
            }
            
        } catch (error) {
            console.error('❌ Error al guardar en Firebase:', error);
            
            // Fallback a localStorage si Firebase falla
            const turnoId = Date.now().toString();
            const turno = {
                id: turnoId,
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                cliente: nombre + ' ' + apellido,
                barbero: barbero,
                barberonombre: barberoNombre,
                fecha: fecha,
                hora: hora,
                servicios: servicios,
                estado: 'pendiente',
                createdAt: new Date().toISOString()
            };
            
            // Guardar en localStorage bajo la clave del barbero
            const storageKey = `turnos_${barbero}`;
            let turnos = [];
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    turnos = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('No se pudo leer turnos previos:', e);
            }
            
            turnos.push(turno);
            localStorage.setItem(storageKey, JSON.stringify(turnos));
            console.log('✅ Reserva guardada en localStorage:', turnoId);
            
            mostrarNotificacionReserva('Solicitud de reserva enviada');
            showReservarMessage('⚠️ Se guardó localmente. Firebase no disponible ahora.', 'info', 5000);
            reservarForm.reset();
            closeModal();
        }
    }
    
    // Agregar listener al formulario
    reservarForm.addEventListener('submit', procesarReserva);
    
    // También agregar listener al botón submit para mayor compatibilidad
    const submitBtn = reservarForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', procesarReserva);
        console.log('✅ Listeners agregados correctamente al formulario');
    }


});

/* ===============================
   FORMULARIO CURSO DE BARBERÍA + FIREBASE
   =============================== */
// Esperar a que Firebase esté listo
async function setupCursoForm() {
    // Esperar a que Firebase esté completamente inicializado
    if (window.firebaseReadyPromise) {
        await window.firebaseReadyPromise;
    }

    const cursoForm = document.getElementById('curso-form');
    if (!cursoForm) return;

    cursoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('curso-nombre').value.trim();
        const edad = document.getElementById('curso-edad').value.trim();
        const telefono = document.getElementById('curso-telefono').value.trim();
        const email = document.getElementById('curso-email').value.trim();
        const experiencia = document.getElementById('curso-experiencia').value;
        const mensaje = document.getElementById('curso-mensaje').value.trim();

        // Validar campos requeridos
        if (!nombre || !edad || !telefono || !email || !experiencia) {
            showCursoNotification('Por favor completa todos los campos requeridos.', 'error');
            return;
        }

        // Crear objeto de datos para guardar en Firebase
        const solicitudCurso = {
            nombre: nombre,
            edad: edad,
            telefono: telefono,
            email: email,
            experiencia: experiencia,
            mensaje: mensaje,
            fecha: new Date().toISOString(),
            estado: 'pendiente',
            timestamp: Date.now()
        };

        try {
            // Obtener referencia de Firebase
            const db = window.firebaseDB;
            
            if (db) {
                // Guardar en Firebase Realtime Database
                await db.ref('solicitudes_curso').push(solicitudCurso);
                console.log('✓ Solicitud de curso guardada en Firebase');
            } else {
                console.warn('⚠ Firebase no disponible, continuando');
            }

            // Limpiar formulario
            cursoForm.reset();

            // Mostrar notificación de éxito
            showCursoNotification('¡Solicitud enviada exitosamente! Pronto te contactaremos.', 'success');
        } catch (error) {
            console.error('❌ Error al guardar solicitud:', error);
            showCursoNotification('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.', 'error');
        }
    });
}

// Función para mostrar notificaciones bonitas
function showCursoNotification(message, type = 'success') {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.curso-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `curso-notification curso-notification--${type}`;
    
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
    
    notification.innerHTML = `
        <div class="curso-notification__content">
            <i class="bi ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="curso-notification__close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;

    // Agregar al documento
    document.body.appendChild(notification);

    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursoForm);
} else {
    setupCursoForm();
}







/* ===============================
   ACORDE�N FAQ - NUEVO DISE�O
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const contentId = this.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            
            // Cerrar todos los dem�s
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    const otherId = otherHeader.getAttribute('aria-controls');
                    document.getElementById(otherId).style.display = 'none';
                }
            });
            
            // Abrir/cerrar el actual
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                content.style.display = 'none';
            } else {
                this.setAttribute('aria-expanded', 'true');
                content.style.display = 'block';
            }
        });
    });

    // Bot�n contactar
    const contactBtn = document.querySelector('.faq-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            // Scroll a la secci�n de contacto
            const contactSection = document.querySelector('#contacto');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ===============================
    // ACCESO AL DASHBOARD CON ATAJO
    // ===============================
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+D (o Cmd+Shift+D en Mac) - D de Dashboard
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            showDashboardLogin();
        }
    });
});

// ===============================
// MODAL DE ACCESO AL DASHBOARD
// ===============================
// Lista de barberos disponibles
const BARBEROS_DISPONIBLES = [
    { id: 'diego', nombre: 'Diego' },
    { id: 'leo', nombre: 'Leo' },
    { id: 'martin', nombre: 'Martin' }
];

function showDashboardLogin() {
    // Verificar si ya existe el modal
    let modal = document.getElementById('dashboard-login-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dashboard-login-modal';
        modal.className = 'dashboard-login-modal';
        
        // Generar opciones de barberos
        const opcionesBarberos = BARBEROS_DISPONIBLES
            .map(b => `<option value="${b.nombre}">${b.nombre}</option>`)
            .join('');
        
        modal.innerHTML = `
            <div class="dashboard-login-content">
                <div class="dashboard-login-header">
                    <h2>Acceso al Dashboard</h2>
                    <button class="dashboard-login-close">&times;</button>
                </div>
                <form id="dashboard-login-form" class="dashboard-login-form">
                    <div class="dashboard-login-group">
                        <label for="barber-name-input">Selecciona tu perfil</label>
                        <select 
                            id="barber-name-input" 
                            required
                            style="
                                width: 100%;
                                padding: 12px;
                                background-color: #1f1f1f;
                                border: 1px solid #333333;
                                color: #ffffff;
                                border-radius: 6px;
                                font-size: 1rem;
                                cursor: pointer;
                                transition: all 0.25s ease;
                            "
                        >
                            <option value="" disabled selected>-- Selecciona un barbero --</option>
                            ${opcionesBarberos}
                        </select>
                    </div>
                    <div class="dashboard-login-group">
                        <label for="dashboard-password-input">Contraseña</label>
                        <input 
                            type="password" 
                            id="dashboard-password-input" 
                            placeholder="Ingresa tu contraseña"
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="dashboard-login-btn">Acceder al Dashboard</button>
                </form>
                <p class="dashboard-login-hint">Contraseña: <strong>1234</strong></p>
            </div>
        `;
        document.body.appendChild(modal);

        // Cerrar modal
        const closeBtn = modal.querySelector('.dashboard-login-close');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Manejar envío del formulario
        const form = modal.querySelector('#dashboard-login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('dashboard-password-input').value;
            const barberName = document.getElementById('barber-name-input').value;

            // Obtener contraseña correcta del localStorage (o usar '1234' como default)
            const correctPassword = localStorage.getItem('barberiaShop_masterPassword') || '1234';

            // Validar contraseña
            if (password === correctPassword && barberName) {
                // Guardar nombre del barbero
                localStorage.setItem('barberiaShop_currentBarber', barberName);
                modal.remove();
                
                // Mostrar indicador de carga
                showLoadingIndicator();
                
                // Cargar dashboard.css y dashboard.js de forma dinámica
                try {
                    await loadDashboardResources();
                    // Redirigir al dashboard
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    console.error('Error cargando dashboard:', error);
                    hideLoadingIndicator();
                    alert('Error al acceder al dashboard');
                }
            } else if (!barberName) {
                alert('Por favor selecciona un barbero');
            } else {
                alert('Contraseña incorrecta');
                document.getElementById('dashboard-password-input').value = '';
            }
        });
    } else {
        modal.style.display = 'flex';
    }
}

// Agregar estilos al document si no existen
if (!document.getElementById('dashboard-login-styles')) {
    const style = document.createElement('style');
    style.id = 'dashboard-login-styles';
    style.textContent = `
        .dashboard-login-modal {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .dashboard-login-content {
            background-color: #0F0F0F;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            padding: 2rem;
            width: 90%;
            max-width: 400px;
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .dashboard-login-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .dashboard-login-header h2 {
            margin: 0;
            color: var(--text-light);
            font-size: 1.5rem;
        }

        .dashboard-login-close {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s;
        }

        .dashboard-login-close:hover {
            color: var(--text-light);
        }

        .dashboard-login-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .dashboard-login-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .dashboard-login-group label {
            color: var(--text-light);
            font-weight: 600;
            font-size: 0.95rem;
        }

        .dashboard-login-group input {
            padding: 0.875rem;
            background-color: rgba(255, 255, 255, 0.02);
            border: 1px solid #444444;
            border-radius: 8px;
            color: var(--text-light);
            font-size: 0.95rem;
            transition: all 0.3s;
        }

        .dashboard-login-group input:focus {
            outline: none;
            border-color: #666666;
            background-color: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 0 2px rgba(100, 100, 100, 0.2);
        }

        .dashboard-login-group input::placeholder {
            color: var(--text-secondary);
        }

        .dashboard-login-btn {
            padding: 0.875rem;
            background: linear-gradient(135deg, #555555 0%, #333333 100%);
            border: none;
            border-radius: 8px;
            color: #ffffff;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 0.5rem;
        }

        .dashboard-login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(100, 100, 100, 0.3);
            background: linear-gradient(135deg, #666666 0%, #444444 100%);
        }

        .dashboard-login-hint {
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-top: 1rem;
            margin-bottom: 0;
        }

        @media (max-width: 480px) {
            .dashboard-login-content {
                width: 95%;
                padding: 1.5rem;
            }

            .dashboard-login-header h2 {
                font-size: 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===============================
// FUNCIONES DE CARGA LAZY DEL DASHBOARD
// ===============================

/**
 * Carga dinámicamente dashboard.css y dashboard.js
 * Solo se ejecuta cuando el usuario accede al dashboard
 */
async function loadDashboardResources() {
    return Promise.all([
        loadDashboardCSS(),
        loadDashboardJS()
    ]);
}

/**
 * Carga CSS del dashboard
 */
function loadDashboardCSS() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (document.querySelector('link[href="dashboard.css"]')) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'dashboard.css';
        
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('No se pudo cargar dashboard.css'));
        
        document.head.appendChild(link);
    });
}

/**
 * Carga JS del dashboard
 */
function loadDashboardJS() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (document.querySelector('script[src="dashboard.js"]')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'dashboard.js';
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar dashboard.js'));
        
        document.body.appendChild(script);
    });
}

/**
 * Muestra indicador de carga
 */
function showLoadingIndicator() {
    let indicator = document.getElementById('dashboard-loading');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'dashboard-loading';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        indicator.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="margin: 0;">Cargando dashboard...</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(indicator);
    } else {
        indicator.style.display = 'flex';
    }
}

/**
 * Oculta indicador de carga
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('dashboard-loading');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// ===============================
// OPTIMIZACIÓN DE IMÁGENES LAZY LOADING - PRODUCTOS
// ===============================
(function optimizeProductImages() {
    // Manejar imágenes que ya están cargadas o no usan lazy loading
    const loadCompleteHandler = (img) => {
        const imageContainer = img.closest('.producto-image');
        if (imageContainer) {
            imageContainer.classList.add('loaded');
        }
    };

    // Procesar imágenes actuales
    document.querySelectorAll('.producto-img').forEach(img => {
        if (img.complete) {
            loadCompleteHandler(img);
        }
        
        // Escuchar carga para imágenes futuras
        img.addEventListener('load', function() {
            loadCompleteHandler(this);
        }, { once: true, passive: true });
    });

    // Para mejor soporte de IntersectionObserver si es disponible
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Imagen entra en viewport - la carga nativa de lazy loading se encargará
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Pre-cargar 50px antes de que entre en viewport
        });

        document.querySelectorAll('.producto-img[loading="lazy"]').forEach(img => {
            imgObserver.observe(img);
        });
    }
})();

// ===============================
// ACTUALIZAR SIDEBAR SEGÚN SECCIÓN VISIBLE
// ===============================
(function initSidebarActiveLinkUpdate() {
    // Solo ejecutar una vez
    if (window._sidebarActiveLinkInitialized) return;
    window._sidebarActiveLinkInitialized = true;
    
    const sections = document.querySelectorAll('section[id]');
    const sidebarLinks = document.querySelectorAll('a.sidebar-link[href^="#"]:not(.cta-link)');
    
    // Crear un mapa de IDs de sección a links del sidebar
    const sectionLinkMap = {};
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const sectionId = href.substring(1);
            sectionLinkMap[sectionId] = link;
        }
    });
    
    let updateTimeout;
    const updateActiveLink = () => {
        // Evitar múltiples ejecuciones simultáneas
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            let visibleSection = null;
            let closestDistance = Infinity;
            
            // Detectar cuál sección está más cerca del centro de la pantalla
            const viewportCenter = window.innerHeight / 2;
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionCenter = (rect.top + rect.bottom) / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    visibleSection = section.id;
                }
            });
            
            // Actualizar los links del sidebar - eliminar active de todos primero
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Resaltar el link correspondiente a la sección visible
            if (visibleSection && sectionLinkMap[visibleSection]) {
                sectionLinkMap[visibleSection].classList.add('active');
            }
        }, 50);
    };
    
    // Actualizar al scroll
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    
    // Actualizar al cargar
    window.addEventListener('load', updateActiveLink);
    
    // Iniciar inmediatamente
    setTimeout(updateActiveLink, 100);
})();

// ===============================
// NAVBAR DROPDOWN - BARBEROS
// ===============================
(function initNavbarDropdown() {
    const navDropdown = document.querySelector('.nav-item-dropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const sidebarMenu = document.querySelector('.sidebar-menu');

    // Manejar clic en items del dropdown
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Cerrar sidebar si está abierto
            if (sidebarMenu && sidebarMenu.classList.contains('active')) {
                sidebarMenu.classList.remove('active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
            
            // Navegar a la sección o página
            if (href) {
                if (href.startsWith('#')) {
                    // Scroll suave para anclas locales
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    // Navegación a otra página (barbero.html)
                    window.location.href = href;
                }
            }
        });
    });

    // Cerrar dropdown cuando se hace clic fuera
    document.addEventListener('click', function(e) {
        if (navDropdown && !navDropdown.contains(e.target)) {
            // El dropdown se cerrará automáticamente con CSS
        }
    });
})();