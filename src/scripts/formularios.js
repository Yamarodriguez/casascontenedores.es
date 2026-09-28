/**
 * Envio de los formularios (Formulario.astro y FormularioPasos.astro) sin
 * salir de la pagina: se manda a web3forms en segundo plano y, en el mismo
 * sitio del formulario, sale "Mensaje enviado". Sin JavaScript el formulario
 * se envia como siempre y web3forms redirige a /gracias/.
 */
const WHATSAPP = (form) => form.getAttribute('data-whatsapp') || '';

function aviso(form, tipo, titulo, texto) {
  let caja = form.parentElement.querySelector('.form-aviso');
  if (!caja) {
    caja = document.createElement('div');
    caja.className = 'form-aviso';
    caja.setAttribute('role', 'status');
    caja.setAttribute('aria-live', 'polite');
    caja.tabIndex = -1;
    form.insertAdjacentElement('afterend', caja);
  }
  caja.dataset.tipo = tipo;
  caja.innerHTML = '';
  const t = document.createElement('p');
  t.className = 'form-aviso__titulo';
  t.textContent = titulo;
  const p = document.createElement('p');
  p.className = 'form-aviso__texto';
  p.textContent = texto;
  caja.append(t, p);
  if (tipo === 'error' && WHATSAPP(form)) {
    const a = document.createElement('a');
    a.className = 'form-aviso__enlace';
    a.href = WHATSAPP(form);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Escríbenos por WhatsApp';
    caja.append(a);
  }
  caja.hidden = false;
  return caja;
}

async function enviar(ev) {
  const form = ev.currentTarget;
  ev.preventDefault();
  if (!form.reportValidity()) return;
  const boton = form.querySelector('button[type="submit"]');
  const rotulo = boton ? boton.textContent : '';
  if (boton) { boton.disabled = true; boton.textContent = 'Enviando…'; }

  const datos = new FormData(form);
  datos.delete('redirect'); // con JavaScript no se sale de la pagina
  try {
    const r = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: datos });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(j.message || `HTTP ${r.status}`);
    const nombre = String(datos.get('nombre') || '').trim().split(/\s+/)[0];
    form.reset();
    form.hidden = true;
    aviso(form, 'ok', '¡Mensaje enviado!',
      `${nombre ? `Gracias, ${nombre}. ` : 'Gracias. '}Hemos recibido tu consulta y te contestaremos lo antes posible.`).focus();
  } catch (e) {
    aviso(form, 'error', 'No se ha podido enviar el mensaje',
      'Inténtalo de nuevo dentro de un momento o, si lo prefieres, escríbenos por WhatsApp.');
    if (boton) { boton.disabled = false; boton.textContent = rotulo; }
  }
}

document.querySelectorAll('form[data-web3forms]').forEach((form) => {
  if (form.dataset.listo) return;
  form.dataset.listo = '1';
  form.addEventListener('submit', enviar);
});
