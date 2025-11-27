
// app-ingresosgastos.js — lógica de Ingresos y Gastos (nombres en español, sin Rebobinar)
let movimientos = JSON.parse(localStorage.getItem(CLAVES_LS.MOVS) || '[]');
let editandoMovId = null;

const cuerpoTabla = porId('cuerpo-tabla'), chipResumen = porId('chip-resumen');
const sumaIngresos = porId('suma-ingresos'), sumaGastos = porId('suma-gastos'), sumaBalance = porId('suma-balance');
const filtros = { texto:porId('filtro-texto'), tipo:porId('filtro-tipo'), categoria:porId('filtro-categoria'), desde:porId('filtro-desde'), hasta:porId('filtro-hasta') };

function guardarMovimientos(){ localStorage.setItem(CLAVES_LS.MOVS, JSON.stringify(movimientos)); }

porId('aplicar-filtros').addEventListener('click', renderizarMovimientos);
porId('limpiar-filtros').addEventListener('click', ()=>{ filtros.texto.value=''; filtros.tipo.value=''; filtros.categoria.value=''; filtros.desde.value=''; filtros.hasta.value=''; renderizarMovimientos(); });

porId('boton-agregar').addEventListener('click', ()=>{
  const tipo = porId('tipo').value;
  const concepto = porId('concepto').value.trim();
  const monto = parseFloat(porId('monto').value);
  const categoria = porId('categoria').value || '';
  const fecha = porId('fecha').value || hoyCadena();
  if(!concepto || !monto || monto<=0 || !categoria){ alert('Completa concepto, monto y categoría.'); return; }
  const m = { id:crypto.randomUUID(), tipo, concepto, monto, categoria, fecha };
  movimientos.unshift(m); guardarMovimientos(); renderizarMovimientos();
  porId('concepto').value=''; porId('monto').value=''; porId('categoria').value=''; porId('fecha').value='';
});

function pasaFiltros(m){
  const txt = filtros.texto.value.trim().toLowerCase();
  const tipo = filtros.tipo.value;
  const cat = filtros.categoria.value;
  const desde = filtros.desde.value, hasta = filtros.hasta.value;
  if(tipo && m.tipo!==tipo) return false;
  if(txt && !m.concepto.toLowerCase().includes(txt)) return false;
  if(cat && m.categoria!==cat) return false;
  if(desde && m.fecha < desde) return false;
  if(hasta && m.fecha > hasta) return false;
  return true;
}

function renderizarMovimientos(){
  const filtrados = movimientos.filter(pasaFiltros);
  let sumaIn=0,sumaOut=0;
  const filas = filtrados.map(m=>{
    if(m.tipo==='ingreso') sumaIn+=m.monto; else sumaOut+=m.monto;
    return `
      <tr class="fila-dato">
        <td>${escaparHtml(m.concepto)}</td>
        <td><span class="etiqueta" style="border-color:${m.tipo==='ingreso'?'rgba(16,185,129,.6)':'rgba(251,113,133,.6)'}">${capitalizar(m.tipo)}</span></td>
        <td class="monto ${m.tipo==='ingreso'?'ingreso':'gasto'}">${formatearDinero(m.monto)}</td>
        <td>${escaparHtml(m.categoria||'-')}</td>
        <td>${m.fecha}</td>
        <td class="celda-acciones">
          <div class="acciones">
            <button class="boton fantasma" onclick="abrirEditarMovimiento('${m.id}')">Editar</button>
            <button class="boton peligro" onclick="eliminarMovimiento('${m.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  });
  cuerpoTabla.innerHTML = filas.join('') || `<tr><td colspan="6"><div class="etiqueta">No hay movimientos. Agrega el primero.</div></td></tr>`;
  const bal = sumaIn - sumaOut;
  sumaIngresos.textContent = formatearDinero(sumaIn); sumaGastos.textContent = formatearDinero(sumaOut); sumaBalance.textContent = formatearDinero(bal);
  chipResumen.textContent = `Balance: ${formatearDinero(bal)}`;
}

function abrirEditarMovimiento(id){
  const m = movimientos.find(x=>x.id===id); if(!m) return;
  editandoMovId = id;
  porId('e-tipo').value = m.tipo;
  porId('e-concepto').value = m.concepto;
  porId('e-monto').value = m.monto;
  porId('e-categoria').value = m.categoria || 'Otros';
  porId('e-fecha').value = m.fecha;
  abrirModal('#modal-editar-mov');
}
porId('guardar-editar-mov').addEventListener('click', ()=>{
  const idx = movimientos.findIndex(x=>x.id===editandoMovId); if(idx<0) return;
  const antes = {...movimientos[idx]};
  const actualizado = {
    ...antes,
    tipo: porId('e-tipo').value,
    concepto: porId('e-concepto').value.trim(),
    monto: parseFloat(porId('e-monto').value),
    categoria: porId('e-categoria').value,
    fecha: porId('e-fecha').value || antes.fecha
  };
  if(!actualizado.concepto || !actualizado.monto || actualizado.monto<=0 || !actualizado.categoria){ alert('Datos inválidos.'); return; }
  movimientos[idx] = actualizado; guardarMovimientos(); cerrarModal('#modal-editar-mov'); renderizarMovimientos();
});

function eliminarMovimiento(id){
  const idx = movimientos.findIndex(x=>x.id===id); if(idx<0) return;
  movimientos.splice(idx,1);
  guardarMovimientos(); renderizarMovimientos();
}

// Inicio
(function init(){ renderizarMovimientos(); })();
