
// compartido.js — utilidades comunes (nombres en español, sin Rebobinar)
const CLAVES_LS = { MOVS:'payly_movs_v2', METAS:'payly_goals_v2' };
const formatearDinero = n => (Number(n)||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const porId = id => document.getElementById(id);
const todos = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
const hoyCadena = () => new Date().toISOString().slice(0,10);
const capitalizar = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
function escaparHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }

// Modales
function abrirModal(sel){ document.querySelector(sel)?.setAttribute('aria-hidden','false'); }
function cerrarModal(sel){ document.querySelector(sel)?.setAttribute('aria-hidden','true'); }
todos('[data-cerrar]').forEach(btn=> btn.addEventListener('click', e=> cerrarModal(e.currentTarget.getAttribute('data-cerrar')) ));
todos('.modal-fondo').forEach(b=> b.addEventListener('click', e=>{ if(e.target===b) b.setAttribute('aria-hidden','true'); }));

// Archivo a DataURL
function archivoADataURL(file){
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
}
