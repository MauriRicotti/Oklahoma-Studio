// ===============================
// BARBERO PAGE - CARGAR PERFIL DINÁMICO
// ===============================

const BARBEROS_DATA = {
  diego: {
    nombre: 'Diego Barrios',
    rol: 'Especialista en Cortes',
    bio: 'Experto en cortes modernos y diseño de barba. Con 8 años de experiencia, Diego es conocido por su precisión y capacidad de crear estilos personalizados. Su pasión por la barbería se refleja en cada trabajo que realiza, combinando técnicas clásicas con tendencias actuales.',
    foto: 'assets/Perfil Diego Barrios.webp',
    instagram: 'https://instagram.com/diegobarrios.barbero',
    habilidades: ['Cortes Modernos', 'Diseño de Barba', 'Barbado Clásico'],
    experiencia: {
      anos: 8,
      cursos: ['Masterclass en Cortes Modernos', 'Formación en Barbería Italiana'],
      especializaciones: ['Cortes de Precisión', 'Diseño Personalizado', 'Tendencias Internacionales']
    },
    politicas: {
      sena: '30% del valor del servicio',
      cancelacion: 'Cancelación sin cargo hasta 24 horas antes de la cita',
      tolerancia: '15 minutos de tolerancia. Próximo turno se cobra completo'
    },
    disponibilidad: {
      lunes: false,
      martes: false,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: true,
      domingo: false
    },
    trabajos: [
      { img: 'assets/corte1.webp', alt: 'Corte 1' },
      { img: 'assets/corte4.webp', alt: 'Corte 4' },
      { img: 'assets/Cortes/Corte 7.jpeg', alt: 'Corte 7' },
      { img: 'assets/Cortes/Corte 10.jpeg', alt: 'Corte 10' }
    ],
    logros: [
      { img: 'assets/Logros Barberos/Logro Diego Barrios 1.webp', alt: 'Logro 1' },
      { img: 'assets/Logros Barberos/Logro Diego Barrios 2.webp', alt: 'Logro 2' },
      { img: 'assets/Logros Barberos/Logro Diego Barrios 3.webp', alt: 'Logro 3' },
      { img: 'assets/Logros Barberos/Logro Diego Barrios 4.webp', alt: 'Logro 4' },
      { img: 'assets/Logros Barberos/Logro Diego Barrios 5.webp', alt: 'Logro 5' }
    ]
  },
  martin: {
    nombre: 'Martin',
    rol: 'Colorista Premium',
    bio: 'Especialista en coloración y tratamientos capilares. Martin domina técnicas de tinte de última generación para transformaciones únicas. Con formación continua en las mejores academias de estilismo, garantiza resultados profesionales y seguros.',
    foto: 'assets/barbero 2.webp',
    instagram: 'https://instagram.com/martin.colorista',
    habilidades: ['Coloración', 'Highlights', 'Tratamientos'],
    experiencia: {
      anos: 6,
      cursos: ['Certificado en Colorimetría', 'Técnicas de Tinte Avanzadas'],
      especializaciones: ['Coloración Integral', 'Highlights Creativos', 'Tratamientos Capilares']
    },
    politicas: {
      sena: '30% del valor del servicio',
      cancelacion: 'Cancelación sin cargo hasta 24 horas antes de la cita',
      tolerancia: '15 minutos de tolerancia. Próximo turno se cobra completo'
    },
    disponibilidad: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false
    },
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
    instagram: 'https://instagram.com/leo.maestrobarbero',
    habilidades: ['Barbería Clásica', 'Afeitado Profesional', 'Diseño Facial'],
    experiencia: {
      anos: 10,
      cursos: ['Maestría en Barbería Internacional', 'Certificación en Afeitado Clásico', 'Especialidad en Diseño Facial'],
      especializaciones: ['Barbería Clásica Luxury', 'Afeitado con Navaja', 'Consultoría de Imagen']
    },
    politicas: {
      sena: '30% del valor del servicio',
      cancelacion: 'Cancelación sin cargo hasta 24 horas antes de la cita',
      tolerancia: '15 minutos de tolerancia. Próximo turno se cobra completo'
    },
    disponibilidad: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: true,
      domingo: false
    },
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

  // Cargar experiencia y credenciales
  if (barbero.experiencia) {
    document.getElementById('barbero-years').textContent = barbero.experiencia.anos;
    
    // Cargar cursos
    const cursosContainer = document.getElementById('barbero-cursos');
    cursosContainer.innerHTML = '';
    if (barbero.experiencia.cursos && barbero.experiencia.cursos.length > 0) {
      barbero.experiencia.cursos.forEach(curso => {
        const li = document.createElement('li');
        li.textContent = curso;
        cursosContainer.appendChild(li);
      });
    }

    // Cargar especializaciones
    const especializacionesContainer = document.getElementById('barbero-especializaciones');
    especializacionesContainer.innerHTML = '';
    if (barbero.experiencia.especializaciones && barbero.experiencia.especializaciones.length > 0) {
      barbero.experiencia.especializaciones.forEach(esp => {
        const li = document.createElement('li');
        li.textContent = esp;
        especializacionesContainer.appendChild(li);
      });
    }
  }

  // Cargar políticas
  if (barbero.politicas) {
    document.getElementById('barbero-policy-sena').textContent = barbero.politicas.sena;
    document.getElementById('barbero-policy-cancelacion').textContent = barbero.politicas.cancelacion;
    document.getElementById('barbero-policy-tolerancia').textContent = barbero.politicas.tolerancia;
  }

  // Generar tarjeta de disponibilidad
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const diasClaves = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const availabilityContainer = document.getElementById('barbero-availability');
  
  if (availabilityContainer && barbero.disponibilidad) {
    availabilityContainer.innerHTML = '';
    const calendarCard = document.createElement('div');
    calendarCard.className = 'availability-calendar';
    
    diasSemana.forEach((dia, index) => {
      const diaKey = diasClaves[index];
      const disponible = barbero.disponibilidad[diaKey];
      
      const diaDiv = document.createElement('div');
      diaDiv.className = `availability-day ${disponible ? 'available' : 'unavailable'}`;
      diaDiv.innerHTML = `
        <div class="day-label">${dia}</div>
        <div class="day-status">${disponible ? 'Disponible' : 'No disponible'}</div>
      `;
      calendarCard.appendChild(diaDiv);
    });
    
    availabilityContainer.appendChild(calendarCard);
  }

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

  // Cargar galería de logros (solo para Diego)
  const achievementsSection = document.getElementById('barbero-achievements-section');
  if (barberoId === 'diego' && barbero.logros && barbero.logros.length > 0) {
    achievementsSection.style.display = 'block';
    const achievementsContainer = document.getElementById('barbero-achievements');
    achievementsContainer.innerHTML = '';
    
    barbero.logros.forEach(logro => {
      const achievementItem = document.createElement('div');
      achievementItem.className = 'achievement-item';
      achievementItem.innerHTML = `
        <div class="achievement-image-wrapper">
          <img 
            src="${logro.img}" 
            loading="lazy" 
            alt="${logro.alt}" 
            class="achievement-image" 
          />
          <div class="achievement-overlay">
            <img 
              src="assets/Oklahoma - Logo.png" 
              loading="lazy" 
              alt="Oklahoma Logo" 
              class="overlay-logo" 
            />
          </div>
        </div>
      `;
      achievementsContainer.appendChild(achievementItem);
    });
  }

  // Inicializar modal de imágenes para la galería de trabajos y logros
  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalClose = document.querySelector('.modal-close');
  const galleryImageWrappers = document.querySelectorAll('.gallery-image-wrapper, .achievement-image-wrapper');

  // Abrir modal al hacer clic en la imagen
  galleryImageWrappers.forEach((wrapper) => {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', function(e) {
      e.stopPropagation();
      const img = this.querySelector('.gallery-image, .achievement-image');
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

  // Cerrar modal al hacer clic afuera de la imagen
  if (imageModal) {
    imageModal.addEventListener('click', function(e) {
      if (e.target === imageModal) {
        imageModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Scroll to top
  window.scrollTo(0, 0);
});