// Lógica de instalación de PWA
let deferredPrompt;
const installButton = document.getElementById('install-app-btn');

// Detectar el navegador
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  return 'Unknown';
}

const currentBrowser = getBrowser();

// Capturar el evento beforeinstallprompt (Chrome, Edge, Opera)
window.addEventListener('beforeinstallprompt', (e) => {
  // Evitar que se muestre el prompt automático
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar el botón de instalar
  if (installButton) {
    installButton.style.display = 'flex';
  }
});

// Para Firefox: mostrar el botón con instrucciones alternativas
if (currentBrowser === 'Firefox' && installButton) {
  // Firefox no soporta beforeinstallprompt, pero podemos mostrar el botón
  // y dar instrucciones al usuario
  installButton.style.display = 'flex';
  
  installButton.addEventListener('click', () => {
    // Mostrar instrucciones para Firefox
    showFirefoxInstructions();
  });
}

// Manejar clic en el botón de instalar (para Chrome, Edge, etc.)
if (installButton && currentBrowser !== 'Firefox') {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Mostrar el diálogo de instalación
    deferredPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario respondió al prompt: ${outcome}`);
    
    // Limpiar la variable
    deferredPrompt = null;
    
    // Ocultar el botón
    installButton.style.display = 'none';
  });
}

// Función para mostrar instrucciones de Firefox
function showFirefoxInstructions() {
  // Verificar si Firefox está en móvil o desktop
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  let message = 'Para instalar Oklahoma Studio en Firefox:\n\n';
  
  if (isMobile) {
    message += 'EN ANDROID:\n' +
      '1. Toca el menú (⋮) en la esquina superior derecha\n' +
      '2. Busca "Instalar" o "Install"\n' +
      '3. Confirma la instalación\n\n' +
      'O también puedes:\n' +
      '1. Toca el ícono de la página (junto a la URL)\n' +
      '2. Busca "Instalar aplicación"';
  } else {
    message += 'EN DESKTOP:\n' +
      '1. Haz clic en el ícono de opciones del sitio (i) en la barra de direcciones\n' +
      '2. Selecciona "Instalar aplicación"\n\n' +
      'O:\n' +
      '1. Abre el menú (☰)\n' +
      '2. Ve a Aplicaciones\n' +
      '3. Busca la opción de instalar';
  }
  
  alert(message);
}

// Detectar cuando la app ha sido instalada
window.addEventListener('appinstalled', () => {
  console.log('Oklahoma Studio ha sido instalada como PWA');
  deferredPrompt = null;
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker registrado exitosamente:', registration);
      })
      .catch(error => {
        console.warn('Error al registrar Service Worker:', error);
      });
  });
}
