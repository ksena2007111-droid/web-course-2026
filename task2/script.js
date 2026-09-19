// Анимация появления блоков при скролле
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  const galleryCards = document.querySelectorAll('.gallery-card');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => sectionObserver.observe(el));

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  galleryCards.forEach(card => cardObserver.observe(card));

  // Текст следует за курсором в карточках с группой фото
  const parallaxCards = document.querySelectorAll(
    '.gallery-card--pair, .gallery-card--quad, .gallery-card--five'
  );

  parallaxCards.forEach(card => {
    const inner = card.querySelector('.gallery-text-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'translate(0, 0)';
    });
  });
});
