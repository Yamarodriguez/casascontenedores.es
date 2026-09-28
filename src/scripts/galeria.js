/**
 * Visor de las galerias de fotos ([data-galeria], las pinta render.js): al
 * pulsar una miniatura se abre la foto grande en un <dialog>, con anterior /
 * siguiente, flechas del teclado, Esc y clic fuera para cerrar. Sin
 * JavaScript, cada miniatura enlaza a su foto grande.
 */
const galerias = document.querySelectorAll('[data-galeria]');

if (galerias.length) {
  const visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.setAttribute('aria-label', 'Foto ampliada');
  visor.innerHTML =
    '<figure class="visor__foto"><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="visor__boton visor__cerrar" aria-label="Cerrar">×</button>' +
    '<button type="button" class="visor__boton visor__anterior" aria-label="Foto anterior">‹</button>' +
    '<button type="button" class="visor__boton visor__siguiente" aria-label="Foto siguiente">›</button>' +
    '<p class="visor__cuenta" aria-live="polite"></p>';
  document.body.append(visor);
  const img = visor.querySelector('img');
  const pie = visor.querySelector('figcaption');
  const cuenta = visor.querySelector('.visor__cuenta');
  let enlaces = [];
  let actual = 0;

  const mostrar = (i) => {
    actual = (i + enlaces.length) % enlaces.length;
    const a = enlaces[actual];
    const mini = a.querySelector('img');
    img.src = a.href;
    img.alt = mini ? mini.alt : '';
    pie.textContent = mini ? mini.alt : '';
    cuenta.textContent = `${actual + 1} / ${enlaces.length}`;
  };

  galerias.forEach((g) => {
    g.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-galeria-foto]');
      if (!a || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
      ev.preventDefault();
      enlaces = [...g.querySelectorAll('a[data-galeria-foto]')];
      mostrar(enlaces.indexOf(a));
      visor.showModal();
    });
  });

  visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());
  visor.querySelector('.visor__anterior').addEventListener('click', () => mostrar(actual - 1));
  visor.querySelector('.visor__siguiente').addEventListener('click', () => mostrar(actual + 1));
  visor.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft') mostrar(actual - 1);
    if (ev.key === 'ArrowRight') mostrar(actual + 1);
  });
  // clic en el fondo oscuro (fuera de la foto y de los botones): cerrar
  visor.addEventListener('click', (ev) => { if (ev.target === visor) visor.close(); });
  visor.addEventListener('close', () => { img.removeAttribute('src'); });
}
