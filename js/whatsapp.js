/** Arma el enlace de chat de WhatsApp. Devuelve '' si el número no tiene dígitos. */
export function whatsappUrl(numero, mensaje = '') {
  const digits = String(numero ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Apunta todos los [data-whatsapp] al chat configurado; si el número es inválido, deja el href original. */
export function initWhatsapp({ numero, mensaje }, root = document) {
  const url = whatsappUrl(numero, mensaje);
  if (!url) return;
  root.querySelectorAll('[data-whatsapp]').forEach((link) => link.setAttribute('href', url));
}
