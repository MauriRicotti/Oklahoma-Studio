// ===============================
// CONFIGURACIÓN DE FIREBASE
// ===============================

console.log('🔥 Iniciando Firebase...');

// Crear una promesa que se resuelve cuando Firebase esté completamente inicializado
window.firebaseReadyPromise = new Promise((resolve) => {
  const maxAttempts = 50;
  let attempts = 0;
  
  const check = () => {
    if (window.firebase && window.firebase.database && window.db) {
      console.log('✓ Firebase SDK completamente disponible');
      resolve();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(check, 100);
    } else {
      console.error('✗ Firebase SDK no se cargó completamente después de 5 segundos');
      resolve(); // Resolver aunque no esté disponible para continuar la ejecución
    }
  };
  
  check();
});

function initializeFirebase() {
  try {
    // Configuración de Firebase
    const config = {
      apiKey: "AIzaSyBQk4-2btS4sGl49Jz5bQFKbwpCzN7nI0Q",
      authDomain: "oklahoma-studio.firebaseapp.com",
      databaseURL: "https://oklahoma-studio-default-rtdb.firebaseio.com",
      projectId: "oklahoma-studio",
      storageBucket: "oklahoma-studio.firebasestorage.app",
      messagingSenderId: "8476784578",
      appId: "1:8476784578:web:ab011f26e83bb30d62885b",
      measurementId: "G-9XR2GE0SWJ"
    };
    
    // Inicializar Firebase
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
      console.log('✓ Firebase inicializado correctamente');
    } else {
      console.log('✓ Firebase ya estaba inicializado');
    }
    
    // Crear referencia global a la base de datos (Realtime Database)
    window.firebaseDB = firebase.database();
    console.log('✓ Referencia a Realtime Database creada');
    
    // Crear referencia global a Firestore para el sistema de reservas
    window.db = firebase.firestore();
    console.log('✓ Referencia a Firestore creada');
    
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
  }
}

// Esperar a que Firebase SDK esté listo
const firebaseInitPromise = new Promise((resolve) => {
  const maxAttempts = 50;
  let attempts = 0;
  
  const check = () => {
    if (window.firebase && window.firebase.database) {
      console.log('✓ Firebase SDK está disponible');
      initializeFirebase();
      resolve();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(check, 100);
    } else {
      console.error('✗ Firebase SDK no se cargó después de 5 segundos');
      resolve();
    }
  };
  
  check();
});
