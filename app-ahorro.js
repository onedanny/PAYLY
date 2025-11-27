
// app-ahorro.js — lógica de metas de ahorro (nombres en español, sin Rebobinar)
let metas = JSON.parse(localStorage.getItem(CLAVES_LS.METAS) || '[]');
let editandoMetaId = null;
let simMetaId = null;
const listaMetas = porId('lista-metas');
function guardarMetas(){ localStorage.setItem(CLAVES_LS.METAS, JSON.stringify(metas)); }
function porcentajeAvance(ahorrado,objetivo){ const t=Number(objetivo)||0, s=Number(ahorrado)||0; if(t<=0) return 0; return Math.max(0, Math.min(100, (s/t)*100)); }

function renderizarMetas(){
  listaMetas.innerHTML = metas.map(g=>{
    const pct = porcentajeAvance(g.ahorrado, g.objetivo);
    return `
      <article class="tarjeta-meta" id="meta-${g.id}">
        <div class="circulo" style="--pct:${pct}">
          <div class="circulo-interno ${pct>=100?'pulso':''}">
            ${g.imagen?`<img src="${g.imagen}" alt="Imagen de ${escaparHtml(g.nombre)}">`:`<span class="etiqueta">Sin imagen</span>`}
          </div>
        </div>
        <div class="info-meta">
          <div class="nombre">${escaparHtml(g.nombre)}</div>
          <div class="meta-detalle">Objetivo: ${formatearDinero(g.objetivo)} • Limite: ${g.limite||'—'}</div>
          <div class="meta-detalle">${formatearDinero(g.ahorrado)} / ${formatearDinero(g.objetivo)} (${pct.toFixed(0)}%)</div>
          <div class="deposito">
            <div class="grupo-entrada" style="max-width:220px">
              <span class="prefijo">$ MXN</span>
              <input type="number" step="0.01" class="entrada con-prefijo" placeholder="Depositar a meta" id="deposito-${g.id}">
            </div>
            <button class="boton" onclick="depositarEnMeta('${g.id}')">Depositar</button>
          </div>
        </div>
        <div class="acciones-meta">
          <button class="boton secundario" onclick="abrirEditarMeta('${g.id}')">Editar</button>
          <button class="boton simular" onclick="abrirSimulacion('${g.id}')">Simular</button>
          <button class="boton peligro" onclick="eliminarMeta('${g.id}')">Eliminar</button>
        </div>
      </article>
    `;
  }).join('') || `<div class="etiqueta">No hay metas. Usa “+ Agregar meta”.</div>`;
}

porId('boton-agregar-meta').addEventListener('click', ()=>{
  editandoMetaId = null;
  porId('modal-meta-titulo').textContent = 'Nueva meta';
  porId('meta-nombre').value=''; porId('meta-objetivo').value=''; porId('meta-ahorrado').value=''; porId('meta-limite').value=''; porId('meta-imagen').value='';
  abrirModal('#modal-meta');
});
porId('guardar-meta').addEventListener('click', async ()=>{
  const nombre = porId('meta-nombre').value.trim();
  const objetivo = parseFloat(porId('meta-objetivo').value);
  const ahorrado  = parseFloat(porId('meta-ahorrado').value || 0);
  const limite = porId('meta-limite').value || '';
  if(!nombre || !objetivo || objetivo<=0){ alert('Completa nombre y meta válida.'); return; }
  const file = porId('meta-imagen').files[0];
  const imgData = file ? await archivoADataURL(file) : null;

  if(editandoMetaId){
    const idx = metas.findIndex(x=>x.id===editandoMetaId); if(idx<0) return;
    const antes = {...metas[idx]};
    metas[idx] = {...metas[idx], nombre, objetivo, ahorrado:isNaN(ahorrado)?antes.ahorrado:ahorrado, limite, imagen: imgData ?? antes.imagen};
    guardarMetas();
  }else{
    const g = { id:crypto.randomUUID(), nombre, objetivo, ahorrado:isNaN(ahorrado)?0:ahorrado, limite, imagen:imgData };
    metas.unshift(g); guardarMetas();
  }
  cerrarModal('#modal-meta'); renderizarMetas();
});

function abrirEditarMeta(id){
  const g = metas.find(x=>x.id===id); if(!g) return;
  editandoMetaId = id;
  porId('modal-meta-titulo').textContent = 'Editar meta';
  porId('meta-nombre').value=g.nombre; porId('meta-objetivo').value=g.objetivo; porId('meta-ahorrado').value=g.ahorrado; porId('meta-limite').value=g.limite||''; porId('meta-imagen').value='';
  abrirModal('#modal-meta');
}

function eliminarMeta(id){
  const idx = metas.findIndex(x=>x.id===id); if(idx<0) return;
  const meta = metas[idx];
  const nombre = meta?.nombre || 'esta meta';
  if(!confirm(`¿Seguro que deseas eliminar la meta "${nombre}"?`)) return;
  metas.splice(idx,1);
  guardarMetas(); renderizarMetas();
}

function depositarEnMeta(id){
  const g = metas.find(x=>x.id===id); if(!g) return;
  const entrada = porId(`deposito-${id}`);
  const val = parseFloat(entrada.value);
  if(!val || val<=0){ entrada.focus(); return; }
  g.ahorrado = Math.max(0, (Number(g.ahorrado)||0) + val);
  guardarMetas(); renderizarMetas();
  const tarjeta = document.getElementById(`meta-${id}`); tarjeta?.querySelector('.circulo-interno')?.classList.add('pulso');
  setTimeout(()=>tarjeta?.querySelector('.circulo-interno')?.classList.remove('pulso'), 650);
  entrada.value='';
}

/* ====== Simulación ====== */
function abrirSimulacion(id){
  simMetaId = id;
  const g = metas.find(x=>x.id===id); if(!g) return;
  porId('info-sim-meta').textContent = `Meta: ${g.nombre} • Restante: ${formatearDinero(Math.max(0,(g.objetivo - g.ahorrado)))}`;
  porId('sim-frecuencia').value = 'mensual';
  porId('sim-cantidad').value = '';
  porId('sim-periodos').textContent = '—';
  porId('sim-fecha-fin').textContent = '—';
  abrirModal('#modal-simular');
}
function calcularSimulacion(){
  const g = metas.find(x=>x.id===simMetaId); if(!g) return;
  const freq = porId('sim-frecuencia').value;
  const cantidad = parseFloat(porId('sim-cantidad').value);
  const restante = Math.max(0, (g.objetivo - g.ahorrado));
  if(restante<=0){ porId('sim-periodos').textContent='0'; porId('sim-fecha-fin').textContent=hoyCadena(); return; }
  if(!cantidad || cantidad<=0){ porId('sim-periodos').textContent='—'; porId('sim-fecha-fin').textContent='—'; return; }
  const periodos = Math.ceil(restante / cantidad);
  const fin = sumarPeriodos(new Date(), freq, periodos);
  porId('sim-periodos').textContent = String(periodos);
  porId('sim-fecha-fin').textContent = fin.toISOString().slice(0,10);
}
function sumarPeriodos(fecha, freq, n){
  const d = new Date(fecha);
  if(freq==='diaria'){ d.setDate(d.getDate() + n); }
  else if(freq==='semanal'){ d.setDate(d.getDate() + 7*n); }
  else if(freq==='mensual'){ d.setMonth(d.getMonth() + n); }
  else if(freq==='anual'){ d.setFullYear(d.getFullYear() + n); }
  return d;
}
porId('sim-frecuencia').addEventListener('change', calcularSimulacion);
porId('sim-cantidad').addEventListener('input', calcularSimulacion);
porId('sim-recalcular').addEventListener('click', calcularSimulacion);

// Inicio
(function init(){ renderizarMetas(); })();
