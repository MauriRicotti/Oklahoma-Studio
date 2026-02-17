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
let previousBarberId = null; // Para detectar cambios de barbero
let precios = {};
let newTurnosCount = 0; // Contador de turnos nuevos
let turnosLoaded = false; // Flag para saber si ya cargamos los turnos iniciales
const BARBER_KEY = 'barberiaShop_currentBarber';
const STORAGE_KEY = 'barberiaShop_turnos';
const PRECIOS_KEY = 'barberiaShop_precios';
const PASSWORD_KEY = 'barberiaShop_masterPassword'; // Contraseña global para todos los barberos
const NEW_TURNOS_KEY = 'barberiaShop_newTurnosCount'; // LocalStorage para persistencia
const LAST_BARBER_KEY = 'barberiaShop_lastBarber'; // Para rastrear cambio de barbero

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
// FUNCIÓN PARA FORMATEAR PRECIOS
// ===============================
function formatPrice(amount) {
  // Convierte el número a string con punto como separador de miles
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// ===============================
// BOTÓN FLOTANTE VOLVER ARRIBA - DASHBOARD
// ===============================
const scrollToTopBtnDashboard = document.getElementById('dashboard-scroll-to-top-btn');

function setupDashboardScrollButton() {
  if (!scrollToTopBtnDashboard) {
    console.warn('⚠ Botón scroll-to-top-btn del dashboard no encontrado');
    return;
  }

  // Escuchar cambios en el scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtnDashboard.classList.remove('hide');
      scrollToTopBtnDashboard.classList.add('show');
      scrollToTopBtnDashboard.style.display = 'flex';
    } else {
      scrollToTopBtnDashboard.classList.remove('show');
      scrollToTopBtnDashboard.classList.add('hide');
      // Ocultar después de que termine la animación
      setTimeout(() => {
        if (!scrollToTopBtnDashboard.classList.contains('show')) {
          scrollToTopBtnDashboard.style.display = 'none';
        }
      }, 400);
    }
  }, { passive: true });

  // Evento click para scroll suave al inicio
  scrollToTopBtnDashboard.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===============================
// FUNCIONES DE NOTIFICACIONES
// ===============================
function showNotification(message, duration = 3000) {
  const container = document.getElementById('notifications-container');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(notification);
  
  // Remover después del tiempo especificado
  setTimeout(() => {
    notification.classList.add('hiding');
    setTimeout(() => {
      notification.remove();
    }, 400);
  }, duration);
}

// ===============================
// FUNCIONES PARA BLOQUEAR DISPOSITIVOS MÓVILES
// ===============================
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Detectar móviles y tablets pequeños
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isSmallScreen = window.innerWidth < 768;
  
  return mobileRegex.test(userAgent) || isSmallScreen;
}

function showMobileBlockScreen() {
  // Limpiar el contenido del body
  document.body.innerHTML = `
    <div class="mobile-block-screen">
      <div class="mobile-block-container">
        <div class="mobile-block-icon">
          <i class="bi bi-exclamation-circle-fill"></i>
        </div>
        <h1 class="mobile-block-title">Acceso no permitido</h1>
        <p class="mobile-block-text">El dashboard de gestión de turnos está optimizado para computadoras y tablets. Por favor, accede desde un dispositivo con pantalla más grande.</p>
        <div class="mobile-block-devices">
          <div class="mobile-block-device">
            <i class="bi bi-laptop"></i>
            <span>Computadora</span>
          </div>
          <div class="mobile-block-device">
            <i class="bi bi-tablet-landscape"></i>
            <span>Tablet</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Agregar estilos
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0a;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    
    .mobile-block-screen {
      width: 100%;
      height: 100vh;
      background-color: #0a0a0a;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    
    .mobile-block-container {
      text-align: center;
      max-width: 400px;
    }
    
    .mobile-block-icon {
      font-size: 4rem;
      color: #ff6b6b;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
    }
    
    .mobile-block-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem 0;
    }
    
    .mobile-block-text {
      font-size: 0.95rem;
      color: #999999;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }
    
    .mobile-block-devices {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .mobile-block-device {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .mobile-block-device i {
      font-size: 2.5rem;
      color: #00bcd4;
    }
    
    .mobile-block-device span {
      font-size: 0.85rem;
      color: #888888;
      font-weight: 500;
    }
  `;
  
  document.head.appendChild(style);
}

// ===============================
// FUNCIONES PARA BADGE DE TURNOS NUEVOS
// ===============================
const TURNOS_COUNT_KEY = 'barberiaShop_turnosCount'; // Para rastrear el número de turnos anterior

function loadNewTurnosCount() {
  const saved = localStorage.getItem(NEW_TURNOS_KEY);
  newTurnosCount = saved ? parseInt(saved) : 0;
  updateTurnosBadge();
}

function updateNewTurnosCount(increment = 1) {
  newTurnosCount += increment;
  if (newTurnosCount < 0) newTurnosCount = 0;
  localStorage.setItem(NEW_TURNOS_KEY, newTurnosCount.toString());
  updateTurnosBadge();
}

function updateTurnosBadge() {
  const badge = document.getElementById('turnos-badge');
  if (!badge) return;
  
  if (newTurnosCount > 0) {
    badge.textContent = newTurnosCount > 99 ? '99+' : newTurnosCount;
    badge.classList.remove('sidebar__badge--hidden');
  } else {
    badge.classList.add('sidebar__badge--hidden');
  }
}

function clearNewTurnosCount() {
  newTurnosCount = 0;
  localStorage.setItem(NEW_TURNOS_KEY, '0');
  updateTurnosBadge();
}

function resetNewTurnosCountForBarber() {
  // Resetear el contador cuando se cambia de barbero
  newTurnosCount = 0;
  localStorage.removeItem(NEW_TURNOS_KEY);
  const storageKey = `${TURNOS_COUNT_KEY}_${currentBarberId}`;
  localStorage.removeItem(storageKey);
  
  // También resetear en Firebase
  if (isDatabaseReady()) {
    const db = getDatabase();
    const userDataRef = db.ref(`userData/${currentBarberId}/lastViewedTurnosCount`);
    userDataRef.remove().catch(err => {
      console.warn('⚠ No se pudo limpiar en Firebase:', err);
    });
  }
  
  updateTurnosBadge();
}

function detectNewTurnosOnLoad(currentTurnosCount) {
  // Detectar si hay nuevos turnos comparando con el número anterior
  const storageKey = `${TURNOS_COUNT_KEY}_${currentBarberId}`;
  let previousTurnosCount = localStorage.getItem(storageKey);
  
  // Si no hay registro local, intentar obtener de Firebase
  if (!previousTurnosCount && isDatabaseReady()) {
    const db = getDatabase();
    const userDataRef = db.ref(`userData/${currentBarberId}/lastViewedTurnosCount`);
    
    userDataRef.once('value', (snapshot) => {
      const firebaseCount = snapshot.val();
      if (firebaseCount !== null) {
        const prevCount = parseInt(firebaseCount);
        if (currentTurnosCount > prevCount) {
          const newTurnosAdded = currentTurnosCount - prevCount;
          console.log(`✓ ${newTurnosAdded} turno(s) nuevo(s) detectado(s) desde Firebase`);
          // DESACTIVADO: Notificación de turnos nuevos
          // updateNewTurnosCount(newTurnosAdded);
          // showNotification(`¡${newTurnosAdded} nuevo turno${newTurnosAdded > 1 ? 's' : ''} agregado${newTurnosAdded > 1 ? 's' : ''}!`);
        }
      }
      
      // Guardar el número actual de turnos en Firebase y localStorage
      userDataRef.set(currentTurnosCount).catch(err => {
        console.warn('⚠ No se pudo guardar en Firebase:', err);
      });
      localStorage.setItem(storageKey, currentTurnosCount.toString());
    }, (error) => {
      console.warn('⚠ No se pudo leer de Firebase:', error);
      // Fallback a localStorage
      localStorage.setItem(storageKey, currentTurnosCount.toString());
    });
    return;
  }
  
  // Si hay registro local
  if (previousTurnosCount !== null) {
    const prevCount = parseInt(previousTurnosCount);
    if (currentTurnosCount > prevCount) {
      const newTurnosAdded = currentTurnosCount - prevCount;
      console.log(`✓ ${newTurnosAdded} turno(s) nuevo(s) detectado(s) desde la última carga`);
      // DESACTIVADO: Notificación de turnos nuevos
      // updateNewTurnosCount(newTurnosAdded);
      // showNotification(`¡${newTurnosAdded} nuevo turno${newTurnosAdded > 1 ? 's' : ''} agregado${newTurnosAdded > 1 ? 's' : ''}!`);
    }
  }
  
  // Guardar el número actual de turnos en localStorage y Firebase
  localStorage.setItem(storageKey, currentTurnosCount.toString());
  
  if (isDatabaseReady()) {
    const db = getDatabase();
    const userDataRef = db.ref(`userData/${currentBarberId}/lastViewedTurnosCount`);
    userDataRef.set(currentTurnosCount).catch(err => {
      console.warn('⚠ No se pudo guardar el contador en Firebase:', err);
    });
  }
}

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
// SKELETON LOADERS - FUNCIONES DE CARGA
// ===============================
function showInitSkeleton() {
  // Mostrar skeleton para la sección de inicio
  const proxList = document.getElementById('inicio-proximos-list');
  const actList = document.getElementById('inicio-actividad-list');
  
  if (proxList) {
    proxList.innerHTML = `
      <div class="skeleton-card">
        <div class="skeleton-turno-card">
          <div class="skeleton-turno-time">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton-turno-info">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton short"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-turno-card">
          <div class="skeleton-turno-time">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton-turno-info">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton short"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  if (actList) {
    actList.innerHTML = `
      <div class="skeleton-activity-item">
        <div class="skeleton-activity-avatar"></div>
        <div class="skeleton-activity-content">
          <div class="skeleton"></div>
          <div class="skeleton medium"></div>
        </div>
      </div>
      <div class="skeleton-activity-item">
        <div class="skeleton-activity-avatar"></div>
        <div class="skeleton-activity-content">
          <div class="skeleton"></div>
          <div class="skeleton medium"></div>
        </div>
      </div>
      <div class="skeleton-activity-item">
        <div class="skeleton-activity-avatar"></div>
        <div class="skeleton-activity-content">
          <div class="skeleton"></div>
          <div class="skeleton medium"></div>
        </div>
      </div>
    `;
  }
}

function showTurnosSkeleton() {
  // Mostrar skeleton para la sección de turnos
  const turnosList = document.getElementById('turnos-list');
  
  if (turnosList) {
    turnosList.innerHTML = `
      <div class="skeleton-card">
        <div class="skeleton-turno-card">
          <div class="skeleton-turno-time">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton-turno-info">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton medium"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-turno-card">
          <div class="skeleton-turno-time">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton-turno-info">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton medium"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-turno-card">
          <div class="skeleton-turno-time">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton-turno-info">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton medium"></div>
          </div>
        </div>
      </div>
    `;
  }
}

function showClientesSkeleton() {
  // Mostrar skeleton para la sección de clientes
  const clientesGrid = document.getElementById('clientes-grid');
  
  if (clientesGrid) {
    clientesGrid.innerHTML = `
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
    `;
  }
}

function showStatsSkeleton() {
  // Mostrar skeleton para la sección de estadísticas
  const turnosChart = document.getElementById('turnosChart');
  const ingresosChart = document.getElementById('ingresosLineChart');
  const serviciosChart = document.getElementById('serviciosHorizontalChart');
  
  if (turnosChart) {
    turnosChart.style.display = 'none';
    let skeletonContainer = turnosChart.nextElementSibling;
    if (!skeletonContainer || !skeletonContainer.classList.contains('chart-skeleton-loader')) {
      skeletonContainer = document.createElement('div');
      skeletonContainer.className = 'chart-skeleton-loader';
      skeletonContainer.innerHTML = `
        <div class="skeleton-chart">
          <div class="skeleton-chart-title"></div>
          <div class="skeleton-chart-area"></div>
        </div>
      `;
      turnosChart.parentElement.appendChild(skeletonContainer);
    } else {
      skeletonContainer.style.display = 'block';
    }
  }
  
  if (ingresosChart) {
    ingresosChart.style.display = 'none';
    let skeletonContainer = ingresosChart.nextElementSibling;
    if (!skeletonContainer || !skeletonContainer.classList.contains('chart-skeleton-loader')) {
      skeletonContainer = document.createElement('div');
      skeletonContainer.className = 'chart-skeleton-loader';
      skeletonContainer.innerHTML = `
        <div class="skeleton-chart">
          <div class="skeleton-chart-title"></div>
          <div class="skeleton-chart-area"></div>
        </div>
      `;
      ingresosChart.parentElement.appendChild(skeletonContainer);
    } else {
      skeletonContainer.style.display = 'block';
    }
  }
  
  if (serviciosChart) {
    serviciosChart.style.display = 'none';
    let skeletonContainer = serviciosChart.nextElementSibling;
    if (!skeletonContainer || !skeletonContainer.classList.contains('chart-skeleton-loader')) {
      skeletonContainer = document.createElement('div');
      skeletonContainer.className = 'chart-skeleton-loader';
      skeletonContainer.innerHTML = `
        <div class="skeleton-chart">
          <div class="skeleton-chart-title"></div>
          <div class="skeleton-chart-area"></div>
        </div>
      `;
      serviciosChart.parentElement.appendChild(skeletonContainer);
    } else {
      skeletonContainer.style.display = 'block';
    }
  }
}

function showPreciosSkeleton() {
  // Mostrar skeleton para la sección de precios
  const preciosGrid = document.getElementById('precios-grid');
  
  if (preciosGrid) {
    preciosGrid.innerHTML = `
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
    `;
  }
}

function showCursoSkeleton() {
  // Mostrar skeleton para la sección de curso
  const cursoGrid = document.getElementById('curso-grid');
  
  if (cursoGrid) {
    cursoGrid.innerHTML = `
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
      <div class="skeleton-grid-item">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton short"></div>
      </div>
    `;
  }
}

// ===============================
// INICIALIZACIÓN DEL DOCUMENTO
// ===============================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 Dashboard cargado');
  
  // Mostrar skeleton loader al inicio
  showInitSkeleton();
  
  // Verificar si el dispositivo es móvil
  if (isMobileDevice()) {
    showMobileBlockScreen();
    return; // Detener la inicialización
  }
  
  console.log('✓ DOM Elements:', {
    sidebarLinks: document.querySelectorAll('.sidebar__link').length,
    turnosList: !!document.getElementById('turnos-list'),
    nuevoturnoBtn: !!document.getElementById('nuevo-turno-btn')
  });
  
  try {
    // loadNewTurnosCount(); // DESACTIVADO: Función de badge de turnos nuevos
    initBarberName();
    loadCurrentBarberId();
    loadPrecios();
    setupEventListeners();
    setupDashboardScrollButton();
    inicializarModalIngresos();
    
    // Cargar turnos e inicializar calendario después
    await loadTurnos();
    initCalendar();
    
    // Renderizar la sección Inicio por defecto
    renderInicio();
    
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
  previousBarberId = localStorage.getItem(LAST_BARBER_KEY);
  
  console.log('Barbero actual:', currentBarberId, 'Barbero anterior:', previousBarberId);
  
  // Si el barbero cambió (y no es la primera carga), resetear el contador
  if (previousBarberId && previousBarberId !== currentBarberId) {
    console.log('✓ Cambio de barbero detectado, reseteando contador de turnos nuevos');
    resetNewTurnosCountForBarber();
  }
  
  // Guardar el barbero actual como el último
  localStorage.setItem(LAST_BARBER_KEY, currentBarberId);
}

function initBarberName() {
  const barberName = localStorage.getItem(BARBER_KEY) || 'Barbero';
  const barberNameEl = document.getElementById('barber-name');
  barberNameEl.textContent = barberName;
  
  // Agregar evento click para abrir modal de cambio de barbero
  barberNameEl.addEventListener('click', openSelectBarberModal);
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
        
        // Detectar turnos nuevos comparando con carga anterior
        detectNewTurnosOnLoad(turnos.length);
        
        turnosLoaded = true; // Marcar que ya cargamos los turnos iniciales
        
        // También cargar turnos desde Firestore si está disponible
        loadTurnosFromFirestore();
        renderUI();
        resolve();
      }, (error) => {
        console.error('❌ Error leyendo Firebase:', error);
        loadTurnosFromLocalStorage();
        loadTurnosFromFirestore();
        turnosLoaded = true;
        renderUI();
        resolve();
      });

      // Escuchar cambios en tiempo real
      dbRef.on('child_added', (snapshot) => {
        const turno = { id: snapshot.key, ...snapshot.val() };
        if (!turnos.find(t => t.id === turno.id)) {
          turnos.push(turno);
          console.log('✓ Turno nuevo agregado desde Firebase:', turno.id);
          
          // Si ya cargamos los turnos iniciales, es un turno nuevo
          if (turnosLoaded) {
            // DESACTIVADO: updateNewTurnosCount(1);
            // showNotification('¡Nuevo turno agregado!');
          }
          
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
  const stored = localStorage.getItem(`${STORAGE_KEY}_${currentBarberId}`);
  let turnos = stored ? JSON.parse(stored) : [];
  
  const index = turnos.findIndex(t => t.id === turno.id);
  if (index !== -1) {
    turnos[index] = turno;
  } else {
    turnos.push(turno);
  }
  
  localStorage.setItem(`${STORAGE_KEY}_${currentBarberId}`, JSON.stringify(turnos));
}

function loadTurnosFromLocalStorage() {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${currentBarberId}`);
  turnos = stored ? JSON.parse(stored) : [];
}

function deleteTurnoFromLocalStorage(turnoId) {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${currentBarberId}`);
  let turnos = stored ? JSON.parse(stored) : [];
  turnos = turnos.filter(t => t.id !== turnoId);
  localStorage.setItem(`${STORAGE_KEY}_${currentBarberId}`, JSON.stringify(turnos));
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
let calendarCurrentDate = new Date(2026, 0, 1); // Enero 2026
let calendarSelectedDate = new Date(2026, 0, 1); // Enero 2026
let calendarListenersSetup = false;

function initCalendar() {
  // Establecer la fecha actual como la seleccionada
  const today = new Date();
  calendarCurrentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  calendarSelectedDate = new Date(today);
  
  renderCalendarMonth();
  if (!calendarListenersSetup) {
    setupCalendarEventListeners();
    calendarListenersSetup = true;
  }
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
  
  // Obtener primer día del mes (ajustado para que lunes sea 0)
  let firstDay = new Date(year, month, 1).getDay();
  // Convertir de formato JS (0=domingo) a formato calendario (0=lunes)
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  
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
    
    // Verificar si es domingo (getDay() retorna 0 para domingo)
    const isSunday = date.getDay() === 0;
    if (isSunday) {
      element.classList.add('sunday');
    }
    
    // Crear estructura para el día con contador
    const dayContent = document.createElement('div');
    dayContent.className = 'calendar-day-content';
    
    const dayNumber = document.createElement('span');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayContent.appendChild(dayNumber);
    
    // Contar solo turnos confirmados
    const confirmedCount = countConfirmedShiftsForDate(date);
    
    // Agregar indicador solo para turnos confirmados
    if (confirmedCount > 0) {
      element.classList.add('has-shifts');
      
      // Indicador de turnos confirmados (verde) - ahora muestra solo los confirmados
      const confirmedIndicator = document.createElement('span');
      confirmedIndicator.className = 'calendar-shifts-confirmed';
      confirmedIndicator.textContent = confirmedCount;
      confirmedIndicator.title = `${confirmedCount} turno(s) confirmado(s)`;
      dayContent.appendChild(confirmedIndicator);
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
    
    // Solo permitir click si no es domingo
    if (!isSunday) {
      element.addEventListener('click', () => selectCalendarDate(date));
    }
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

function countPendingShiftsForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return turnos.filter(t => t.fecha === dateStr && t.estado === 'pendiente').length;
}

function countConfirmedShiftsForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return turnos.filter(t => t.fecha === dateStr && t.estado === 'confirmado').length;
}

function updateSelectedDayInfo() {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateFormatted = calendarSelectedDate.toLocaleDateString('es-ES', options);
  document.getElementById('selected-day-title').textContent = 
    dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  
  // Obtener solo turnos confirmados del día
  const year = calendarSelectedDate.getFullYear();
  const month = String(calendarSelectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(calendarSelectedDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const dayShifts = turnos.filter(t => t.fecha === dateStr && t.estado === 'confirmado').sort((a, b) => a.hora.localeCompare(b.hora));
  
  document.getElementById('selected-day-info').textContent = 
    `${dayShifts.length} ${dayShifts.length === 1 ? 'turno' : 'turnos'}`;
  
  // Renderizar solo turnos confirmados
  const shiftsContainer = document.getElementById('calendar-shifts');
  shiftsContainer.innerHTML = '';
  
  if (dayShifts.length === 0) {
    shiftsContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.9rem;">No hay turnos confirmados</p>';
  } else {
    dayShifts.forEach(turno => {
      const shiftEl = document.createElement('div');
      shiftEl.className = 'calendar-shift-item shift-confirmed';
      
      shiftEl.innerHTML = `
        <div class="shift-hour">${turno.hora}</div>
        <div class="shift-client">${turno.cliente}</div>
        <div class="shift-service">${turno.servicio}</div>
        <div class="shift-status-badge">Confirmado</div>
      `;
      shiftsContainer.appendChild(shiftEl);
    });
  }
}

function setupCalendarEventListeners() {
  document.getElementById('calendar-prev').addEventListener('click', () => {
    let newMonth = calendarCurrentDate.getMonth() - 1;
    let newYear = calendarCurrentDate.getFullYear();
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    // Verificar que no sea antes de enero 2026 (2026-01)
    const isValidPrev = (newYear > 2026) || (newYear === 2026 && newMonth >= 0);
    if (isValidPrev) {
      calendarCurrentDate = new Date(newYear, newMonth, 1);
      renderCalendarMonth();
    }
  });
  
  document.getElementById('calendar-next').addEventListener('click', () => {
    let newMonth = calendarCurrentDate.getMonth() + 1;
    let newYear = calendarCurrentDate.getFullYear();
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    // Verificar que no sea después de diciembre 2027 (2027-12)
    const isValidNext = (newYear < 2027) || (newYear === 2027 && newMonth <= 11);
    if (isValidNext) {
      calendarCurrentDate = new Date(newYear, newMonth, 1);
      renderCalendarMonth();
    }
  });

  document.getElementById('calendar-today').addEventListener('click', () => {
    goToToday();
  });
}

function goToToday() {
  const today = new Date();
  calendarCurrentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  calendarSelectedDate = new Date(today);
  renderCalendarMonth();
  updateSelectedDayInfo();
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
    // Separar nombre y apellido si están combinados
    const nombreCompleto = turno.cliente || '';
    const partes = nombreCompleto.split(' ');
    const nombre = partes[0] || '';
    const apellido = partes.slice(1).join(' ') || '';
    
    document.getElementById('res-nombre').value = nombre;
    document.getElementById('res-apellido').value = apellido;
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

  // Validar que ambos campos estén completos
  const nombre = document.getElementById('res-nombre').value.trim();
  const apellido = document.getElementById('res-apellido').value.trim();
  
  if (!nombre) {
    showNotification('Por favor ingresa el nombre');
    return;
  }
  
  if (!apellido) {
    showNotification('Por favor ingresa el apellido');
    return;
  }

  // Validar que se haya seleccionado un horario
  const hora = document.getElementById('res-hora').value.trim();
  if (!hora) {
    showNotification('Por favor selecciona un horario disponible');
    return;
  }

  // Validar que se haya seleccionado al menos un servicio
  const servicios = document.getElementById('res-servicios').value.trim();
  if (!servicios) {
    showNotification('Por favor selecciona al menos un servicio');
    return;
  }

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
    hora: hora,
    cliente: `${nombre} ${apellido}`,
    telefono: document.getElementById('res-telefono').value,
    servicio: servicios,
    duracion: 30,
    precio: 0,
    notas: '',
    estado: estado,
  };

  const esNuevoTurno = !currentEditingId;
  saveTurno(turno);
  
  if (esNuevoTurno) {
    showNotification('Nuevo turno agregado');
  }
  
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

  // Ordenar turnos por fecha y hora (más recientes primero)
  const sortedTurnos = [...turnos].sort((a, b) => {
    const dateCompare = b.fecha.localeCompare(a.fecha);
    if (dateCompare !== 0) return dateCompare;
    return b.hora.localeCompare(a.hora);
  });

  if (sortedTurnos.length === 0) {
    console.log('ℹ No hay turnos registrados');
    turnosList.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <i class="bi bi-calendar-x"></i>
        </div>
        <h3 class="empty-state-title">No hay turnos registrados</h3>
        <p class="empty-state-text">Crea tu primer turno haciendo clic en el botón "Nuevo turno"</p>
      </div>
    `;
    return;
  }

  console.log('✓ Renderizando', sortedTurnos.length, 'turnos');

  // Obtener filtro activo
  const activeFilter = document.querySelector('.filter-btn--active')?.getAttribute('data-filter') || '';
  let currentDate = null;

  sortedTurnos.forEach(turno => {
    // Agregar separador de fecha si el filtro es "Todos" y la fecha cambió
    if (activeFilter === '') {
      if (currentDate !== turno.fecha) {
        currentDate = turno.fecha;
        
        // Crear separador de fecha
        const separator = document.createElement('div');
        separator.className = 'turno-date-separator';
        
        const [year, month, day] = turno.fecha.split('-');
        const date = new Date(year, month - 1, day);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
        
        // Agregar etiqueta si es hoy o mañana
        if (date.toDateString() === today.toDateString()) {
          dateLabel = '<i class="bi bi-arrow-right-circle-fill"></i> <span class="turno-date-today">Hoy</span> - ' + dateLabel;
        } else if (date.toDateString() === tomorrow.toDateString()) {
          dateLabel = '<i class="bi bi-arrow-right-circle-fill"></i> <span class="turno-date-tomorrow">Mañana</span> - ' + dateLabel;
        }
        
        separator.innerHTML = `<span class="turno-date-separator-text">${dateLabel}</span>`;
        turnosList.appendChild(separator);
      }
    }

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
    
    // Verificar si el turno está "perdido" (pendiente en el pasado - fecha y hora)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const turnoHaPasado = turno.fecha < todayStr || 
      (turno.fecha === todayStr && turno.hora < currentTimeStr);
    
    if (turno.estado === 'confirmado') {
      statusClass = 'confirmado';
      statusText = 'Confirmado';
    } else if (turno.estado === 'completado') {
      statusClass = 'completado';
      statusText = 'Finalizado';
    } else if (turno.estado === 'rechazado') {
      statusClass = 'rechazado';
      statusText = 'Rechazado';
    } else if (turno.estado === 'pendiente') {
      if (turnoHaPasado) {
        statusClass = 'perdido';
        statusText = 'Perdido';
      } else {
        statusClass = 'pendiente';
        statusText = 'Pendiente';
      }
    }
    
    // Agregar clase de estado a la card
    card.classList.add(`turno-card--${statusClass}`);
    
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
        <div class="turno-price-value">$${formatPrice(calcularPrecioTurno(turno))}</div>
      </div>
      
      <div class="turno-actions">
        <span class="turno-status ${statusClass}">${statusText}</span>
        <button class="turno-btn turno-btn--confirm" title="Confirmar" onclick="confirmarTurno('${turno.id}')">
          <i class="bi bi-check-lg"></i>
        </button>
        <button class="turno-btn turno-btn--complete" title="Marcar como Realizado" onclick="completarTurno('${turno.id}')">
          <i class="bi bi-check-circle"></i>
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
    clientesGrid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <i class="bi bi-people"></i>
        </div>
        <h3 class="empty-state-title">No hay clientes registrados</h3>
        <p class="empty-state-text">Los clientes aparecerán aquí cuando registres sus primeros turnos</p>
      </div>
    `;
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
// FUNCIÓN PARA LIMPIAR BASE DE DATOS
// ===============================
function limpiarBaseDatos() {
  const confirmClear = confirm('⚠️ ADVERTENCIA: Esta acción eliminará TODOS los turnos de la base de datos.\n\n¿Estás seguro de que deseas continuar?');
  
  if (!confirmClear) {
    return;
  }
  
  const confirmAgain = confirm('Esta es la última advertencia. Todos los datos se perderán permanentemente.\n\n¿Deseas continuar?');
  
  if (!confirmAgain) {
    return;
  }
  
  try {
    // Limpiar localStorage (SOLO del barbero actual, no afecta a otros barberos)
    localStorage.removeItem(`${STORAGE_KEY}_${currentBarberId}`);
    localStorage.removeItem(`${PRECIOS_KEY}_${currentBarberId}`);
    
    // Limpiar Firebase si está disponible
    if (isDatabaseReady()) {
      const db = getDatabase();
      if (db) {
        db.ref(`turnos/${currentBarberId}`).remove().catch(error => {
          console.error('Error limpiando Firebase:', error);
        });
      }
    }
    
    // Reiniciar variables globales
    turnos = [];
    precios = { ...PRECIOS_DEFECTO };
    
    // Mostrar notificación
    showNotification('✓ Base de datos limpiada correctamente');
    
    // Recargar la página después de 1 segundo
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
    showNotification('❌ Error al limpiar la base de datos');
  }
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
        'inicio': 'Inicio',
        'calendario': 'Calendario',
        'turnos': 'Turnos',
        'clientes': 'Clientes',
        'estadisticas': 'Estadísticas',
        'precios': 'Precios',
        'curso': 'Curso',
        'configuracion': 'Configuración'
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
        
        // Hacer scroll al top de la página
        window.scrollTo(0, 0);
        
        // También hacer scroll en el contenido principal
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
          dashboardContent.scrollTop = 0;
        }

        // Mostrar skeleton loader según la sección
        if (sectionName === 'inicio') {
          showInitSkeleton();
        } else if (sectionName === 'turnos') {
          showTurnosSkeleton();
        } else if (sectionName === 'clientes') {
          showClientesSkeleton();
        } else if (sectionName === 'estadisticas') {
          showStatsSkeleton();
        } else if (sectionName === 'precios') {
          showPreciosSkeleton();
        } else if (sectionName === 'curso') {
          showCursoSkeleton();
        }

        // Cargar datos específicos de la sección
        if (sectionName === 'inicio') {
          renderInicio();
        } else if (sectionName === 'calendario') {
          initCalendar();
        } else if (sectionName === 'turnos') {
          // DESACTIVADO: clearNewTurnosCount(); // Limpiar el badge cuando accede a turnos
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
        } else if (sectionName === 'curso') {
          loadAndRenderCursoSolicitudes();
        } else if (sectionName === 'configuracion') {
          actualizarInformacionConfiguracion();
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
  console.log(`🔍 Filtrando turnos - Filtro activo: "${activeFilter}", Búsqueda: "${searchTerm}", Total cards: ${cards.length}`);

  cards.forEach((card, index) => {
    const clienteName = card.querySelector('.turno-client-name').textContent.toLowerCase();
    const serviceText = card.querySelector('.turno-service').textContent.toLowerCase();
    const timeText = card.querySelector('.turno-hour').textContent;
    const dateText = card.querySelector('.turno-date').textContent; // Ej: "vie, 30 ene"
    const statusText = card.querySelector('.turno-status').textContent.toLowerCase();
    
    // Búsqueda por texto
    const matchesSearch = clienteName.includes(searchTerm) || serviceText.includes(searchTerm);
    
    // Extraer fecha de la tarjeta para matching más preciso
    // dateText es algo como "vie, 30 ene" - necesitamos extraer el día y mes
    const dateMatch = dateText.match(/(\d+)\s+(\w+)/);
    let dayNum = null;
    let monthName = null;
    if (dateMatch) {
      dayNum = parseInt(dateMatch[1]);
      monthName = dateMatch[2].toLowerCase();
    }
    
    // Encontrar el turno correspondiente por cliente, hora, día y mes
    const turnoData = turnos.find(t => {
      if (t.cliente.toLowerCase() !== clienteName || t.hora !== timeText.trim()) {
        return false;
      }
      
      // Verificar también por día y mes para mayor precisión
      const [year, month, day] = t.fecha.split('-');
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const turnoMonthName = monthNames[parseInt(month) - 1];
      const turnoDay = parseInt(day);
      
      return turnoDay === dayNum && turnoMonthName === monthName;
    });
    
    // Filtro por categoría
    let matchesFilter = true; // Por defecto mostrar cuando activeFilter === ''
    
    if (activeFilter !== '' && turnoData) {
      // Solo aplicar filtro si no es "Todos"
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Determinar si el turno ha pasado
      const turnoHaPasado = turnoData.fecha < todayStr || 
        (turnoData.fecha === todayStr && turnoData.hora < currentTimeStr);
      
      if (activeFilter === 'confirmados') {
        matchesFilter = turnoData.estado === 'confirmado';
      } else if (activeFilter === 'pendientes') {
        // Mostrar pendientes que AÚN no han pasado
        matchesFilter = turnoData.estado === 'pendiente' && !turnoHaPasado;
      } else if (activeFilter === 'perdidos') {
        // Mostrar pendientes que YA han pasado
        matchesFilter = turnoData.estado === 'pendiente' && turnoHaPasado;
      }
      
      if (index < 3) {
        console.log(`  Card ${index}: ${clienteName} ${dayNum}/${monthName} ${timeText} | Estado real: "${turnoData.estado}" | Ha pasado: ${turnoHaPasado} | Filter match: ${matchesFilter}`);
      }
    } else if (activeFilter !== '' && !turnoData) {
      // Si no se encuentra el turno y hay filtro activo, no mostrar
      matchesFilter = false;
      if (index < 3) {
        console.log(`  Card ${index}: ${clienteName} ${dayNum}/${monthName} ${timeText} | NO ENCONTRADO en turnos array`);
      }
    }
    
    card.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });

  // Ocultar separadores de fecha que no tengan tarjetas visibles
  const separators = document.querySelectorAll('.turno-date-separator');
  const turnosList = document.getElementById('turnos-list');
  
  separators.forEach(separator => {
    // Encontrar la siguiente tarjeta después del separador
    let nextElement = separator.nextElementSibling;
    let hasVisibleCards = false;
    
    // Recorrer los elementos hasta encontrar otro separador o el final
    while (nextElement && !nextElement.classList.contains('turno-date-separator')) {
      if (nextElement.classList.contains('turno-card') && nextElement.style.display !== 'none') {
        hasVisibleCards = true;
        break;
      }
      nextElement = nextElement.nextElementSibling;
    }
    
    // Mostrar/ocultar el separador según si tiene tarjetas visibles
    separator.style.display = hasVisibleCards ? '' : 'none';
  });
  
  // Contar tarjetas visibles
  const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none').length;
  
  // Mostrar/ocultar mensaje de no encontrados si hay búsqueda activa
  let noResultsMessage = document.getElementById('no-search-results-message');
  
  if (searchTerm && visibleCards === 0) {
    // Si hay término de búsqueda pero no hay resultados, mostrar mensaje
    if (!noResultsMessage) {
      noResultsMessage = document.createElement('div');
      noResultsMessage.id = 'no-search-results-message';
      noResultsMessage.className = 'empty-state-card';
      noResultsMessage.innerHTML = `
        <div class="empty-state-icon">
          <i class="bi bi-search"></i>
        </div>
        <h3 class="empty-state-title">No se encontraron turnos</h3>
        <p class="empty-state-text">No hay turnos que coincidan con "<strong>${searchTerm}</strong>"</p>
      `;
      turnosList.appendChild(noResultsMessage);
    } else {
      // Actualizar el mensaje con el término de búsqueda
      noResultsMessage.querySelector('.empty-state-text').innerHTML = `No hay turnos que coincidan con "<strong>${searchTerm}</strong>"`;
      noResultsMessage.style.display = '';
    }
  } else if (noResultsMessage) {
    // Si no hay búsqueda o hay resultados, ocultar el mensaje
    noResultsMessage.style.display = 'none';
  }
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
// GESTIÓN DE TEMAS (LIGHT/DARK)
// ===============================
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
          <p class="precio-card-amount">$${formatPrice(precio)}</p>
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
  renderInicio(); // Actualizar también la card de turnos pendientes en inicio
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
  renderInicio(); // Actualizar también la card de turnos pendientes en inicio
}

function completarTurno(turnoId) {
  const turno = turnos.find(t => t.id === turnoId);
  if (!turno) return;
  
  turno.estado = 'completado';
  
  // Guardar en BD
  saveTurno(turno);
  
  // Mostrar confirmación
  mostrarNotificacionExito('Turno marcado como realizado ✓');
  
  // Actualizar vistas
  renderTurnosList();
  renderInicio();
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
  renderInicio(); // Actualizar también la card de turnos pendientes en inicio
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
// GRÁFICOS CON CHART.JS - VERSIÓN MEJORADA
// =======================================
let ingresosLineChartInstance = null;
let serviciosHorizontalChartInstance = null;

function inicializarGraficos() {
  console.log('📊 Inicializando gráficos nuevos...');
  console.log('Total turnos disponibles:', turnos.length);
  
  // Verificar que Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js no está cargado');
    return;
  }
  
  generarGraficoIngresosLinea();
  generarGraficoServiciosHorizontal();
  hideChartSkeletons();
}

// Ocultar skeletons de gráficos cuando se renderizan
function hideChartSkeletons() {
  const charts = [
    document.getElementById('turnosChart'),
    document.getElementById('ingresosLineChart'),
    document.getElementById('serviciosHorizontalChart')
  ];
  
  charts.forEach(chart => {
    if (chart) {
      // Mostrar el canvas
      chart.style.display = 'block';
      
      // Ocultar el skeleton si existe
      const skeletonLoader = chart.nextElementSibling;
      if (skeletonLoader && skeletonLoader.classList.contains('chart-skeleton-loader')) {
        skeletonLoader.style.display = 'none';
      }
    }
  });
}

// Gráfico 1: Ingresos Acumulados del Mes (Línea) - POR SEMANAS
function generarGraficoIngresosLinea() {
  const ctx = document.getElementById('ingresosLineChart');
  if (!ctx) {
    console.error('❌ Elemento ingresosLineChart no encontrado');
    return;
  }

  // Obtener fecha actual
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');

  // Crear array de 4 semanas del mes
  const diasMes = new Date(año, parseInt(mes), 0).getDate();
  const semanas = [];
  const ingresosAcumulados = [];
  
  let acumulado = 0;

  // Dividir en 4 semanas lo más equitativo posible
  const diasPorSemana = Math.ceil(diasMes / 4);
  
  for (let semana = 0; semana < 4; semana++) {
    const inicioSemana = semana * diasPorSemana + 1;
    const finSemana = Math.min(inicioSemana + diasPorSemana - 1, diasMes);
    
    if (inicioSemana > diasMes) break;
    
    const labelSemana = `S${semana + 1}`;
    semanas.push(labelSemana);

    // Calcular ingresos de la semana
    let ingresosSemanales = 0;
    for (let dia = inicioSemana; dia <= finSemana; dia++) {
      const fecha = `${año}-${mes}-${String(dia).padStart(2, '0')}`;
      
      // Calcular ingresos del día (solo turnos completados)
      const ingresoDia = turnos
        .filter(t => t.fecha === fecha && t.estado === 'completado')
        .reduce((sum, t) => sum + calcularPrecioTurno(t), 0);

      ingresosSemanales += ingresoDia;
    }

    acumulado += ingresosSemanales;
    ingresosAcumulados.push(acumulado);
  }

  console.log('📈 Ingresos acumulados por semana:', ingresosAcumulados);

  if (ingresosLineChartInstance) {
    ingresosLineChartInstance.destroy();
  }

  ingresosLineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: semanas,
      datasets: [{
        label: 'Ingresos Acumulados ($)',
        data: ingresosAcumulados,
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00bcd4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#D4A574',
        pointHoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#cccccc',
            padding: 15,
            font: { size: 12 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#cccccc',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#cccccc'
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

// Gráfico 2: Top 5 Servicios (Barras Horizontales)
function generarGraficoServiciosHorizontal() {
  const ctx = document.getElementById('serviciosHorizontalChart');
  if (!ctx) {
    console.error('❌ Elemento serviciosHorizontalChart no encontrado');
    return;
  }

  // Contar servicios
  const serviciosConteo = {};
  turnos.forEach(turno => {
    const servicios = turno.servicio.split(',').map(s => s.trim());
    servicios.forEach(servicio => {
      if (servicio) {
        serviciosConteo[servicio] = (serviciosConteo[servicio] || 0) + 1;
      }
    });
  });

  // Top 5 servicios
  const top5 = Object.entries(serviciosConteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const servicios = top5.map(([name]) => name);
  const conteos = top5.map(([, count]) => count);

  console.log('🎯 Top 5 servicios:', servicios, conteos);

  if (serviciosHorizontalChartInstance) {
    serviciosHorizontalChartInstance.destroy();
  }

  serviciosHorizontalChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: servicios,
      datasets: [{
        label: 'Cantidad de Turnos',
        data: conteos,
        backgroundColor: [
          '#D4A574',
          '#C9945C',
          '#00bcd4',
          '#4caf50',
          '#ff9800'
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#cccccc',
            font: { size: 12 }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#cccccc'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: '#cccccc'
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

// ===============================
// MODAL DE INGRESOS EXPANDIDO
// ===============================
let ingresosExpandedChartInstance = null;
let currentExpandedMonth = null;

function inicializarModalIngresos() {
  const expandBtn = document.getElementById('expand-ingresos-btn');
  const closeBtn = document.getElementById('close-ingresos-modal');
  const modal = document.getElementById('ingresos-expanded-modal');
  const monthDisplay = document.getElementById('current-month-display');
  const prevBtn = document.getElementById('prev-month-btn');
  const nextBtn = document.getElementById('next-month-btn');

  if (!expandBtn) return;
  
  // Establecer mes actual
  const hoy = new Date();
  currentExpandedMonth = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

  function actualizarDisplayMes() {
    const [año, mes] = currentExpandedMonth.split('-');
    const fecha = new Date(año, parseInt(mes) - 1);
    const nombre = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    monthDisplay.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  expandBtn.addEventListener('click', () => {
    modal.classList.add('active');
    actualizarDisplayMes();
    setTimeout(() => generarGraficoIngresosExpandido(currentExpandedMonth), 100);
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  prevBtn.addEventListener('click', () => {
    const [año, mes] = currentExpandedMonth.split('-');
    const mesAnterior = parseInt(mes) - 1;
    if (mesAnterior > 0) {
      currentExpandedMonth = `${año}-${String(mesAnterior).padStart(2, '0')}`;
    } else {
      currentExpandedMonth = `${parseInt(año) - 1}-12`;
    }
    actualizarDisplayMes();
    generarGraficoIngresosExpandido(currentExpandedMonth);
    actualizarEstadisticasExpandidas(currentExpandedMonth);
  });

  nextBtn.addEventListener('click', () => {
    const [año, mes] = currentExpandedMonth.split('-');
    const mesSiguiente = parseInt(mes) + 1;
    if (mesSiguiente <= 12) {
      currentExpandedMonth = `${año}-${String(mesSiguiente).padStart(2, '0')}`;
    } else {
      currentExpandedMonth = `${parseInt(año) + 1}-01`;
    }
    actualizarDisplayMes();
    generarGraficoIngresosExpandido(currentExpandedMonth);
    actualizarEstadisticasExpandidas(currentExpandedMonth);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

function cargarMesesDisponibles() {
  // Ya no es necesario cargar en el selector, pero la mantengo por si la necesitas después
  return;
}

function generarGraficoIngresosExpandido(mesAño) {
  const ctx = document.getElementById('ingresosExpandedChart');
  if (!ctx) {
    console.error('❌ Canvas ingresosExpandedChart no encontrado');
    return;
  }

  const [año, mes] = mesAño.split('-');
  const diasMes = new Date(año, parseInt(mes), 0).getDate();
  const dias = [];
  const ingresos = [];

  let totalMes = 0;
  let maxIngreso = 0;

  for (let i = 1; i <= diasMes; i++) {
    const fecha = `${año}-${mes}-${String(i).padStart(2, '0')}`;
    dias.push(`${i}`);

    const ingresoDia = turnos
      .filter(t => t.fecha === fecha && t.estado === 'completado')
      .reduce((sum, t) => sum + calcularPrecioTurno(t), 0);

    ingresos.push(ingresoDia);
    totalMes += ingresoDia;
    maxIngreso = Math.max(maxIngreso, ingresoDia);
  }

  if (ingresosExpandedChartInstance) {
    ingresosExpandedChartInstance.destroy();
  }

  ingresosExpandedChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dias,
      datasets: [{
        label: `Ingresos Diarios - ${new Date(año, parseInt(mes) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        data: ingresos,
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#00bcd4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#D4A574',
        pointHoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#cccccc',
            padding: 15,
            font: { size: 13 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#cccccc',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#cccccc'
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  });

  actualizarEstadisticasExpandidas(mesAño);
}

function actualizarEstadisticasExpandidas(mesAño) {
  const [año, mes] = mesAño.split('-');
  
  const turnosMes = turnos.filter(t => {
    const turnoAño = t.fecha.substring(0, 4);
    const turnoMes = t.fecha.substring(5, 7);
    return turnoAño === año && turnoMes === mes && (t.estado === 'completado' || t.estado === 'confirmado');
  });

  const totalMes = turnosMes.reduce((sum, t) => sum + calcularPrecioTurno(t), 0);
  
  const diasMes = new Date(año, parseInt(mes), 0).getDate();
  const promedioDiario = Math.round(totalMes / diasMes);

  let maxDia = 0;
  for (let i = 1; i <= diasMes; i++) {
    const fecha = `${año}-${mes}-${String(i).padStart(2, '0')}`;
    const ingresoDia = turnos
      .filter(t => t.fecha === fecha && (t.estado === 'completado' || t.estado === 'confirmado'))
      .reduce((sum, t) => sum + calcularPrecioTurno(t), 0);
    maxDia = Math.max(maxDia, ingresoDia);
  }

  document.getElementById('total-mes-expanded').textContent = '$' + totalMes.toLocaleString();
  document.getElementById('promedio-diario-expanded').textContent = '$' + promedioDiario.toLocaleString();
  document.getElementById('dia-maximo-expanded').textContent = '$' + maxDia.toLocaleString();
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

// ===============================
// SECCIÓN INICIO - RESUMEN DEL DÍA
// ===============================
function renderInicio() {
  console.log('📊 Renderizando sección Inicio');
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Turnos de hoy
  const turnosHoy = turnos.filter(t => t.fecha === todayStr);
  const turnosHoyCompletados = turnosHoy.filter(t => t.estado === 'completado').length;
  const turnosHoyPendientes = turnosHoy.filter(t => t.estado !== 'completado').length;
  
  // Ingresos de hoy
  const ingresosHoy = turnosHoyCompletados > 0 
    ? turnosHoy
        .filter(t => t.estado === 'completado')
        .reduce((total, t) => total + calcularPrecioTurno(t), 0)
    : 0;
  
  // Ingresos esperados (si todos se completan)
  const ingresosEsperados = turnosHoy.reduce((total, t) => total + calcularPrecioTurno(t), 0);
  
  // Total de clientes únicos
  const clientesTotales = new Set(turnos.map(t => t.cliente)).size;
  
  // Ingresos de esta semana
  const inicioSemana = new Date(today);
  inicioSemana.setDate(today.getDate() - today.getDay());
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  
  const turnosSemana = turnos.filter(t => {
    const fechaTurno = new Date(t.fecha);
    return fechaTurno >= inicioSemana && fechaTurno <= finSemana && t.estado === 'completado';
  });
  
  const ingresosSemana = turnosSemana.reduce((total, t) => total + calcularPrecioTurno(t), 0);
  
  // Actualizar KPIs
  const kpiTurnosHoy = document.getElementById('inicio-turnos-hoy');
  if (kpiTurnosHoy) kpiTurnosHoy.textContent = turnosHoy.length;
  
  const kpiTurnosDetalle = document.getElementById('inicio-turnos-detalle');
  if (kpiTurnosDetalle) kpiTurnosDetalle.textContent = `${turnosHoyCompletados} completados, ${turnosHoyPendientes} pendientes`;
  
  const kpiIngresosHoy = document.getElementById('inicio-ingresos-hoy');
  if (kpiIngresosHoy) kpiIngresosHoy.textContent = '$' + ingresosHoy.toLocaleString('es-CO');
  
  const kpiIngresosEsperados = document.getElementById('inicio-ingresos-esperados');
  if (kpiIngresosEsperados) kpiIngresosEsperados.textContent = '$' + ingresosEsperados.toLocaleString('es-CO') + ' esperados';
  
  const kpiClientesTotales = document.getElementById('inicio-clientes-total');
  if (kpiClientesTotales) kpiClientesTotales.textContent = clientesTotales;
  
  const kpiIngresosSemana = document.getElementById('inicio-ingresos-semana');
  if (kpiIngresosSemana) kpiIngresosSemana.textContent = '$' + ingresosSemana.toLocaleString('es-CO');
  
  const kpiTurnosSemana = document.getElementById('inicio-turnos-semana');
  if (kpiTurnosSemana) kpiTurnosSemana.textContent = turnosSemana.length + ' turnos completados';
  
  // Renderizar próximos turnos
  renderProximosTurnos();
  
  // Renderizar actividad reciente
  renderActividadReciente();
  
  // Renderizar turnos pendientes de hoy y mañana
  renderInicioPendingShifts();
  
  // Setup botones de acciones rápidas
  setupAccionesRapidas();
}

function renderInicioPendingShifts() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Filtrar turnos pendientes (solo con estado 'pendiente') de hoy y mañana
  const pendingShifts = turnos.filter(t => {
    return (t.fecha === todayStr || t.fecha === tomorrowStr) && 
           t.estado === 'pendiente';
  }).sort((a, b) => a.hora.localeCompare(b.hora));
  
  const container = document.getElementById('inicio-pending-list');
  const countBadge = document.getElementById('inicio-pending-count');
  
  if (!container) return;
  
  // Actualizar contador
  if (countBadge) {
    countBadge.textContent = pendingShifts.length;
  }
  
  container.innerHTML = '';
  
  if (pendingShifts.length === 0) {
    container.innerHTML = '<p class="inicio-pending-empty">No hay turnos pendientes</p>';
    return;
  }
  
  // Separar por día
  const todayShifts = pendingShifts.filter(t => t.fecha === todayStr);
  const tomorrowShifts = pendingShifts.filter(t => t.fecha === tomorrowStr);
  
  // Renderizar turnos de hoy
  if (todayShifts.length > 0) {
    const todaySection = document.createElement('div');
    todaySection.className = 'inicio-pending-section';
    
    const todayLabel = document.createElement('h4');
    todayLabel.className = 'inicio-pending-section-label';
    todayLabel.textContent = 'Hoy';
    todaySection.appendChild(todayLabel);
    
    todayShifts.forEach(turno => {
      const shiftCard = createInicioPendingShiftCard(turno);
      todaySection.appendChild(shiftCard);
    });
    
    container.appendChild(todaySection);
  }
  
  // Renderizar turnos de mañana
  if (tomorrowShifts.length > 0) {
    const tomorrowSection = document.createElement('div');
    tomorrowSection.className = 'inicio-pending-section';
    
    const tomorrowLabel = document.createElement('h4');
    tomorrowLabel.className = 'inicio-pending-section-label';
    tomorrowLabel.textContent = 'Mañana';
    tomorrowSection.appendChild(tomorrowLabel);
    
    tomorrowShifts.forEach(turno => {
      const shiftCard = createInicioPendingShiftCard(turno);
      tomorrowSection.appendChild(shiftCard);
    });
    
    container.appendChild(tomorrowSection);
  }
}

function createInicioPendingShiftCard(turno) {
  const card = document.createElement('div');
  card.className = 'inicio-pending-shift-card';
  
  card.innerHTML = `
    <div class="inicio-pending-shift-time">${turno.hora}</div>
    <div class="inicio-pending-shift-info">
      <p class="inicio-pending-shift-client">${turno.cliente}</p>
      <p class="inicio-pending-shift-service">${turno.servicio}</p>
    </div>
    <div class="inicio-pending-shift-actions">
      <button class="inicio-pending-btn inicio-pending-btn--accept" title="Confirmar" onclick="confirmarTurno('${turno.id}')">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="inicio-pending-btn inicio-pending-btn--reject" title="Rechazar" onclick="rechazarTurno('${turno.id}')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;
  
  return card;
}

function renderProximosTurnos() {
  const container = document.getElementById('inicio-proximos-list');
  if (!container) {
    console.warn('⚠️ Contenedor inicio-proximos-list no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  // Obtener fecha de hoy normalizada
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyFormato = `${anio}-${mes}-${dia}`;
  
  console.log('🔍 Buscando turnos para:', fechaHoyFormato);
  console.log('📊 Total de turnos:', turnos.length);
  console.log('📋 Todos los turnos:', turnos);
  
  // Filtrar turnos confirmados de hoy
  const turnosHoy = turnos.filter(t => {
    const confirmado = t.estado === 'confirmado';
    const esHoy = t.fecha && t.fecha.includes(fechaHoyFormato);
    
    console.log(`Turno: ${t.cliente}, Fecha: ${t.fecha}, Estado: ${t.estado}, Confirmado: ${confirmado}, EsHoy: ${esHoy}`);
    
    return confirmado && esHoy;
  });
  
  console.log('✅ Turnos confirmados de hoy:', turnosHoy.length, turnosHoy);
  
  // Ordenar por hora
  turnosHoy.sort((a, b) => {
    const horaA = parseInt(a.hora?.replace(':', '') || '0');
    const horaB = parseInt(b.hora?.replace(':', '') || '0');
    return horaA - horaB;
  });
  
  // Si no hay turnos
  if (turnosHoy.length === 0) {
    container.innerHTML = `
      <div class="inicio-empty-state">
        <i class="bi bi-calendar-x"></i>
        <p>No hay turnos confirmados para hoy</p>
      </div>
    `;
    return;
  }
  
  // Renderizar cada turno
  turnosHoy.forEach(turno => {
    const item = document.createElement('div');
    item.className = 'inicio-turno-item';
    item.innerHTML = `
      <div class="inicio-turno-icon">
        <i class="bi bi-scissors"></i>
      </div>
      <div class="inicio-turno-info">
        <div class="inicio-turno-cliente">${turno.cliente || 'Cliente'}</div>
        <div class="inicio-turno-servicio">${turno.servicio || 'Servicio no especificado'}</div>
      </div>
      <div class="inicio-turno-hora">
        <div class="inicio-turno-hora-principal">${turno.hora || '--:--'}</div>
        <div class="inicio-turno-fecha">hoy</div>
      </div>
      <button class="inicio-turno-btn-complete" title="Marcar como Realizado" onclick="completarTurno('${turno.id}')">
        <i class="bi bi-check-lg"></i>
      </button>
    `;
    container.appendChild(item);
    console.log('✅ Turno agregado:', turno.cliente, turno.hora);
  });
}

function renderActividadReciente() {
  const container = document.getElementById('inicio-actividad-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Obtener fecha de hoy en formato local
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const todayStr = `${anio}-${mes}-${dia}`; // Formato: YYYY-MM-DD
  
  console.log('📊 Buscando turnos completados del día:', todayStr);
  console.log('Total de turnos:', turnos.length);
  console.log('Turnos completados:', turnos.filter(t => t.estado === 'completado').length);
  
  // Obtener turnos completados del día de hoy
  const actividadReciente = turnos
    .filter(t => {
      const esCompletado = t.estado === 'completado';
      const mismaFecha = t.fecha === todayStr;
      
      if (esCompletado && !mismaFecha) {
        console.log(`Turno ${t.cliente} está completado pero es de otra fecha:`, t.fecha);
      }
      
      return esCompletado && mismaFecha;
    })
    .sort((a, b) => {
      // Ordenar por hora descendente
      const horaA = a.hora ? a.hora.split(':').map(Number) : [0, 0];
      const horaB = b.hora ? b.hora.split(':').map(Number) : [0, 0];
      const minutosA = horaA[0] * 60 + horaA[1];
      const minutosB = horaB[0] * 60 + horaB[1];
      return minutosB - minutosA;
    })
    .slice(0, 5);
  
  console.log('Actividad reciente encontrada:', actividadReciente.length);
  
  if (actividadReciente.length === 0) {
    container.innerHTML = `
      <div class="inicio-empty-state">
        <i class="bi bi-inbox"></i>
        <p>No hay actividad reciente</p>
      </div>
    `;
    return;
  }
  
  actividadReciente.forEach((turno, index) => {
    const item = document.createElement('div');
    item.className = 'inicio-actividad-item';
    item.innerHTML = `
      <div class="inicio-actividad-icon">
        <i class="bi bi-check-circle-fill"></i>
      </div>
      <div class="inicio-actividad-content">
        <div class="inicio-actividad-titulo">${turno.cliente}</div>
        <div class="inicio-actividad-detalle">${turno.servicio || 'Servicio'} - $${calcularPrecioTurno(turno).toLocaleString('es-CO')} <span class="inicio-actividad-hora">${turno.hora}</span></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function setupAccionesRapidas() {
  // Nuevo turno
  const accionNuevoTurno = document.getElementById('accion-nuevo-turno');
  if (accionNuevoTurno) {
    accionNuevoTurno.addEventListener('click', () => openModal());
  }
  
  // Nuevo turno header
  const nuevoTurnoHeader = document.getElementById('nuevo-turno-btn-header');
  if (nuevoTurnoHeader) {
    nuevoTurnoHeader.addEventListener('click', () => openModal());
  }
  
  // Ver clientes
  const accionClientes = document.getElementById('accion-ver-clientes');
  if (accionClientes) {
    accionClientes.addEventListener('click', () => {
      document.querySelector('[data-section="clientes"]').click();
    });
  }
  
  // Ver calendario
  const accionCalendario = document.getElementById('accion-ver-calendario');
  if (accionCalendario) {
    accionCalendario.addEventListener('click', () => {
      document.querySelector('[data-section="calendario"]').click();
    });
  }
  
  // Ver estadísticas
  const accionEstadisticas = document.getElementById('accion-ver-estadisticas');
  if (accionEstadisticas) {
    accionEstadisticas.addEventListener('click', () => {
      document.querySelector('[data-section="estadisticas"]').click();
    });
  }
  
  // Ver todos los turnos
  const verTodos = document.querySelector('.inicio-ver-todos');
  if (verTodos) {
    verTodos.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('[data-section="turnos"]').click();
    });
  }
}

// ===============================
// FUNCIONES PARA CAMBIAR DE BARBERO
// ===============================
function openSelectBarberModal() {
  const modal = document.getElementById('modal-select-barber');
  const barbersList = document.getElementById('barbers-list');
  const barberos = ['Diego', 'Martin', 'Leo'];
  const currentBarberName = localStorage.getItem(BARBER_KEY) || 'Barbero';
  
  barbersList.innerHTML = barberos.map(barber => {
    const isActive = barber === currentBarberName;
    return `
      <div class="barber-option ${isActive ? 'active' : ''}" onclick="changeBarber('${barber}')">
        <i class="bi bi-person-check-fill"></i>
        <span>${barber}</span>
      </div>
    `;
  }).join('');
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Agregar event listener para cerrar al hacer click fuera
  setTimeout(() => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeSelectBarberModal();
      }
    }, { once: true });
  }, 0);
}

function closeSelectBarberModal() {
  const modal = document.getElementById('modal-select-barber');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function changeBarber(barberName) {
  localStorage.setItem(BARBER_KEY, barberName);
  closeSelectBarberModal();
  
  // Mostrar notificación y recargar la página
  showNotification(`Cambió a barbero: ${barberName}`);
  
  // Recargar la página después de 500ms para que se vea la notificación
  setTimeout(() => {
    location.reload();
  }, 500);
}

// ===============================
// FUNCIONES PARA GESTIÓN DE CURSO
// ===============================

let cursoSolicitudes = [];
let cursoFiltrado = [];
let solicitudActualId = null;

// Cargar solicitudes del curso desde Firebase
async function loadAndRenderCursoSolicitudes() {
  try {
    const db = window.firebaseDB || firebase.database();
    if (!db) {
      console.error('Firebase no está disponible');
      return;
    }

    db.ref('solicitudes_curso').on('value', (snapshot) => {
      cursoSolicitudes = [];
      const data = snapshot.val();
      
      if (data) {
        Object.keys(data).forEach(key => {
          cursoSolicitudes.push({
            id: key,
            ...data[key]
          });
        });
      }

      console.log('✓ Solicitudes de curso cargadas:', cursoSolicitudes.length);
      
      // Aplicar filtros al renderizar (esto también configura los event listeners)
      aplicarFiltrosCurso();
      
      // Configurar filtros y búsqueda
      setTimeout(() => {
        setupCursoFiltros();
      }, 100);
    });
  } catch (error) {
    console.error('❌ Error cargando solicitudes de curso:', error);
  }
}

// Renderizar las solicitudes del curso
function renderCursoSolicitudes() {
  const grid = document.getElementById('curso-grid');
  if (!grid) return;

  if (cursoSolicitudes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="bi bi-inbox" style="font-size: 3rem; color: #666666; display: block; margin-bottom: 1rem;"></i>
        <p style="color: #999999; font-size: 1rem;">No hay solicitudes de curso</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = cursoSolicitudes.map(solicitud => {
    const fecha = new Date(solicitud.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="curso-card" data-id="${solicitud.id}">
        <div class="curso-card-header">
          <div class="curso-card-nombre">
            <div class="curso-card-nombre-text">${solicitud.nombre}</div>
            <div class="curso-card-fecha">${fechaFormato}</div>
          </div>
          <span class="curso-card-badge curso-card-badge--${solicitud.estado || 'pendiente'}">
            ${solicitud.estado || 'Pendiente'}
          </span>
        </div>

        <div class="curso-card-info">
          <div class="curso-card-info-item">
            <i class="bi bi-envelope"></i>
            <label>Email:</label>
            <span>${solicitud.email}</span>
          </div>
          <div class="curso-card-info-item">
            <i class="bi bi-telephone"></i>
            <label>Teléfono:</label>
            <span>${solicitud.telefono}</span>
          </div>
          <div class="curso-card-info-item">
            <i class="bi bi-person"></i>
            <label>Edad:</label>
            <span>${solicitud.edad} años</span>
          </div>
        </div>

        <div class="curso-card-experiencia">
          <strong>Experiencia:</strong> ${solicitud.experiencia}
          ${solicitud.mensaje ? `<p style="margin-top: 0.5rem; color: #aaa;">${solicitud.mensaje}</p>` : ''}
        </div>

        <div class="curso-card-footer">
          <button class="curso-card-action-btn" onclick="openCursoContactModal('${solicitud.id}')">
            <i class="bi bi-chat-dots"></i>
            Contactar
          </button>
          <button class="curso-card-action-btn" onclick="openCursoWhatsApp('${solicitud.telefono}', '${solicitud.nombre}')">
            <i class="bi bi-whatsapp"></i>
            WhatsApp
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Abrir modal de contacto
function openCursoContactModal(solicitudId) {
  solicitudActualId = solicitudId;
  const solicitud = cursoSolicitudes.find(s => s.id === solicitudId);
  
  if (!solicitud) {
    console.error('Solicitud no encontrada');
    return;
  }

  // Llenar datos del solicitante
  document.getElementById('solicitante-nombre').textContent = solicitud.nombre;
  document.getElementById('solicitante-email').textContent = solicitud.email;
  document.getElementById('solicitante-telefono').textContent = solicitud.telefono;
  document.getElementById('solicitante-edad').textContent = solicitud.edad + ' años';
  document.getElementById('solicitante-experiencia').textContent = solicitud.experiencia;
  
  const fecha = new Date(solicitud.fecha);
  document.getElementById('solicitante-fecha').textContent = fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  // Establecer estado actual
  document.getElementById('nuevo-estado-curso').value = solicitud.estado || 'pendiente';

  // Configurar botones de contacto
  document.getElementById('btn-whatsapp-contacto').onclick = () => {
    openCursoWhatsApp(solicitud.telefono, solicitud.nombre);
  };

  document.getElementById('btn-email-contacto').onclick = () => {
    openCursoEmail(solicitud.email, solicitud.nombre);
  };

  // Configurar botón guardar cambios
  document.getElementById('btn-guardar-cambios-curso').onclick = () => {
    guardarCambiosCurso(solicitudId);
  };

  // Mostrar modal
  const modal = document.getElementById('modal-contactar-curso');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Event listener para cerrar modal al hacer click fuera
  modal.addEventListener('click', (e) => {
    // Si el click es en el modal pero fuera del modal-content, cerrar
    if (e.target === modal) {
      closeCursoContactModal();
    }
  });
}

// Cerrar modal de contacto
function closeCursoContactModal() {
  const modal = document.getElementById('modal-contactar-curso');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
  solicitudActualId = null;
}

// Abrir WhatsApp con el solicitante
function openCursoWhatsApp(telefono, nombre) {
  const mensaje = `¡Hola ${nombre}! 👋 Hemos recibido tu solicitud para el curso de barbería. Nos encantaría hablar contigo sobre esta oportunidad. ¿Tienes disponibilidad para una breve conversación?`;
  const encoded = encodeURIComponent(mensaje);
  const normalized = telefono.replace(/[^\d]/g, '');
  
  let whatsappUrl = `https://wa.me/${normalized}?text=${encoded}`;
  
  // Si no tiene formato válido, añadir prefijo de Argentina
  if (normalized.length < 10) {
    whatsappUrl = `https://wa.me/54${normalized}?text=${encoded}`;
  }
  
  window.open(whatsappUrl, '_blank');
}

// Abrir Gmail/Email con el solicitante
function openCursoEmail(email, nombre) {
  const asunto = 'Respuesta a tu solicitud de curso - Oklahoma Studio';
  const cuerpo = `Hola ${nombre},\n\nHemos recibido tu solicitud para el curso de barbería profesional de Oklahoma Studio.\n\nNos complace informarte que tu perfil ha sido revisado positivamente. Nos encantaría hablar contigo sobre esta oportunidad.\n\n¿Tienes disponibilidad para una videollamada o conversación?\n\nCordiales saludos,\nEquipo Oklahoma Studio`;
  
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.location.href = mailtoLink;
}

// Guardar cambios de estado
async function guardarCambiosCurso(solicitudId) {
  const nuevoEstado = document.getElementById('nuevo-estado-curso').value;

  try {
    const db = window.firebaseDB || firebase.database();
    if (!db) {
      console.error('Firebase no está disponible');
      return;
    }

    await db.ref(`solicitudes_curso/${solicitudId}`).update({
      estado: nuevoEstado
    });

    showNotification(`✓ Estado actualizado a: ${nuevoEstado}`);
    closeCursoContactModal();
    console.log('✓ Cambios guardados en Firebase');
  } catch (error) {
    console.error('❌ Error guardando cambios:', error);
    alert('Error al guardar los cambios');
  }
}

// Variables para filtrado
let cursoEstadoActivo = 'todos';
let cursoTerminoBusqueda = '';

// Aplicar filtros y búsqueda
function aplicarFiltrosCurso() {
  const solicitudesFiltradas = cursoSolicitudes.filter(solicitud => {
    // Filtrar por búsqueda (nombre)
    const coincideNombre = solicitud.nombre.toLowerCase().includes(cursoTerminoBusqueda.toLowerCase());
    
    // Filtrar por estado
    const coincideEstado = cursoEstadoActivo === 'todos' || solicitud.estado === cursoEstadoActivo;
    
    return coincideNombre && coincideEstado;
  });

  // Renderizar solicitudes filtradas
  const grid = document.getElementById('curso-grid');
  if (!grid) return;

  if (solicitudesFiltradas.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="bi bi-inbox" style="font-size: 3rem; color: #666666; display: block; margin-bottom: 1rem;"></i>
        <p style="color: #999999; font-size: 1rem;">No hay solicitudes que coincidan con los filtros</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = solicitudesFiltradas.map(solicitud => {
    const fecha = new Date(solicitud.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const estadoClase = `curso-card-badge--${solicitud.estado}`;
    const estadoTexto = {
      'pendiente': 'Pendiente',
      'contactado': 'Contactado',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado'
    }[solicitud.estado] || solicitud.estado;

    return `
      <div class="curso-card">
        <div class="curso-card-header">
          <div class="curso-card-nombre">
            <div class="curso-card-nombre-text">${solicitud.nombre}</div>
            <div class="curso-card-fecha">${fechaFormato}</div>
          </div>
          <span class="curso-card-badge ${estadoClase}">${estadoTexto}</span>
        </div>
        <div class="curso-card-info">
          <div class="curso-card-info-item">
            <i class="bi bi-envelope"></i>
            <label>Email:</label>
            <span>${solicitud.email}</span>
          </div>
          <div class="curso-card-info-item">
            <i class="bi bi-telephone"></i>
            <label>Teléfono:</label>
            <span>${solicitud.telefono}</span>
          </div>
          <div class="curso-card-info-item">
            <i class="bi bi-person"></i>
            <label>Edad:</label>
            <span>${solicitud.edad} años</span>
          </div>
          <div class="curso-card-info-item">
            <i class="bi bi-briefcase"></i>
            <label>Experiencia:</label>
            <span>${solicitud.experiencia}</span>
          </div>
        </div>
        <div class="curso-card-experiencia">
          <strong>Mensaje:</strong> ${solicitud.mensaje}
        </div>
        <div class="curso-card-footer">
          <button class="curso-card-action-btn curso-card-action-btn--primary" onclick="openCursoContactModal('${solicitud.id}')">
            <i class="bi bi-chat-dots"></i>
            Contactar
          </button>
          <button class="curso-card-action-btn" onclick="openCursoWhatsApp('${solicitud.telefono}', '${solicitud.nombre}')">
            <i class="bi bi-whatsapp"></i>
            WhatsApp
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Configurar event listeners para filtros
function setupCursoFiltros() {
  // Search input
  const searchInput = document.getElementById('curso-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      cursoTerminoBusqueda = e.target.value;
      aplicarFiltrosCurso();
    });
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll('.curso-filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remover clase activa de todos los botones
      filterButtons.forEach(btn => btn.classList.remove('curso-filter-btn--active'));
      
      // Agregar clase activa al botón clickeado
      button.classList.add('curso-filter-btn--active');
      
      // Actualizar estado activo
      cursoEstadoActivo = button.dataset.estado;
      
      // Aplicar filtros
      aplicarFiltrosCurso();
    });
  });

  console.log('✓ Filtros de curso configurados');
}

// ===============================
// SECCIÓN CONFIGURACIÓN
// ===============================

function actualizarInformacionConfiguracion() {
  // Actualizar nombre del barbero
  const barberNameElement = document.getElementById('config-barber-name');
  if (barberNameElement) {
    barberNameElement.textContent = currentBarberId || '-';
  }

  // Actualizar total de turnos
  const totalTurnosElement = document.getElementById('config-total-turnos');
  if (totalTurnosElement) {
    totalTurnosElement.textContent = turnos.length;
  }

  // Calcular total de clientes únicos
  const clientesMap = {};
  turnos.forEach(turno => {
    if (!clientesMap[turno.cliente]) {
      clientesMap[turno.cliente] = true;
    }
  });
  const totalClientes = Object.keys(clientesMap).length;

  const totalClientesElement = document.getElementById('config-total-clientes');
  if (totalClientesElement) {
    totalClientesElement.textContent = totalClientes;
  }

  console.log('✓ Información de configuración actualizada');
}

function cambiarContraseña() {
  const currentPassword = document.getElementById('current-password')?.value;
  const newPassword = document.getElementById('new-password')?.value;
  const confirmPassword = document.getElementById('confirm-password')?.value;

  // Validar campos
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('⚠ Por favor completa todos los campos');
    return;
  }

  if (newPassword.length < 4) {
    showNotification('⚠ La nueva contraseña debe tener al menos 4 caracteres');
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('⚠ Las contraseñas no coinciden');
    return;
  }

  // Obtener contraseña actual del localStorage (contraseña GLOBAL para todos los barberos)
  // Si no existe, la contraseña inicial es "1234"
  const storedPassword = localStorage.getItem(PASSWORD_KEY) || '1234';
  
  if (storedPassword !== currentPassword) {
    showNotification('⚠ La contraseña actual es incorrecta');
    return;
  }

  // Guardar nueva contraseña en localStorage (global)
  localStorage.setItem(PASSWORD_KEY, newPassword);

  // Guardar en Firebase si está disponible
  if (isDatabaseReady()) {
    const db = getDatabase();
    if (db) {
      db.ref('config/masterPassword').set(newPassword).catch(error => {
        console.error('Error guardando contraseña en Firebase:', error);
      });
    }
  }

  // Limpiar campos
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';

  showNotification('✓ Contraseña actualizada correctamente');
}

function limpiarTurnosPerdidos() {
  // Calcular turnos perdidos (pendientes cuya fecha/hora ha pasado)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const turnosPerdidos = turnos.filter(t => {
    const turnoHaPasado = t.fecha < todayStr || (t.fecha === todayStr && t.hora < currentTimeStr);
    return t.estado === 'pendiente' && turnoHaPasado;
  });

  const turnosPerdidosCount = turnosPerdidos.length;

  if (turnosPerdidosCount === 0) {
    showNotification('ℹ No hay turnos perdidos para eliminar');
    return;
  }

  const confirm1 = confirm(`Se eliminarán ${turnosPerdidosCount} turnos marcados como "Perdido".\n\n¿Deseas continuar?`);
  
  if (!confirm1) {
    return;
  }

  try {
    // Filtrar turnos, eliminando los que están perdidos (pendientes con fecha/hora pasada)
    const turnosAntes = turnos.length;
    turnos = turnos.filter(t => {
      const turnoHaPasado = t.fecha < todayStr || (t.fecha === todayStr && t.hora < currentTimeStr);
      return !(t.estado === 'pendiente' && turnoHaPasado);
    });
    const turnosEliminados = turnosAntes - turnos.length;

    // Guardar cambios
    localStorage.setItem(`${STORAGE_KEY}_${currentBarberId}`, JSON.stringify(turnos));

    // Actualizar Firebase si está disponible
    if (isDatabaseReady()) {
      const db = getDatabase();
      if (db) {
        db.ref(`turnos/${currentBarberId}`).set(turnos).catch(error => {
          console.error('Error actualizando Firebase:', error);
        });
      }
    }

    // Actualizar información
    actualizarInformacionConfiguracion();

    // Mostrar notificación
    showNotification(`✓ ${turnosEliminados} turno(s) perdido(s) eliminado(s)`);

    // Refrescar la lista de turnos si está visible
    const turnosList = document.getElementById('turnos-list');
    if (turnosList) {
      renderTurnosList();
    }

  } catch (error) {
    console.error('Error limpiando turnos perdidos:', error);
    showNotification('✗ Error al limpiar turnos perdidos');
  }
}