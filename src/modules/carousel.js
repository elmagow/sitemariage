/**
 * Hero photo carousel — auto-play (3s) with prev/next arrows.
 * Crossfade transition via CSS opacity.
 */

let timer = null;
let current = 0;
let slides = [];

function show(index) {
  slides[current].classList.remove('hero__carousel-slide--active');
  current = (index + slides.length) % slides.length;
  slides[current].classList.add('hero__carousel-slide--active');
}

function next() { show(current + 1); }
function prev() { show(current - 1); }

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(next, 3000);
}

export function initCarousel() {
  slides = Array.from(document.querySelectorAll('.hero__carousel-slide'));
  if (slides.length < 2) return;

  const prevBtn = document.querySelector('.hero__carousel-arrow--prev');
  const nextBtn = document.querySelector('.hero__carousel-arrow--next');

  prevBtn?.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn?.addEventListener('click', () => { next(); resetTimer(); });

  // Auto-play
  timer = setInterval(next, 3000);
}
