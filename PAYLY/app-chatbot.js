// app-chatbot.js — chatbot sencillo para Payly (nombres en español)
(function(){
  const contenedor = porId ? porId('chatbot-contenedor') : document.getElementById('chatbot-contenedor');
  if(!contenedor) return;

  const boton = porId('boton-chatbot');
  const ventana = porId('ventana-chatbot');
  const cerrar = porId('cerrar-chatbot');
  const lista = porId('chatbot-mensajes');
  const formulario = porId('chatbot-formulario');
  const entrada = porId('chatbot-entrada');

  function agregarMensaje(texto, tipo){
    if(!lista) return;
    const burbuja = document.createElement('div');
    burbuja.className = 'chatbot-mensaje ' + (tipo === 'usuario' ? 'usuario' : 'bot');
    burbuja.textContent = texto;
    lista.appendChild(burbuja);
    lista.scrollTop = lista.scrollHeight;
  }

  function obtenerRespuesta(texto){
    const t = (texto || '').toLowerCase();
    if(t.includes('ahorro') || t.includes('meta')){
      return 'Para tus metas de ahorro puedes usar la sección "Ahorro". Ahí registras el objetivo, cuánto llevas y usas la simulación para ver cuánto te falta y cuándo podrías lograrlo.';
    }
    if(t.includes('gasto') || t.includes('ingreso')){
      return 'En "Ingresos y Gastos" puedes registrar cada movimiento y filtrarlos por fecha, tipo y categoría para ver en qué se te va más tu dinero.';
    }
    if(t.includes('registro') || t.includes('cuenta')){
      return 'Si quieres simular un registro de usuario, entra a la página "Registro" en el menú. Ahí llenas tus datos básicos como si crearas tu cuenta de Payly.';
    }
    if(t.includes('mapa') || t.includes('ubicacion') || t.includes('ubicación') || t.includes('contacto') || t.includes('telefono') || t.includes('teléfono')){
      return 'En la página "Sobre Payly" encontrarás el mapa de ubicación y los teléfonos de contacto que usamos para el proyecto.';
    }
    if(t.includes('objetivo') || t.includes('proyecto') || t.includes('sitio')){
      return 'Este sitio fue desarrollado como proyecto escolar para practicar el control de ingresos, gastos y metas de ahorro de una forma visual y sencilla.';
    }
    return 'No estoy seguro de eso, pero puedo ayudarte con dudas de gastos, ahorro, registro, mapa de contacto u objetivo del proyecto 😊';
  }

  if(boton && ventana){
    boton.addEventListener('click', function(){
      ventana.classList.toggle('oculto');
      if(!ventana.classList.contains('oculto') && entrada){
        entrada.focus();
      }
    });
  }
  if(cerrar && ventana){
    cerrar.addEventListener('click', function(){
      ventana.classList.add('oculto');
    });
  }

  if(formulario){
    formulario.addEventListener('submit', function(e){
      e.preventDefault();
      if(!entrada) return;
      const texto = entrada.value.trim();
      if(!texto) return;
      agregarMensaje(texto, 'usuario');
      const respuesta = obtenerRespuesta(texto);
      setTimeout(function(){ agregarMensaje(respuesta, 'bot'); }, 200);
      entrada.value = '';
      entrada.focus();
    });
  }

  // Mensaje de bienvenida
  agregarMensaje('Hola, soy el asistente de Payly. Pregunta sobre tus ingresos, gastos o metas de ahorro y te doy tips rápidos.', 'bot');
})();