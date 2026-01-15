/* ===============================
   ACORDEÓN FAQ - NUEVO DISEÑO
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const contentId = this.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            
            // Cerrar todos los demás
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

    // Botón contactar
    const contactBtn = document.querySelector('.faq-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            // Scroll a la sección de contacto
            const contactSection = document.querySelector('#contacto');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
