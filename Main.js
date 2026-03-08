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
    
    // Actualizar estado de negocio (abierto/cerrado)
    updateBusinessStatus();
    
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
// MENÚ MÓVIL - DROPDOWN DESDE ARRIBA
// ===============================
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

function openMobileMenu() {
    if (!mobileMenu) return;
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
    if (!mobileMenu) return;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu && mobileMenu.classList.contains('active');
        if (isOpen) closeMobileMenu(); else openMobileMenu();
    });
}

// Cerrar menú al hacer click en un link
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

// Cerrar menú al hacer click en el overlay
if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

// Cerrar menú con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// ===============================
// GESTOS TÁCTILES PARA ABRIR/CERRAR MENÚ LATERAL
// ===============================
function initSwipeGestures() {
    // Variables para rastrear el gesto
    let isSwiping = false;
    let swipeStart = { x: 0, y: 0 };
    
    // Detectar inicio del toque
    document.addEventListener('touchstart', function(e) {
        swipeStart.x = e.changedTouches[0].screenX;
        swipeStart.y = e.changedTouches[0].screenY;
        isSwiping = true;
    }, { passive: true });
    
    // Detectar fin del toque y calcular dirección
    document.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        const swipeEnd = {
            x: e.changedTouches[0].screenX,
            y: e.changedTouches[0].screenY
        };
        
        const deltaX = swipeEnd.x - swipeStart.x;
        const deltaY = swipeEnd.y - swipeStart.y;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Verificar que es principalmente un movimiento horizontal (no vertical)
        if (absDeltaX > SWIPE_THRESHOLD && absDeltaX > absDeltaY * 2) {
            // Deslizamiento válido
            if (deltaX > 0) {
                // Deslizamiento hacia la derecha -> Abrir menú
                // Solo abrir si está cerrado
                if (sidebarMenu && !sidebarMenu.classList.contains('active')) {
                    openSidebar();
                }
            } else {
                // Deslizamiento hacia la izquierda -> Cerrar menú
                // Solo cerrar si está abierto
                if (sidebarMenu && sidebarMenu.classList.contains('active')) {
                    closeSidebar();
                }
            }
        }
        
        isSwiping = false;
    }, { passive: true });
}

// Inicializar gestos al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwipeGestures);
} else {
    initSwipeGestures();
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
   LÓGICA MODAL RESERVAS CON PASOS
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

    // ===== ELEMENTOS DEL MODAL =====
    const closeBtn = reservarModal.querySelector('.reservar-close');
    const cancelBtn = reservarModal.querySelector('.reservar-cancel');
    const selectBarbero = document.getElementById('res-barbero');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const prevBtn = reservarModal.querySelector('.reservar-prev');

    let currentStep = 1;
    const totalSteps = 4;

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

    // ===== HELPERS =====
    let _resMessageTimeout = null;
    
    function showReservarMessage(msg, type = 'info', timeout = 4200) {
        const container = document.getElementById('res-message');
        if (!container) {
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

    function updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const stepCounter = document.getElementById('current-step');
        const percentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = percentage + '%';
        stepCounter.textContent = currentStep;
    }

    function updateProgressSteps() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    function showStep(stepNum) {
        currentStep = stepNum;
        
        // Ocultar todos los pasos
        document.querySelectorAll('.reservar-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar paso actual
        const activeStep = document.querySelector(`.reservar-step[data-step="${stepNum}"]`);
        if (activeStep) {
            activeStep.classList.add('active');
        }

        // Actualizar indicadores visuales
        updateProgressBar();
        updateProgressSteps();

        // Actualizar botones
        prevBtn.style.display = stepNum > 1 ? 'inline-flex' : 'none';
        if (stepNum === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }

        // Scroll al top del modal
        const modalContent = reservarModal.querySelector('.reservar-modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }

    function validateStep(stepNum) {
        const nombre = document.getElementById('res-nombre').value.trim();
        const apellido = document.getElementById('res-apellido').value.trim();
        const emailField = document.getElementById('res-email');
        const email = emailField ? emailField.value.trim() : '';
        const telefono = document.getElementById('res-telefono').value.trim();
        const barbero = selectBarbero.value;
        const servicios = document.getElementById('res-servicios').value.trim();
        const fecha = document.getElementById('res-fecha').value;
        const hora = document.getElementById('res-hora').value;

        if (stepNum === 1) {
            if (!nombre) {
                showReservarMessage('Por favor ingresa tu nombre', 'error');
                return false;
            }
            if (!apellido) {
                showReservarMessage('Por favor ingresa tu apellido', 'error');
                return false;
            }
            if (!telefono || telefono.length < 8) {
                showReservarMessage('Por favor ingresa un teléfono válido', 'error');
                return false;
            }
            return true;
        } else if (stepNum === 2) {
            if (!barbero) {
                showReservarMessage('Por favor selecciona un barbero', 'error');
                return false;
            }
            if (!servicios) {
                showReservarMessage('Por favor selecciona al menos un servicio', 'error');
                return false;
            }
            return true;
        } else if (stepNum === 3) {
            if (!fecha) {
                showReservarMessage('Por favor selecciona una fecha', 'error');
                return false;
            }
            if (!hora) {
                showReservarMessage('Por favor selecciona un horario', 'error');
                return false;
            }
            return true;
        }
        return true;
    }

    function updateResumenes() {
        const nombre = document.getElementById('res-nombre').value.trim();
        const apellido = document.getElementById('res-apellido').value.trim();
        const emailField = document.getElementById('res-email');
        const email = emailField ? emailField.value.trim() : '';
        const telefono = document.getElementById('res-telefono').value.trim();
        const barbero = selectBarbero.value;
        const servicios = document.getElementById('res-servicios').value.trim();
        const fecha = document.getElementById('res-fecha').value;
        const hora = document.getElementById('res-hora').value;

        // Resumen paso 2
        if (servicios) {
            document.getElementById('servicio-resumen-text').textContent = servicios;
            document.getElementById('servicio-resumen').classList.add('show');
        }
        if (barbero) {
            document.getElementById('barbero-resumen-text').textContent = barbero;
        }

        // Resumen paso 3
        if (fecha) {
            const fechaObj = new Date(fecha + 'T00:00:00');
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormato = fechaObj.toLocaleDateString('es-AR', options);
            document.getElementById('fecha-resumen-text').textContent = fechaFormato;
            document.getElementById('fecha-resumen').classList.add('show');
        }
        if (hora) {
            document.getElementById('hora-resumen-text').textContent = hora;
        }

        // Resumen paso 4 (confirmación)
        if (nombre || apellido) {
            document.getElementById('resumen-cliente').textContent = nombre + ' ' + apellido;
        }
        if (telefono) {
            document.getElementById('resumen-telefono').textContent = telefono;
        }
        if (barbero) {
            document.getElementById('resumen-barbero').textContent = barbero;
        }
        if (servicios) {
            document.getElementById('resumen-servicio').textContent = servicios;
        }
        if (fecha) {
            const fechaObj = new Date(fecha + 'T00:00:00');
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormato = fechaObj.toLocaleDateString('es-AR', options);
            document.getElementById('resumen-fecha').textContent = fechaFormato;
        }
        if (hora) {
            document.getElementById('resumen-hora').textContent = hora;
        }
    }

    function openModal(preselectBarber) {
        currentStep = 1;
        showStep(1);
        generarServiciosPills();
        generarHorariosPills();
        
        if (preselectBarber) {
            const exists = Array.from(selectBarbero.options).some(o => o.value === preselectBarber);
            if (exists) selectBarbero.value = preselectBarber;
        }
        
        reservarModal.classList.add('active');
        reservarModal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        const nombreInput = document.getElementById('res-nombre');
        if (nombreInput) nombreInput.focus();
    }

    function closeModal() {
        reservarModal.classList.remove('active');
        reservarModal.setAttribute('aria-hidden','true');
        document.body.style.overflow = 'auto';
        reservarForm.reset();
        currentStep = 1;
        showStep(1);
        document.getElementById('servicio-resumen').classList.remove('show');
        document.getElementById('fecha-resumen').classList.remove('show');
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

    reservarModal.addEventListener('click', function(e){
        if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && reservarModal.classList.contains('active')) closeModal();
    });

    // ===== GENERACIÓN DE HORARIOS =====
    async function generarHorariosPills() {
        const container = document.getElementById('res-horarios-pills');
        const barberoNombre = selectBarbero.value;
        const barbero = barberoNombre.replace(/\s+/g, '_').toLowerCase();
        const fecha = document.getElementById('res-fecha').value;
        
        container.innerHTML = '';
        
        if (!barbero || !fecha) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Selecciona barbero y fecha primero</p>';
            return;
        }

        const [year, month, day] = fecha.split('-');
        const selectedDate = new Date(year, month - 1, day);
        const isSunday = selectedDate.getDay() === 0;

        if (isSunday) {
            container.innerHTML = '<p style="color: #dc3545; font-size: 0.9rem; font-weight: 600;"><i class="bi bi-info-circle" style="margin-right: 0.5rem;"></i>No atendemos domingos. Selecciona otro día.</p>';
            return;
        }

        const horarios = [];
        for (let h = 10; h <= 21; h++) {
            for (let m = 0; m < 60; m += 30) {
                horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
        }

        let turnosReservados = [];
        try {
            if (!window.firebaseDB) {
                console.warn('⚠ Firebase no disponible, mostrando todos los horarios');
            } else {
                const snapshot = await window.firebaseDB.ref(`turnos/${barbero}`).once('value');
                if (snapshot.exists()) {
                    const turnos = snapshot.val();
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
                    updateResumenes();
                    console.log('✅ Horario seleccionado:', hora);
                }
            });
            
            container.appendChild(pill);
        });
    }

    // ===== GENERACIÓN DE SERVICIOS =====
    async function generarServiciosPills() {
        const container = document.getElementById('res-servicios-pills');
        container.innerHTML = '';

        let servicios = {};
        try {
            if (typeof db !== 'undefined' && db.collection) {
                const snapshot = await db.collection('precios').get();
                snapshot.forEach(doc => {
                    servicios[doc.id] = doc.data();
                });
            }
        } catch (error) {
            console.log('Error al cargar precios desde Firestore:', error);
        }

        if (Object.keys(servicios).length === 0) {
            servicios = {
                'Corte de Pelo': 12000,
                'Coloración': 30000,
                'Arreglo de Barba': 3000,
                'Perfilado de Cejas': 2000,
                'Lavado': 1000,
                'Asesoría de Estilo': 1000
            };
        }

        Object.keys(servicios).forEach(servicio => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'servicio-pill-item';
            pill.textContent = servicio;
            
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                pill.classList.toggle('active');
                
                const serviciosActivos = Array.from(document.querySelectorAll('.servicio-pill-item.active'))
                    .map(p => p.textContent)
                    .join(', ');
                document.getElementById('res-servicios').value = serviciosActivos;
                updateResumenes();
            });
            
            container.appendChild(pill);
        });
    }

    selectBarbero.addEventListener('change', () => {
        generarHorariosPills();
        updateResumenes();
    });
    document.getElementById('res-fecha').addEventListener('change', () => {
        generarHorariosPills();
        updateResumenes();
    });

    // ===== NAVEGACIÓN ENTRE PASOS =====
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }

        if (currentStep < totalSteps) {
            updateResumenes();
            showStep(currentStep + 1);
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });

    // ===== NOTIFICACIÓN DE RESERVA =====
    function mostrarNotificacionReserva(mensaje) {
        const container = document.createElement('div');
        container.className = 'notificacion-reserva';
        container.innerHTML = `
            <div class="notificacion-contenido">
                <span>${mensaje}</span>
            </div>
        `;
        document.body.appendChild(container);
        
        setTimeout(() => {
            container.classList.add('mostrar');
        }, 10);
        
        setTimeout(() => {
            container.classList.remove('mostrar');
            setTimeout(() => {
                container.remove();
            }, 400);
        }, 4000);
    }
    
    // ===== PROCESAR RESERVA (PASO 4) =====
    async function procesarReserva(e) {
        if (e) {
            e.preventDefault();
        }
        console.log('📋 Formulario enviado - Procesando reserva...');
        
        if (window.firebaseReadyPromise) {
            await window.firebaseReadyPromise;
        }
        
        const nombre = document.getElementById('res-nombre').value.trim();
        const apellido = document.getElementById('res-apellido').value.trim();
        const telefono = document.getElementById('res-telefono').value.trim();
        const barberoNombre = selectBarbero.value;
        const barbero = barberoNombre.replace(/\s+/g, '_').toLowerCase();
        const fecha = document.getElementById('res-fecha').value;
        const hora = document.getElementById('res-hora').value;
        const servicios = document.getElementById('res-servicios').value;

        console.log('Datos del formulario:', { nombre, apellido, telefono, barbero, fecha, hora, servicios });

        if (!nombre || !apellido || !telefono || !barbero || !fecha || !hora || !servicios) {
            console.warn('❌ Campos incompletos');
            showReservarMessage('Por favor completa todos los campos obligatorios.', 'error', 4200);
            return;
        }

        try {
            console.log('💾 Guardando en Firebase Realtime Database...');
            
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
            
            if (window.firebaseDB) {
                await window.firebaseDB.ref(`turnos/${barbero}/${turnoId}`).set(turno);
                console.log('✅ Reserva guardada en Firebase Realtime Database:', turnoId);
                mostrarNotificacionReserva('¡Solicitud de reserva enviada!');
                reservarForm.reset();
                setTimeout(() => closeModal(), 1500);
            } else {
                throw new Error('Firebase no está disponible');
            }
            
        } catch (error) {
            console.error('❌ Error al guardar en Firebase:', error);
            
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
            
            mostrarNotificacionReserva('Solicitud de reserva enviada (modo local)');
            reservarForm.reset();
            setTimeout(() => closeModal(), 1500);
        }
    }
    
    reservarForm.addEventListener('submit', procesarReserva);
    
    if (submitBtn) {
        submitBtn.addEventListener('click', procesarReserva);
        console.log('✅ Sistema de reservas con pasos configurado correctamente');
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
// ACTUALIZAR MOBILE MENU SEGÚN SECCIÓN VISIBLE
// ===============================
(function initMobileMenuActiveLinkUpdate() {
    // Solo ejecutar una vez
    if (window._mobileMenuActiveLinkInitialized) return;
    window._mobileMenuActiveLinkInitialized = true;
    
    const sections = document.querySelectorAll('section[id]');
    const mobileMenuLinks = document.querySelectorAll('a.mobile-menu-link[href^="#"]');
    
    // Crear un mapa de IDs de sección a links del mobile menu
    const sectionLinkMap = {};
    mobileMenuLinks.forEach(link => {
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
            
            // Actualizar los links del mobile menu - eliminar active de todos primero
            mobileMenuLinks.forEach(link => {
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
    const mobileMenu = document.querySelector('.mobile-menu');

    // Manejar clic en items del dropdown
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Cerrar mobile menu si está abierto
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                const overlay = document.querySelector('.mobile-menu-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                const hamburger = document.querySelector('.hamburger');
                if (hamburger) {
                    hamburger.classList.remove('active');
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

// ===============================
// CARRUSEL DE RESEÑAS - MEJORADO CON SCROLL SNAP
// ===============================================
class ReseniasCarousel {
    constructor() {
        this.scrollContainer = document.getElementById('resenas-scroll');
        this.prevBtn = document.getElementById('resenas-btn-prev');
        this.nextBtn = document.getElementById('resenas-btn-next');
        this.indicatorsContainer = document.getElementById('resenas-indicators');
        
        if (!this.scrollContainer) return;
        
        this.cards = this.scrollContainer.querySelectorAll('.resena-card');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isMobile = window.innerWidth < 768;
        
        this.init();
    }
    
    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1200) return 2;
        return 3;
    }
    
    init() {
        this.createIndicators();
        this.setupEventListeners();
        this.updateIndicators();
        this.startAutoPlay();
    }
    
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        const itemsPerView = this.getItemsPerView();
        const totalGroups = Math.ceil(this.cards.length / itemsPerView);
        
        for (let i = 0; i < totalGroups; i++) {
            const dot = document.createElement('button');
            dot.classList.add('indicator-dot');
            dot.setAttribute('aria-label', `Ir a grupo ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(dot);
        }
    }
    
    setupEventListeners() {
        // Botones de navegación
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Scroll event para actualizar indicadores
        this.scrollContainer.addEventListener('scroll', () => {
            this.updateIndicatorsFromScroll();
        });
        
        // Pausar autoplay solo cuando el usuario toca (móvil)
        this.scrollContainer.addEventListener('touchstart', () => this.stopAutoPlay());
        this.scrollContainer.addEventListener('touchend', () => this.resetAutoPlay());
        
        // Actualizar al redimensionar ventana
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (wasMobile !== this.isMobile) {
            this.createIndicators();
            this.updateIndicators();
        }
    }
    
    nextSlide() {
        const itemsPerView = this.getItemsPerView();
        const totalGroups = Math.ceil(this.cards.length / itemsPerView);
        this.currentIndex = (this.currentIndex + 1) % totalGroups;
        this.scrollToIndex(this.currentIndex);
        this.resetAutoPlay();
    }
    
    prevSlide() {
        const itemsPerView = this.getItemsPerView();
        const totalGroups = Math.ceil(this.cards.length / itemsPerView);
        this.currentIndex = (this.currentIndex - 1 + totalGroups) % totalGroups;
        this.scrollToIndex(this.currentIndex);
        this.resetAutoPlay();
    }
    
    goToSlide(groupIndex) {
        this.currentIndex = groupIndex;
        this.scrollToIndex(groupIndex);
        this.resetAutoPlay();
    }
    
    scrollToIndex(groupIndex) {
        const itemsPerView = this.getItemsPerView();
        const cardIndex = groupIndex * itemsPerView;
        const cardElement = this.cards[cardIndex];
        
        if (cardElement) {
            // Calcular el scroll horizontal sin hacer scroll vertical
            const containerWidth = this.scrollContainer.clientWidth;
            const cardRect = cardElement.getBoundingClientRect();
            const containerRect = this.scrollContainer.getBoundingClientRect();
            const cardOffsetLeft = cardElement.offsetLeft;
            const targetScroll = cardOffsetLeft - (containerWidth / 2) + (cardRect.width / 2);
            
            this.scrollContainer.scrollTo({
                left: Math.max(0, targetScroll),
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    updateIndicatorsFromScroll() {
        const itemsPerView = this.getItemsPerView();
        const containerWidth = this.scrollContainer.clientWidth;
        const scrollLeft = this.scrollContainer.scrollLeft;
        const centerScrollPos = scrollLeft + containerWidth / 2;
        
        // Encontrar qué tarjeta está más cerca del centro
        let closestCardIndex = 0;
        let closestDistance = Infinity;
        
        this.cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const containerRect = this.scrollContainer.getBoundingClientRect();
            const relativeLeft = cardRect.left - containerRect.left + scrollLeft;
            const cardCenter = relativeLeft + cardRect.width / 2;
            const distance = Math.abs(cardCenter - centerScrollPos);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCardIndex = index;
            }
        });
        
        // Convertir índice de tarjeta a índice de grupo
        const visibleGroup = Math.floor(closestCardIndex / itemsPerView);
        const totalGroups = Math.ceil(this.cards.length / itemsPerView);
        
        this.currentIndex = Math.min(visibleGroup, totalGroups - 1);
        this.updateIndicators();
    }
    
    updateIndicators() {
        const dots = this.indicatorsContainer.querySelectorAll('.indicator-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Cambiar cada 6 segundos
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// Inicializar carrusel cuando el DOM esté listo
let reseniasCarousel = null;

document.addEventListener('DOMContentLoaded', () => {
    reseniasCarousel = new ReseniasCarousel();
});

/* ===============================
   BARRA DE PROGRESO SCROLL
   =============================== */
window.addEventListener('scroll', function() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;
    
    // Calcular el porcentaje de scroll
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    // Actualizar el ancho de la barra
    progressBar.style.width = scrollPercent + '%';
}, { passive: true });