// ===============================
// DASHBOARD - GESTIÓN DE TURNOS CON FIREBASE
// ===============================
console.log('✓ dashboard.js cargado');

// VARIABLES GLOBALES
let currentDate = new Date();
let selectedDate = new Date();
let turnos = [];
let currentEditingId = null;
let currentBarberId = null;
let precios = {};
const BARBER_KEY = 'barberiaShop_currentBarber';
const STORAGE_KEY = 'barberiaShop_turnos';
const PRECIOS_KEY = 'barberiaShop_precios';

// Precios por defecto
const PRECIOS_DEFECTO = {
  'Corte': 12000,
  'Coloración': 30000,
  'Barba': 3000,
  'Perfilado': 2000,
  'Lavado': 1000,
  'Asesoria': 1000
};

// ===============================
// UTILIDADES PARA FIREBASE
// ===============================
function getDatabase() {
  return window.firebaseDB || (window.firebase && window.firebase.database ? window.firebase.database() : null);
}

function isDatabaseReady() {
  return typeof window.firebaseDB !== 'undefined' || (typeof window.firebase !== 'undefined' && window.firebase.database);
}

// ===============================
// INICIALIZACIÓN DEL DOCUMENTO
// ===============================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 Dashboard cargado');
  console.log('✓ DOM Elements:', {
    sidebarLinks: document.querySelectorAll('.sidebar__link').length,
    turnosList: !!document.getElementById('turnos-list'),
    nuevoturnoBtn: !!document.getElementById('nuevo-turno-btn')
  });
  
  try {
    initBarberName();
    loadCurrentBarberId();
    loadPrecios();
    setupEventListeners();
    
    // Cargar turnos e inicializar calendario después
    await loadTurnos();
    initCalendar();
    
    // Asegurar que la sección de turnos esté visible por defecto
    const turnosSection = document.getElementById('turnos-section');
    if (turnosSection) {
      turnosSection.classList.add('active');
      console.log('✓ Sección de turnos activada');
    }
    
    console.log('✓ Dashboard inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando dashboard:', error);
  }
});

// ===============================
// GESTIÓN DE BARBERO ACTUAL
// ===============================
function loadCurrentBarberId() {
  const barberName = localStorage.getItem(BARBER_KEY) || 'Barbero';
  currentBarberId = barberName.replace(/\s+/g, '_').toLowerCase();
  console.log('Barbero actual:', currentBarberId);
}

function initBarberName() {
  const barberName = localStorage.getItem(BARBER_KEY) || 'Barbero';
  document.getElementById('barber-name').textContent = barberName;
}

// ===============================
// MAPEO DE NOMBRES DE SERVICIOS
// ===============================
function normalizarNombresServicios(servicio) {
  if (!servicio) return servicio;
  
  const mapeo = {
    'Corte de Pelo': 'Corte',
    'Arreglo de Barba': 'Barba',
    'Perfilado de Cejas': 'Perfilado',
    'Asesoría de Estilo': 'Asesoria'
  };
  
  let servicioActualizado = servicio;
  Object.keys(mapeo).forEach(antiguo => {
    servicioActualizado = servicioActualizado.replace(new RegExp(antiguo, 'g'), mapeo[antiguo]);
  });
  
  return servicioActualizado;
}

// ===============================
// GESTIÓN DE TURNOS - FIREBASE
// ===============================
async function loadTurnos() {
  return new Promise((resolve, reject) => {
    try {
      console.log('📂 Cargando turnos...');
      
      if (!isDatabaseReady()) {
        console.warn('⚠ Firebase no disponible, usando localStorage');
        loadTurnosFromLocalStorage();
        renderUI();
        resolve();
        return;
      }

      const db = getDatabase();
      const dbRef = db.ref(`turnos/${currentBarberId}`);
      
      console.log('🔄 Leyendo desde Firebase:', `turnos/${currentBarberId}`);
      
      dbRef.once('value', (snapshot) => {
        turnos = [];
        snapshot.forEach((childSnapshot) => {
          turnos.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        console.log('✓ Turnos cargados desde Firebase:', turnos.length);
        
        // También cargar turnos desde Firestore si está disponible
        loadTurnosFromFirestore();
        renderUI();
        resolve();
      }, (error) => {
        console.error('❌ Error leyendo Firebase:', error);
        loadTurnosFromLocalStorage();
        loadTurnosFromFirestore();
        renderUI();
        resolve();
      });

      // Escuchar cambios en tiempo real
      dbRef.on('child_added', (snapshot) => {
        const turno = { id: snapshot.key, ...snapshot.val() };
        if (!turnos.find(t => t.id === turno.id)) {
          turnos.push(turno);
          console.log('✓ Turno nuevo agregado desde Firebase:', turno.id);
          renderUI();
        }
      });

      dbRef.on('child_changed', (snapshot) => {
        const turnoActualizado = { id: snapshot.key, ...snapshot.val() };
        const index = turnos.findIndex(t => t.id === snapshot.key);
        if (index !== -1) {
          turnos[index] = turnoActualizado;
          console.log('✓ Turno actualizado desde Firebase:', turnoActualizado.id);
          renderUI();
        }
      });

      dbRef.on('child_removed', (snapshot) => {
        turnos = turnos.filter(t => t.id !== snapshot.key);
        console.log('✓ Turno eliminado desde Firebase:', snapshot.key);
        renderUI();
      });

    } catch (error) {
      console.error('❌ Error cargando turnos:', error);
      loadTurnosFromLocalStorage();
      renderUI();
      resolve();
    }
  });
}

async function loadTurnosFromFirestore() {
  try {
    // Cargar turnos desde Firestore donde el barbero coincida con currentBarberId
    if (typeof db !== 'undefined' && db.collection) {
      const snapshot = await db.collection('turnos').where('barbero', '==', currentBarberId).get();
      snapshot.forEach((doc) => {
        const turnoFirestore = {
          id: doc.id,
          ...doc.data(),
          estado: doc.data().estado || 'pendiente'
        };
        
        // No duplicar si ya existe
        if (!turnos.find(t => t.id === turnoFirestore.id)) {
          turnos.push(turnoFirestore);
          console.log('✓ Turno cargado desde Firestore:', turnoFirestore.id);
        }
      });
    }
  } catch (error) {
    console.log('ℹ Firestore no disponible, intentando leer desde localStorage...');
    
    // Fallback a localStorage
    try {
      const storageKey = `turnos_${currentBarberId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const turnosLocales = JSON.parse(stored);
        turnosLocales.forEach((turno) => {
          if (!turnos.find(t => t.id === turno.id)) {
            turnos.push(turno);
            console.log('✓ Turno cargado desde localStorage:', turno.id);
          }
        });
      }
    } catch (e) {
      console.log('ℹ localStorage no disponible:', e.message);
    }
  }
}

async function saveTurno(turno) {
  try {
    console.log('💾 Guardando turno:', turno);
    console.log('Barbero ID:', currentBarberId);
    
    if (!isDatabaseReady()) {
      console.warn('⚠ Firebase no disponible, guardando en localStorage');
      saveTurnoToLocalStorage(turno);
      renderUI();
      return;
    }

    const turnoId = turno.id || Date.now().toString();
    const db = getDatabase();
    const dbRef = db.ref(`turnos/${currentBarberId}/${turnoId}`);
    
    console.log('📤 Enviando a Firebase:', `turnos/${currentBarberId}/${turnoId}`);
    
    await dbRef.set({
      ...turno,
      id: turnoId,
      updatedAt: new Date().toISOString()
    });

    console.log('✓ Turno guardado en Firebase:', turnoId);
  } catch (error) {
    console.error('❌ Error guardando turno:', error);
    saveTurnoToLocalStorage(turno);
    renderUI();
  }
}

async function deleteTurnoFromDB(turnoId) {
  try {
    if (!isDatabaseReady()) {
      console.warn('⚠ Firebase no disponible, eliminando de localStorage');
      deleteTurnoFromLocalStorage(turnoId);
      return;
    }

    const db = getDatabase();
    await db.ref(`turnos/${currentBarberId}/${turnoId}`).remove();
    console.log('✓ Turno eliminado de Firebase:', turnoId);
  } catch (error) {
    console.error('❌ Error eliminando turno:', error);
    deleteTurnoFromLocalStorage(turnoId);
  }
}

// ===============================
// FALLBACK A LOCALSTORAGE
// ===============================

function saveTurnoToLocalStorage(turno) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let turnos = stored ? JSON.parse(stored) : [];
  
  const index = turnos.findIndex(t => t.id === turno.id);
  if (index !== -1) {
    turnos[index] = turno;
  } else {
    turnos.push(turno);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
}

function loadTurnosFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  turnos = stored ? JSON.parse(stored) : [];
}

function deleteTurnoFromLocalStorage(turnoId) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let turnos = stored ? JSON.parse(stored) : [];
  turnos = turnos.filter(t => t.id !== turnoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
}

// ===============================
// RENDERIZACIÓN - UI
// ===============================
function renderUI() {
  // Normalizar nombres de servicios en todos los turnos
  turnos.forEach(turno => {
    if (turno.servicio) {
      turno.servicio = normalizarNombresServicios(turno.servicio);
    }
  });
  
  // Actualizar el calendario y los turnos visibles
  renderCalendarMonth();
  updateSelectedDayInfo();
  renderTurnosList();
  updateStats();
  actualizarKPIs();
  
  // Inicializar gráficos solo si está disponible Chart.js
  if (typeof Chart !== 'undefined' && document.getElementById('turnosChart')) {
    console.log('🎨 Inicializando gráficos en renderUI...');
    inicializarGraficos();
    renderIngresosYClientes();
  }
}

// ===============================
// CALENDARIO - Nueva estructura
// ===============================
let calendarCurrentDate = new Date();
let calendarSelectedDate = new Date();

function initCalendar() {
  renderCalendarMonth();
  setupCalendarEventListeners();
  updateSelectedDayInfo();
}

function renderCalendarMonth() {
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();
  
  // Actualizar título
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  document.getElementById('calendar-month-title').textContent = 
    `${monthNames[month]} ${year}`;
  
  // Obtener primer día del mes
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  
  // Días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = createCalendarDayElement(day, true);
    grid.appendChild(dayEl);
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = createCalendarDayElement(day, false);
    grid.appendChild(dayEl);
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - (firstDay + daysInMonth);
  for (let day = 1; day <= remainingDays; day++) {
    const dayEl = createCalendarDayElement(day, true);
    grid.appendChild(dayEl);
  }
}

function createCalendarDayElement(day, otherMonth) {
  const element = document.createElement('div');
  element.className = 'calendar-day';
  
  if (otherMonth) {
    element.classList.add('other-month');
    element.textContent = day;
  } else {
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const date = new Date(year, month, day);
    const today = new Date();
    
    // Crear estructura para el día con contador
    const dayContent = document.createElement('div');
    dayContent.className = 'calendar-day-content';
    
    const dayNumber = document.createElement('span');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayContent.appendChild(dayNumber);
    
    // Verificar si tiene turnos y agregar contador
    const shiftsCount = countShiftsForDate(date);
    if (shiftsCount > 0) {
      const shiftsIndicator = document.createElement('span');
      shiftsIndicator.className = 'calendar-shifts-indicator';
      shiftsIndicator.textContent = shiftsCount;
      dayContent.appendChild(shiftsIndicator);
      element.classList.add('has-shifts');
    }
    
    element.appendChild(dayContent);
    
    // Verificar si es hoy
    if (date.toDateString() === today.toDateString()) {
      element.classList.add('today');
    }
    
    // Verificar si está seleccionado
    if (date.toDateString() === calendarSelectedDate.toDateString()) {
      element.classList.add('selected');
    }
    
    element.addEventListener('click', () => selectCalendarDate(date));
  }
  
  return element;
}

function selectCalendarDate(date) {
  calendarSelectedDate = new Date(date);
  renderCalendarMonth();
  updateSelectedDayInfo();
}

function countShiftsForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return turnos.filter(t => t.fecha === dateStr).length;
}

function updateSelectedDayInfo() {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateFormatted = calendarSelectedDate.toLocaleDateString('es-ES', options);
  document.getElementById('selected-day-title').textContent = 
    dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  
  // Obtener turnos del día
  const year = calendarSelectedDate.getFullYear();
  const month = String(calendarSelectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(calendarSelectedDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const dayShifts = turnos.filter(t => t.fecha === dateStr).sort((a, b) => a.hora.localeCompare(b.hora));
  
  document.getElementById('selected-day-info').textContent = 
    `${dayShifts.length} ${dayShifts.length === 1 ? 'turno' : 'turnos'}`;
  
  // Renderizar turnos
  const shiftsContainer = document.getElementById('calendar-shifts');
  shiftsContainer.innerHTML = '';
  
  if (dayShifts.length === 0) {
    shiftsContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.9rem;">No hay turnos</p>';
  } else {
    dayShifts.forEach(turno => {
      const shiftEl = document.createElement('div');
      shiftEl.className = 'calendar-shift-item';
      shiftEl.innerHTML = `
        <div class="shift-hour">${turno.hora}</div>
        <div class="shift-client">${turno.cliente}</div>
        <div class="shift-service">${turno.servicio}</div>
      `;
      shiftsContainer.appendChild(shiftEl);
    });
  }
}

function setupCalendarEventListeners() {
  document.getElementById('calendar-prev').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendarMonth();
  });
  
  document.getElementById('calendar-next').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendarMonth();
  });
}

// ===============================
// MODAL DE TURNO
// ===============================
const modal = document.getElementById('reservar-modal');
const formReservar = document.getElementById('reservar-form');
const reservarClose = document.querySelector('.reservar-close');
const reservarCancel = document.querySelector('.reservar-cancel');

function openModal(turno = null) {
  currentEditingId = turno?.id || null;
  document.getElementById('reservar-title').textContent = turno ? 'Editar Turno' : 'Nuevo Turno';

  // Cargar barberos
  loadBarberos();
  
  // Cargar servicios
  loadServicios();

  if (turno) {
    document.getElementById('res-nombre').value = turno.cliente;
    document.getElementById('res-telefono').value = turno.telefono || '';
    document.getElementById('res-fecha').value = turno.fecha;
    document.getElementById('res-hora').value = turno.hora;
    
    // Llenar servicios
    if (turno.servicio) {
      document.getElementById('res-servicios').value = turno.servicio;
    }
  } else {
    // Pre-llenar con la fecha seleccionada
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    document.getElementById('res-fecha').value = `${year}-${month}-${day}`;
    formReservar.reset();
  }

  // Cargar horarios
  loadHorarios();

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('active');
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('active');
  formReservar.reset();
  currentEditingId = null;
}

function loadBarberos() {
  const select = document.getElementById('res-barbero');
  const barberos = ['Diego', 'Martin', 'Leo'];
  select.innerHTML = barberos.map(b => `<option value="${b}">${b}</option>`).join('');
}

function loadServicios() {
  const container = document.getElementById('res-servicios-pills');
  const servicios = Object.keys(PRECIOS_DEFECTO);
  container.innerHTML = servicios.map(s => `
    <button type="button" class="pill servicio-pill" data-servicio="${s}">
      ${s}
    </button>
  `).join('');
  
  // Agregar event listeners
  container.querySelectorAll('.servicio-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      pill.classList.toggle('active');
      actualizarServiciosSeleccionados();
    });
  });
}

async function loadHorarios() {
  const container = document.getElementById('res-horarios-pills');
  const barberoSelect = document.getElementById('res-barbero');
  const fechaInput = document.getElementById('res-fecha');
  
  const barberoNombre = barberoSelect.value;
  const barbero = barberoNombre.replace(/\s+/g, '_').toLowerCase();
  const fecha = fechaInput.value;
  
  container.innerHTML = '';
  
  if (!barbero || !fecha) {
    container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Selecciona barbero y fecha primero</p>';
    return;
  }

  // Generar horarios de 10:00 a 21:00 cada 30 min
  const horarios = [];
  for (let h = 10; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  // Obtener horarios ya ocupados desde el array de turnos
  const horariosOcupados = turnos
    .filter(t => {
      const turnoBarberoProcesado = t.cliente ? 'diego' : 'diego'; // Por defecto todos son de Diego en dashboard
      return turnoBarberoProcesado === barbero && t.fecha === fecha;
    })
    .map(t => t.hora);

  console.log('Horarios ocupados para', barberoNombre, 'en', fecha, ':', horariosOcupados);

  // Crear pills de horarios
  horarios.forEach(hora => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'horario-pill';
    pill.textContent = hora;
    
    const isOccupied = horariosOcupados.includes(hora);
    if (isOccupied) {
      pill.classList.add('disabled');
      pill.title = 'Este horario ya está ocupado';
      pill.style.opacity = '0.5';
      pill.style.cursor = 'not-allowed';
    }
    
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isOccupied) {
        document.querySelectorAll('.horario-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        document.getElementById('res-hora').value = hora;
      }
    });
    
    container.appendChild(pill);
  });
}

function actualizarServiciosSeleccionados() {
  const servicios = Array.from(document.querySelectorAll('.servicio-pill.active'))
    .map(p => p.dataset.servicio)
    .join(', ');
  document.getElementById('res-servicios').value = servicios;
}

reservarClose.addEventListener('click', closeModal);
reservarCancel.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Event listeners para regenerar horarios
document.getElementById('res-barbero').addEventListener('change', loadHorarios);
document.getElementById('res-fecha').addEventListener('change', loadHorarios);

formReservar.addEventListener('submit', function(e) {
  e.preventDefault();

  // Si es un turno nuevo, estado es siempre "pendiente"
  // Si es edición, mantiene el estado anterior
  let estado = 'pendiente';
  if (currentEditingId) {
    const turnoExistente = turnos.find(t => t.id === currentEditingId);
    if (turnoExistente) {
      estado = turnoExistente.estado;
    }
  }

  const turno = {
    id: currentEditingId || Date.now().toString(),
    fecha: document.getElementById('res-fecha').value,
    hora: document.getElementById('res-hora').value,
    cliente: document.getElementById('res-nombre').value,
    telefono: document.getElementById('res-telefono').value,
    servicio: document.getElementById('res-servicios').value,
    duracion: 30,
    precio: 0,
    notas: '',
    estado: estado,
  };

  saveTurno(turno);
  closeModal();
});

// ===============================
// GESTIÓN DE TURNOS
// ===============================
function editTurno(turno) {
  openModal(turno);
}

function deleteTurno(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
    deleteTurnoFromDB(id);
  }
}

// ===============================
// CÁLCULO DE PRECIOS
// ===============================
function calcularPrecioTurno(turno) {
  if (!turno.servicio) return 0;
  
  const servicios = turno.servicio.split(',').map(s => s.trim()).filter(s => s);
  let precioTotal = 0;
  
  servicios.forEach(servicio => {
    // Buscar en precios cargados
    if (precios[servicio]) {
      precioTotal += precios[servicio];
    } else if (PRECIOS_DEFECTO[servicio]) {
      precioTotal += PRECIOS_DEFECTO[servicio];
    }
  });
  
  return precioTotal;
}

// ===============================
// TABLA DE TURNOS
// ===============================
function renderTurnosList() {
  console.log('🔄 renderTurnosList() - Turnos disponibles:', turnos.length);
  
  const turnosList = document.getElementById('turnos-list');
  if (!turnosList) {
    console.error('❌ Elemento turnos-list no encontrado');
    return;
  }
  
  turnosList.innerHTML = '';

  // Ordenar turnos por fecha y hora
  const sortedTurnos = [...turnos].sort((a, b) => {
    const dateCompare = a.fecha.localeCompare(b.fecha);
    if (dateCompare !== 0) return dateCompare;
    return a.hora.localeCompare(b.hora);
  });

  if (sortedTurnos.length === 0) {
    console.log('ℹ No hay turnos registrados');
    turnosList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999999;">No hay turnos registrados</div>';
    return;
  }

  console.log('✓ Renderizando', sortedTurnos.length, 'turnos');

  sortedTurnos.forEach(turno => {
    const card = document.createElement('div');
    card.className = 'turno-card';
    
    // Formatear fecha
    const [year, month, day] = turno.fecha.split('-');
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toLowerCase();
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
    
    let statusClass = 'pendiente';
    let statusText = 'Pendiente';
    
    if (turno.estado === 'confirmado') {
      statusClass = 'confirmado';
      statusText = 'Confirmado';
    } else if (turno.estado === 'completado') {
      statusClass = 'completado';
      statusText = 'Completado';
    } else if (turno.estado === 'rechazado') {
      statusClass = 'rechazado';
      statusText = 'Rechazado';
    }
    
    card.innerHTML = `
      <div class="turno-time">
        <div class="turno-date">${dayName}, ${dayNum} ${monthName}</div>
        <div class="turno-hour">${turno.hora}</div>
      </div>
      
      <div class="turno-info">
        <div class="turno-client">
          <i class="bi bi-person-fill"></i>
          <span class="turno-client-name">${turno.cliente}</span>
        </div>
        <div class="turno-service">
          <i class="bi bi-scissors"></i>
          <span>${turno.servicio}</span>
        </div>
        <div class="turno-phone">
          <i class="bi bi-telephone-fill"></i>
          <span>${turno.telefono || 'No registrado'}</span>
        </div>
      </div>
      
      <div class="turno-price">
        <div class="turno-price-label">Precio</div>
        <div class="turno-price-value">$${calcularPrecioTurno(turno)}</div>
      </div>
      
      <div class="turno-actions">
        <span class="turno-status ${statusClass}">${statusText}</span>
        <button class="turno-btn turno-btn--confirm" title="Confirmar" onclick="confirmarTurno('${turno.id}')">
          <i class="bi bi-check-lg"></i>
        </button>
        <button class="turno-btn turno-btn--reschedule" title="Reprogramar" onclick="openRescheduleModal('${turno.id}')">
          <i class="bi bi-clock-history"></i>
        </button>
        <button class="turno-btn turno-btn--delete" title="${turno.estado === 'rechazado' ? 'Eliminar' : 'Rechazar'}" onclick="${turno.estado === 'rechazado' ? 'deleteTurno' : 'rechazarTurno'}('${turno.id}')">
          <i class="bi bi-${turno.estado === 'rechazado' ? 'trash' : 'x-lg'}"></i>
        </button>
      </div>
    `;
    turnosList.appendChild(card);
  });
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// ===============================
// GRID DE CLIENTES
// ===============================
function renderClientesList() {
  const clientesGrid = document.getElementById('clientes-grid');
  clientesGrid.innerHTML = '';

  // Obtener clientes únicos
  const clientesMap = {};
  turnos.forEach(turno => {
    if (!clientesMap[turno.cliente]) {
      clientesMap[turno.cliente] = {
        nombre: turno.cliente,
        telefono: turno.telefono || 'No registrado',
        email: turno.email || 'No registrado',
        visitas: 0,
        ultimaVisita: null,
      };
    }
    clientesMap[turno.cliente].visitas++;
    if (!clientesMap[turno.cliente].ultimaVisita || turno.fecha > clientesMap[turno.cliente].ultimaVisita) {
      clientesMap[turno.cliente].ultimaVisita = turno.fecha;
    }
  });

  const clientes = Object.values(clientesMap).sort((a, b) => b.visitas - a.visitas);

  if (clientes.length === 0) {
    clientesGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No hay clientes registrados</p>';
  } else {
    clientes.forEach(cliente => {
      const clienteCard = document.createElement('div');
      clienteCard.className = 'cliente-card';
      clienteCard.innerHTML = `
        <h3 class="cliente-name">${cliente.nombre}</h3>
        <div class="cliente-info">
          <i class="bi bi-telephone"></i>
          <span>${cliente.telefono}</span>
        </div>
        <div class="cliente-info">
          <i class="bi bi-calendar-event"></i>
          <span>Última visita: ${cliente.ultimaVisita ? formatDate(cliente.ultimaVisita) : 'No registrada'}</span>
        </div>
        <div class="cliente-visits">
          <span class="cliente-visitas-count">Total visitas: ${cliente.visitas}</span>
        </div>
      `;
      clientesGrid.appendChild(clienteCard);
    });
  }
}

// ===============================
// ESTADÍSTICAS
// ===============================
function updateStats() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Turnos del mes
  const turnosDelMes = turnos.filter(t => {
    const [year, month] = t.fecha.split('-');
    return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1;
  }).length;
  
  // Validar que el elemento existe antes de actualizar
  const statMonthly = document.getElementById('stat-monthly');
  if (statMonthly) statMonthly.textContent = turnosDelMes;

  // Completados este mes
  const completadosEsteMes = turnos.filter(t => {
    const [year, month] = t.fecha.split('-');
    return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1 && t.estado === 'completado';
  }).length;
  
  const statCompleted = document.getElementById('stat-completed');
  if (statCompleted) statCompleted.textContent = completadosEsteMes;

  // Clientes totales
  const clientesTotales = new Set(turnos.map(t => t.cliente)).size;
  
  const statClients = document.getElementById('stat-clients');
  if (statClients) statClients.textContent = clientesTotales;

  // Promedio diario de turnos
  const diasEnMes = new Date(currentYear, currentMonth + 1, 0).getDate();
  const promedioDaily = turnosDelMes > 0 ? Math.round((turnosDelMes / diasEnMes) * 10) / 10 : 0;
  
  const statDaily = document.getElementById('stat-daily-avg');
  if (statDaily) statDaily.textContent = promedioDaily;
}

function actualizarKPIs() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Turnos este mes
  const turnosDelMes = turnos.filter(t => {
    const [year, month] = t.fecha.split('-');
    return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1;
  }).length;
  
  const kpiTurnosMes = document.getElementById('kpi-turnos-mes');
  if (kpiTurnosMes) kpiTurnosMes.textContent = turnosDelMes;

  // Completados este mes
  const completadosEsteMes = turnos.filter(t => {
    const [year, month] = t.fecha.split('-');
    return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1 && t.estado === 'completado';
  }).length;
  
  const kpiCompletados = document.getElementById('kpi-completados');
  if (kpiCompletados) kpiCompletados.textContent = completadosEsteMes;

  // Clientes totales
  const clientesTotales = new Set(turnos.map(t => t.cliente)).size;
  
  const kpiClientes = document.getElementById('kpi-clientes');
  if (kpiClientes) kpiClientes.textContent = clientesTotales;

  // Ingresos este mes
  const ingresosEsteMes = turnos
    .filter(t => {
      const [year, month] = t.fecha.split('-');
      return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1;
    })
    .reduce((total, t) => total + calcularPrecioTurno(t), 0);
  
  const kpiIngresos = document.getElementById('kpi-ingresos');
  if (kpiIngresos) kpiIngresos.textContent = '$' + ingresosEsteMes.toLocaleString('es-CO');
}

// ===============================
// FUNCIÓN DE LOGOUT
// ===============================
function logoutUser() {
  localStorage.removeItem(BARBER_KEY);
  window.location.href = 'index.html';
}

// ===============================
// EVENT LISTENERS
// ===============================
function setupEventListeners() {
  // Botones para abrir modal
  const nuevoturnoBtn = document.getElementById('nuevo-turno-btn');
  if (nuevoturnoBtn) {
    nuevoturnoBtn.addEventListener('click', () => openModal());
  } else {
    console.warn('⚠ Botón "nuevo-turno-btn" no encontrado');
  }

  // Navegación de secciones
  const sidebarLinks = document.querySelectorAll('.sidebar__link');
  console.log('🔗 Sidebar links encontrados:', sidebarLinks.length);
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = link.getAttribute('data-section');
      console.log('📌 Navegando a sección:', sectionName);

      // Remover clase active de todos los links
      document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
      link.classList.add('sidebar__link--active');

      // Ocultar todas las secciones
      document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
      });

      // Cambiar el título según la sección
      const titulos = {
        'calendario': 'Calendario',
        'turnos': 'Turnos',
        'clientes': 'Clientes',
        'estadisticas': 'Estadísticas',
        'precios': 'Precios'
      };
      
      const titleElement = document.getElementById('section-title');
      if (titleElement && titulos[sectionName]) {
        titleElement.textContent = titulos[sectionName];
      }

      // Mostrar la sección seleccionada
      const section = document.getElementById(`${sectionName}-section`);
      if (section) {
        section.classList.add('active');
        console.log('✓ Sección mostrada:', sectionName);

        // Cargar datos específicos de la sección
        if (sectionName === 'calendario') {
          initCalendar();
        } else if (sectionName === 'turnos') {
          renderTurnosList();
        } else if (sectionName === 'clientes') {
          renderClientesList();
        } else if (sectionName === 'estadisticas') {
          console.log('📊 Navegando a estadísticas, turnos cargados:', turnos.length);
          updateStats();
          actualizarKPIs();
          // Inicializar gráficos cuando se muestra la sección
          setTimeout(() => {
            console.log('⏱ Renderizando gráficos e ingresos...');
            inicializarGraficos();
            renderIngresosYClientes();
          }, 200);
        } else if (sectionName === 'precios') {
          renderPreciosList();
        }
      } else {
        console.error('❌ Sección no encontrada:', `${sectionName}-section`);
      }
    });
  });

  // Búsqueda y filtros en turnos
  const searchInput = document.getElementById('search-turnos');
  if (searchInput) {
    searchInput.addEventListener('input', filterTurnos);
  } else {
    console.warn('⚠ Input "search-turnos" no encontrado');
  }
  
  // Filtros de turnos por categoría
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      e.target.classList.add('filter-btn--active');
      filterTurnos();
    });
  });

  // Búsqueda en clientes
  const searchClientes = document.getElementById('search-clientes');
  if (searchClientes) {
    searchClientes.addEventListener('input', filterClientes);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // Cierre de modal al hacer click fuera (usar la variable global modal)
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // ESC para cerrar sesión
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      logoutUser();
    }
  });
}

function filterTurnos() {
  const searchTerm = document.getElementById('search-turnos').value.toLowerCase();
  const activeFilter = document.querySelector('.filter-btn--active')?.getAttribute('data-filter') || '';

  const cards = document.querySelectorAll('.turno-card');
  const today = new Date().toISOString().split('T')[0];

  cards.forEach(card => {
    const clienteName = card.querySelector('.turno-client-name').textContent.toLowerCase();
    const serviceText = card.querySelector('.turno-service').textContent.toLowerCase();
    const statusText = card.querySelector('.turno-status').textContent.toLowerCase();
    const dateText = card.querySelector('.turno-date').textContent;
    
    // Búsqueda por texto
    const matchesSearch = clienteName.includes(searchTerm) || serviceText.includes(searchTerm);
    
    // Encontrar el turno correspondiente
    const turnoData = turnos.find(t => t.cliente.toLowerCase() === clienteName);
    
    // Filtro por categoría
    let matchesFilter = true;
    if (activeFilter === 'hoy' && turnoData) {
      matchesFilter = turnoData.fecha === today;
    } else if (activeFilter === 'proximos' && turnoData) {
      matchesFilter = turnoData.fecha > today && turnoData.estado === 'confirmado';
    } else if (activeFilter === 'pasados' && turnoData) {
      matchesFilter = turnoData.fecha < today || statusText.includes('completado');
    }
    
    card.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });
}

function filterClientes() {
  const searchTerm = document.getElementById('search-clientes').value.toLowerCase();
  const cards = document.querySelectorAll('.cliente-card');
  cards.forEach(card => {
    const nombre = card.querySelector('.cliente-name').textContent.toLowerCase();
    const matches = nombre.includes(searchTerm);
    card.style.display = matches ? '' : 'none';
  });
}

// ===============================
// GESTIÓN DE PRECIOS
// ===============================
function loadPrecios() {
  // Cargar precios de localStorage primero
  const stored = localStorage.getItem(`${PRECIOS_KEY}_${currentBarberId}`);
  precios = stored ? JSON.parse(stored) : { ...PRECIOS_DEFECTO };
  console.log('✓ Precios cargados:', precios);
}

function savePrecios() {
  localStorage.setItem(`${PRECIOS_KEY}_${currentBarberId}`, JSON.stringify(precios));
  console.log('✓ Precios guardados');
}

function renderPreciosList() {
  const grid = document.getElementById('precios-grid');
  if (!grid) return;
  
  grid.innerHTML = '';

  Object.entries(precios).forEach(([servicio, precio]) => {
    const card = document.createElement('div');
    card.className = 'precio-card';
    card.id = `precio-card-${servicio}`;
    card.innerHTML = `
      <div class="precio-card-header">
        <div class="precio-card-icon">
          <i class="bi bi-tag"></i>
        </div>
        <h3 class="precio-card-name">${servicio}</h3>
      </div>
      <div class="precio-card-separator"></div>
      <div class="precio-card-body">
        <div>
          <p class="precio-card-label">Precio</p>
          <p class="precio-card-amount">$${precio.toLocaleString('es-CO')}</p>
        </div>
      </div>
      <div class="precio-card-actions">
        <button class="precio-card-btn precio-card-btn--editar" onclick="editarPrecio('${servicio}')">
          <i class="bi bi-pencil"></i> Editar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function editarPrecio(servicio) {
  const grid = document.getElementById('precios-grid');
  if (!grid) return;

  const precioActual = precios[servicio];
  const card = document.createElement('div');
  card.className = 'precio-card';
  card.id = `precio-card-${servicio}`;
  card.innerHTML = `
    <div class="precio-card-header">
      <div class="precio-card-icon">
        <i class="bi bi-tag"></i>
      </div>
      <h3 class="precio-card-name">${servicio}</h3>
    </div>
    <div class="precio-card-separator"></div>
    <div class="precio-card-body">
      <div style="flex: 1;">
        <label class="precio-card-label" style="display: block; margin-bottom: 0.5rem;">Nuevo Precio</label>
        <input 
          type="number" 
          class="precio-edit-input" 
          id="precio-input-${servicio}" 
          value="${precioActual}" 
          min="0" 
          step="100"
          style="width: 100%; padding: 0.65rem; background-color: #1f1f1f; border: 1px solid #2a2a2a; color: #ffffff; border-radius: 6px; font-size: 1rem;"
        >
      </div>
    </div>
    <div class="precio-card-actions">
      <button class="precio-card-btn precio-card-btn--editar" onclick="guardarPrecio('${servicio}')">
        <i class="bi bi-check"></i> Guardar
      </button>
      <button class="precio-card-btn precio-card-btn--eliminar" onclick="cancelarEdicionPrecio()">
        <i class="bi bi-x"></i> Cancelar
      </button>
    </div>
  `;

  // Buscar y reemplazar la tarjeta existente
  const cardExistente = document.getElementById(`precio-card-${servicio}`);
  if (cardExistente) {
    cardExistente.replaceWith(card);
  }

  // Enfocar el input
  setTimeout(() => {
    const input = document.getElementById(`precio-input-${servicio}`);
    if (input) input.focus();
  }, 0);
}

function guardarPrecio(servicio) {
  const input = document.getElementById(`precio-input-${servicio}`);
  const nuevoPrecio = parseFloat(input.value);

  if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    alert('Ingresa un precio válido');
    return;
  }

  precios[servicio] = nuevoPrecio;
  savePrecios();
  renderPreciosList();
}

function cancelarEdicionPrecio() {
  renderPreciosList();
}

function updateServiciosSelect() {
  const pillsContainer = document.getElementById('servicio-pills');
  const inputServicio = document.getElementById('turno-servicio');
  
  if (!pillsContainer) return;
  
  pillsContainer.innerHTML = '';
  let selectedServicios = [];
  
  // Si hay servicios previos seleccionados, mantenerlos
  if (inputServicio.value) {
    selectedServicios = inputServicio.value.split(',').map(s => s.trim());
  }
  
  Object.keys(precios).forEach(servicio => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'servicio-pill';
    pill.textContent = servicio;
    
    if (selectedServicios.includes(servicio)) {
      pill.classList.add('active');
    }
    
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      pill.classList.toggle('active');
      
      // Actualizar el valor oculto
      const activePills = pillsContainer.querySelectorAll('.servicio-pill.active');
      const servicios = Array.from(activePills).map(p => p.textContent);
      inputServicio.value = servicios.join(', ');
      
      // Actualizar precio
      actualizarPrecioDesdeSeleccion();
    });
    
    pillsContainer.appendChild(pill);
  });
}

function actualizarPrecioDesdeSeleccion() {
  const inputServicio = document.getElementById('turno-servicio');
  const inputPrecio = document.getElementById('turno-precio');
  
  const servicios = inputServicio.value.split(',').map(s => s.trim()).filter(s => s);
  
  if (servicios.length > 0) {
    let precioTotal = 0;
    servicios.forEach(servicio => {
      if (precios[servicio]) {
        precioTotal += precios[servicio];
      }
    });
    inputPrecio.value = precioTotal;
  } else {
    inputPrecio.value = '';
  }
}

function actualizarPrecioAutomatico() {
  // La actualización del precio se maneja ahora en actualizarPrecioDesdeSeleccion()
  // que se llama desde los eventos click de las pills
}

// ===============================
// CONFIRMACIÓN DIRECTA DE TURNO
// ===============================
function confirmarTurno(turnoId) {
  const turno = turnos.find(t => t.id === turnoId);
  if (!turno) return;
  
  turno.estado = 'confirmado';
  
  // Guardar en BD
  saveTurno(turno);
  
  // Generar y enviar WhatsApp
  const mensaje = generarMensajeEstado(turno, 'confirmado');
  enviarWhatsApp(turno.telefono, mensaje);
  
  // Mostrar confirmación
  mostrarNotificacionExito('Turno confirmado ✓');
  
  renderTurnosList();
}

function rechazarTurno(turnoId) {
  const turno = turnos.find(t => t.id === turnoId);
  if (!turno) return;
  
  turno.estado = 'rechazado';
  
  // Guardar en BD
  saveTurno(turno);
  
  // Generar y enviar WhatsApp
  const mensaje = generarMensajeEstado(turno, 'rechazado');
  enviarWhatsApp(turno.telefono, mensaje);
  
  // Mostrar confirmación
  mostrarNotificacionExito('Turno rechazado ✗');
  
  renderTurnosList();
}

function confirmarTurnoDirecto(turnoId, aceptado) {
  const turno = turnos.find(t => t.id === turnoId);
  if (!turno) return;
  
  const nuevoEstado = aceptado ? 'confirmado' : 'rechazado';
  turno.estado = nuevoEstado;
  
  // Guardar en BD
  saveTurno(turno);
  
  // Generar y enviar WhatsApp
  const mensaje = generarMensajeEstado(turno, nuevoEstado);
  enviarWhatsApp(turno.telefono, mensaje);
  
  // Mostrar confirmación
  const textoNotif = aceptado ? 'Turno confirmado ✓' : 'Turno rechazado ✗';
  mostrarNotificacionExito(textoNotif);
  
  renderTurnosList();
}

// ===============================
// MODAL DE REPROGRAMACIÓN DE TURNO
// ===============================
function openRescheduleModal(turnoId) {
  const turno = turnos.find(t => t.id === turnoId);
  if (!turno) return;
  
  const modal = document.getElementById('modal-reschedule-turno');
  if (!modal) return;
  
  // Llenar datos
  document.getElementById('reschedule-turno-cliente').textContent = turno.cliente;
  document.getElementById('reschedule-fecha').value = turno.fecha;
  document.getElementById('reschedule-turno-telefono').textContent = turno.telefono || 'No registrado';
  
  // Guardar ID en atributo data
  modal.dataset.turnoId = turnoId;
  modal.classList.add('active');
  
  // Cargar horarios disponibles
  loadRescheduleHorarios();
}

function loadRescheduleHorarios() {
  const container = document.getElementById('reschedule-horarios-pills');
  const fechaInput = document.getElementById('reschedule-fecha');
  const fecha = fechaInput.value;
  
  if (!fecha) {
    container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Selecciona una fecha primero</p>';
    return;
  }

  // Generar horarios de 10:00 a 21:00 cada 30 min
  const horarios = [];
  for (let h = 10; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  // Obtener horarios ya ocupados para la fecha seleccionada
  const horariosOcupados = turnos
    .filter(t => t.fecha === fecha)
    .map(t => t.hora);

  console.log('Horarios ocupados para', fecha, ':', horariosOcupados);

  // Crear pills de horarios
  container.innerHTML = '';
  horarios.forEach(hora => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'reschedule-horario-pill';
    pill.textContent = hora;
    
    const isOccupied = horariosOcupados.includes(hora);
    if (isOccupied) {
      pill.classList.add('disabled');
      pill.title = 'Este horario ya está ocupado';
      pill.disabled = true;
    }
    
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isOccupied) {
        document.querySelectorAll('.reschedule-horario-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        document.getElementById('reschedule-hora').value = hora;
      }
    });
    
    container.appendChild(pill);
  });
}

function closeRescheduleModal() {
  const modal = document.getElementById('modal-reschedule-turno');
  if (modal) {
    modal.classList.remove('active');
    // Limpiar datos
    document.getElementById('reschedule-fecha').value = '';
    document.getElementById('reschedule-hora').value = '';
    document.getElementById('reschedule-horarios-pills').innerHTML = '';
  }
}

// Event listener para cerrar modal al hacer click fuera de él
document.addEventListener('DOMContentLoaded', () => {
  const modalReschedule = document.getElementById('modal-reschedule-turno');
  if (modalReschedule) {
    modalReschedule.addEventListener('click', (e) => {
      // Cerrar si se hace click en el fondo (fuera del contenedor)
      if (e.target === modalReschedule) {
        closeRescheduleModal();
      }
    });
  }
});

function reprogramarTurno() {
  const modal = document.getElementById('modal-reschedule-turno');
  const turnoId = modal.dataset.turnoId;
  const turno = turnos.find(t => t.id === turnoId);
  
  if (!turno) return;
  
  const nuevaFecha = document.getElementById('reschedule-fecha').value;
  const nuevaHora = document.getElementById('reschedule-hora').value;
  
  if (!nuevaFecha) {
    alert('Por favor selecciona una fecha');
    return;
  }
  
  if (!nuevaHora) {
    alert('Por favor selecciona un horario disponible');
    return;
  }
  
  // Actualizar turno
  turno.fecha = nuevaFecha;
  turno.hora = nuevaHora;
  turno.estado = 'confirmado';
  
  // Guardar en BD
  saveTurno(turno);
  
  // Enviar WhatsApp
  const mensaje = generarMensajeReprogramacion(turno);
  enviarWhatsApp(turno.telefono, mensaje);
  
  mostrarNotificacionExito('Turno reprogramado');
  closeRescheduleModal();
  renderTurnosList();
}

// ===============================
// FUNCIONES DE MENSAJES Y WHATSAPP
// ===============================
function generarMensajeEstado(turno, estado) {
  const fecha = formatDate(turno.fecha);
  const hora = turno.hora;
  const barbero = currentBarberId.replace(/_/g, ' ').toUpperCase();
  
  if (estado === 'confirmado') {
    return `🟢 *TURNO CONFIRMADO*\n\nHola ${turno.cliente},\n\nTu turno ha sido confirmado:\n\n📅 ${fecha}\n🕐 ${hora}\n💈 Servicio: ${turno.servicio}\n👨‍💼 Barbero: ${barbero}\n\n¡Te esperamos! 😊`;
  } else if (estado === 'rechazado') {
    return `🔴 *TURNO RECHAZADO*\n\nHola ${turno.cliente},\n\nLamentablemente no podemos confirmar tu turno en:\n📅 ${fecha}\n🕐 ${hora}\n\nPor favor intenta con otra fecha u hora disponible.\n\nContacta con nosotros si tienes dudas.\n\n¡Gracias! 😊`;
  }
}

function generarMensajeReprogramacion(turno) {
  const fecha = formatDate(turno.fecha);
  const hora = turno.hora;
  const barbero = currentBarberId.replace(/_/g, ' ').toUpperCase();
  
  return `🔄 *TURNO REPROGRAMADO*\n\nHola ${turno.cliente},\n\nTu turno ha sido reprogramado a:\n\n📅 ${fecha}\n🕐 ${hora}\n💈 Servicio: ${turno.servicio}\n👨‍💼 Barbero: ${barbero}\n\n¡Confirmamos tu nueva cita! 😊`;
}

function enviarWhatsApp(telefono, mensaje) {
  if (!telefono) {
    console.warn('⚠️ Teléfono no disponible para enviar WhatsApp');
    return;
  }
  
  // Normalizar número telefónico
  let telefonoNormalizado = telefono.replace(/[^0-9]/g, '');
  
  // Si comienza con 0, reemplazar por código de país
  if (telefonoNormalizado.startsWith('0')) {
    telefonoNormalizado = '54' + telefonoNormalizado.substring(1);
  } else if (!telefonoNormalizado.startsWith('54')) {
    // Si no tiene código de país, asumir Argentina
    if (telefonoNormalizado.length === 10) {
      telefonoNormalizado = '54' + telefonoNormalizado;
    }
  }
  
  const encoded = encodeURIComponent(mensaje);
  const whatsappUrl = `https://wa.me/${telefonoNormalizado}?text=${encoded}`;
  
  // Abrir WhatsApp en nueva pestaña
  window.open(whatsappUrl, '_blank', 'width=600,height=400');
  
  console.log('📱 Abriendo WhatsApp para:', telefonoNormalizado);
}

function mostrarNotificacionExito(mensaje) {
  // Crear notificación temporal
  const notif = document.createElement('div');
  notif.className = 'notification success';
  notif.textContent = mensaje;
  
  const style = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4a9d6f 0%, #3a8d5f 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInNotif 0.3s ease;
  `;
  
  notif.setAttribute('style', style);
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOutNotif 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ===============================
// GRÁFICOS CON CHART.JS
// ===============================
let turnosChartInstance = null;
let serviciosChartInstance = null;

function inicializarGraficos() {
  console.log('📊 Inicializando gráficos...');
  console.log('Total turnos disponibles:', turnos.length);
  
  // Verificar que Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js no está cargado');
    return;
  }
  
  generarGraficoTurnos();
  generarGraficoServicios();
}

function generarGraficoTurnos() {
  const ctx = document.getElementById('turnosChart');
  if (!ctx) {
    console.error('❌ Elemento turnosChart no encontrado');
    return;
  }

  // Calcular turnos por día de la semana
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const turnosPorDia = [0, 0, 0, 0, 0, 0, 0];

  turnos.forEach(turno => {
    const fecha = new Date(turno.fecha);
    const dia = fecha.getDay();
    turnosPorDia[dia]++;
  });

  console.log('📊 Gráfico de turnos - Datos:', turnosPorDia);

  // Destruir gráfico anterior si existe
  if (turnosChartInstance) {
    turnosChartInstance.destroy();
  }

  turnosChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: diasSemana,
      datasets: [{
        label: 'Turnos',
        data: turnosPorDia,
        backgroundColor: [
          '#D4A574',
          '#D4A574',
          '#D4A574',
          '#D4A574',
          '#D4A574',
          '#D4A574',
          '#D4A574'
        ],
        borderColor: '#8B6F47',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: '#C9945C',
        maxBarThickness: 50
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(...turnosPorDia, 5),
          ticks: {
            stepSize: 1,
            color: '#9CA3AF'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  });
}

function generarGraficoServicios() {
  const ctx = document.getElementById('serviciosChart');
  if (!ctx) {
    console.error('❌ Elemento serviciosChart no encontrado');
    return;
  }

  // Contar servicios más populares
  const serviciosConteo = {};
  turnos.forEach(turno => {
    const servicio = turno.servicio || 'Otros';
    serviciosConteo[servicio] = (serviciosConteo[servicio] || 0) + 1;
  });

  const servicios = Object.keys(serviciosConteo);
  const conteos = Object.values(serviciosConteo);

  console.log('📊 Gráfico de servicios - Datos:', servicios, conteos);

  // Colores para la dona
  const colores = [
    '#D4A574',
    '#8B6F47',
    '#A0826D',
    '#C9945C',
    '#B8956A',
    '#9D8659'
  ];

  // Destruir gráfico anterior si existe
  if (serviciosChartInstance) {
    serviciosChartInstance.destroy();
  }

  serviciosChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: servicios,
      datasets: [{
        data: conteos,
        backgroundColor: colores.slice(0, servicios.length),
        borderColor: '#1F2937',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#9CA3AF',
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

// ===============================
// INGRESOS Y CLIENTES FRECUENTES
// ===============================
let currentIngresosPeriod = 'month';

function renderIngresosYClientes() {
  console.log('📈 Renderizando ingresos y clientes...');
  renderIngresos();
  renderTopClientes();
  setupIngresosFilters();
}

function setupIngresosFilters() {
  const filterBtns = document.querySelectorAll('[data-period]');
  console.log('🔘 Filtros de ingresos encontrados:', filterBtns.length);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('filter-btn--active'));
      e.target.classList.add('filter-btn--active');
      currentIngresosPeriod = e.target.getAttribute('data-period');
      console.log('📊 Periodo cambiado a:', currentIngresosPeriod);
      renderIngresos();
    });
  });
}

function renderIngresos() {
  const container = document.getElementById('ingresosGrid');
  if (!container) {
    console.error('❌ No se encontró elemento ingresosGrid');
    return;
  }
  
  container.innerHTML = '';
  
  const ingresosData = calcularIngresos(currentIngresosPeriod);
  console.log('📊 Ingresos calculados:', ingresosData.length, 'periodos');
  
  if (ingresosData.length === 0) {
    container.innerHTML = '<tr><td colspan="2" style="text-align: center; padding: 2rem; color: #828181;">No hay datos</td></tr>';
    return;
  }
  
  ingresosData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="ingreso-periodo">${item.label}</td>
      <td style="text-align: right;"><span class="ingreso-valor">$${item.cantidad.toLocaleString('es-CO')}</span></td>
    `;
    container.appendChild(row);
  });
}

function calcularIngresos(periodo) {
  console.log('💰 Calculando ingresos para periodo:', periodo, 'Turnos:', turnos.length);
  
  const ingresos = {};
  
  turnos.forEach(turno => {
    const fecha = new Date(turno.fecha);
    let key;
    
    if (periodo === 'month') {
      key = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    } else {
      const week = Math.ceil((fecha.getDate()) / 7);
      key = `Semana ${week}`;
    }
    
    const precio = calcularPrecioTurno(turno);
    ingresos[key] = (ingresos[key] || 0) + precio;
  });
  
  return Object.entries(ingresos).map(([label, cantidad]) => ({
    label,
    cantidad
  })).sort((a, b) => b.cantidad - a.cantidad);
}

function renderTopClientes() {
  const container = document.getElementById('topClientsList');
  if (!container) {
    console.error('❌ No se encontró elemento topClientsList');
    return;
  }
  
  container.innerHTML = '';
  
  const clientesFrequencia = {};
  turnos.forEach(turno => {
    clientesFrequencia[turno.cliente] = (clientesFrequencia[turno.cliente] || 0) + 1;
  });
  
  const topClientes = Object.entries(clientesFrequencia)
    .map(([nombre, visitas]) => ({ nombre, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 5);
  
  console.log('👥 Top clientes:', topClientes.length, 'clientes');
  
  if (topClientes.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #828181; padding: 2rem;">No hay datos de clientes</p>';
    return;
  }
  
  topClientes.forEach((cliente, index) => {
    const item = document.createElement('div');
    item.className = 'top-client-item';
    item.innerHTML = `
      <div class="top-client-rank">${index + 1}</div>
      <div class="top-client-info">
        <p class="top-client-name">${cliente.nombre}</p>
      </div>
      <p class="top-client-visits">${cliente.visitas} visitas</p>
    `;
    container.appendChild(item);
  });
}

