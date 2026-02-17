// ===============================
// BARBERO PAGE - CARGAR PERFIL DINÁMICO
// ===============================

const BARBEROS_DATA = {
  diego: {
    nombre: 'Diego Barrios',
    rol: 'Especialista en Cortes',
    bio: 'Experto en cortes modernos y diseño de barba. Con 8 años de experiencia, Diego es conocido por su precisión y capacidad de crear estilos personalizados. Su pasión por la barbería se refleja en cada trabajo que realiza, combinando técnicas clásicas con tendencias actuales.',
    foto: 'assets/Perfil Diego Barrios.webp',
    habilidades: ['Cortes Modernos', 'Diseño de Barba', 'Barbado Clásico'],
    trabajos: [
      { img: 'assets/corte1.webp', alt: 'Corte 1' },
      { img: 'assets/corte4.webp', alt: 'Corte 4' },
      { img: 'assets/Cortes/Corte 7.jpeg', alt: 'Corte 7' },
      { img: 'assets/Cortes/Corte 10.jpeg', alt: 'Corte 10' }
    ]
  },
  martin: {
    nombre: 'Martin',
    rol: 'Colorista Premium',
    bio: 'Especialista en coloración y tratamientos capilares. Martin domina técnicas de tinte de última generación para transformaciones únicas. Con formación continua en las mejores academias de estilismo, garantiza resultados profesionales y seguros.',
    foto: 'assets/barbero 2.webp',
    habilidades: ['Coloración', 'Highlights', 'Tratamientos'],
    trabajos: [
      { img: 'assets/corte3.webp', alt: 'Corte 3' },
      { img: 'assets/corte5.webp', alt: 'Corte 5' },
      { img: 'assets/Cortes/Corte 9.jpeg', alt: 'Corte 9' },
      { img: 'assets/Cortes/Corte 12.jpeg', alt: 'Corte 12' }
    ]
  },
  leo: {
    nombre: 'Leo',
    rol: 'Maestro Barbero',
    bio: 'Experto en barbería clásica y técnicas modernas. Con 10 años de trayectoria internacional, Leo garantiza un servicio de lujo. Su atención al detalle y pasión por el oficio lo convierten en una referencia en el mundo de la barbería profesional.',
    foto: 'assets/barbero 3.webp',
    habilidades: ['Barbería Clásica', 'Afeitado Profesional', 'Diseño Facial'],
    trabajos: [
      { img: 'assets/corte2.webp', alt: 'Corte 2' },
      { img: 'assets/corte6.webp', alt: 'Corte 6' },
      { img: 'assets/Cortes/Corte 8.jpeg', alt: 'Corte 8' },
      { img: 'assets/Cortes/Corte 11.jpeg', alt: 'Corte 11' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Obtener ID del barbero desde URL
  const urlParams = new URLSearchParams(window.location.search);
  const barberoId = (urlParams.get('id') || 'diego').toLowerCase();

  // Validar que el barbero existe
  if (!BARBEROS_DATA[barberoId]) {
    document.body.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Barbero no encontrado</p>';
    return;
  }

  const barbero = BARBEROS_DATA[barberoId];

  // Actualizar título y meta
  document.title = `${barbero.nombre} | Oklahoma Studio`;

  // Cargar datos en el DOM
  document.getElementById('barbero-name').textContent = barbero.nombre;
  document.getElementById('barbero-role').textContent = barbero.rol;
  document.getElementById('barbero-bio').textContent = barbero.bio;
  
  // Actualizar imagen
  const imgElement = document.getElementById('barbero-image');
  imgElement.src = barbero.foto;
  imgElement.alt = barbero.nombre;

  // Cargar habilidades
  const skillsContainer = document.getElementById('barbero-skills');
  skillsContainer.innerHTML = '';
  barbero.habilidades.forEach(habilidad => {
    const badge = document.createElement('span');
    badge.className = 'skill-badge';
    badge.textContent = habilidad;
    skillsContainer.appendChild(badge);
  });

  // Cargar botón de reserva con nombre del barbero
  const reserveBtn = document.getElementById('barbero-reserve-btn');
  reserveBtn.textContent = `Reservar con ${barbero.nombre}`;
  reserveBtn.setAttribute('data-barbero', barbero.nombre);

  // Cuando se abre el modal, preseleccionar el barbero
  reserveBtn.addEventListener('click', function() {
    setTimeout(() => {
      const selectBarbero = document.getElementById('res-barbero');
      if (selectBarbero) {
        selectBarbero.value = barbero.nombre;
      }
    }, 100);
  });

  // Cargar galería
  const galleryContainer = document.getElementById('barbero-gallery');
  galleryContainer.innerHTML = '';
  
  barbero.trabajos.forEach(trabajo => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
      <div class="gallery-image-wrapper">
        <img 
          src="${trabajo.img}" 
          loading="lazy" 
          alt="${trabajo.alt}" 
          class="gallery-image" 
        />
        <div class="gallery-overlay">
          <img 
            src="assets/Oklahoma - Logo.png" 
            loading="lazy" 
            alt="Oklahoma Logo" 
            class="overlay-logo" 
          />
        </div>
      </div>
    `;
    galleryContainer.appendChild(galleryItem);
  });

  // Scroll to top
  window.scrollTo(0, 0);
});
