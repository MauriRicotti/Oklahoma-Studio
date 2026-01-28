// Lógica de instalación de PWA
let deferredPrompt;
const installButton = document.getElementById('install-app-btn');

// Capturar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Evitar que se muestre el prompt automático
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar el botón de instalar
  if (installButton) {
    installButton.style.display = 'flex';
  }
});

// Manejar clic en el botón de instalar
if (installButton) {
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
