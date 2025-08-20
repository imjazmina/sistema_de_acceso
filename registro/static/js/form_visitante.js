document.addEventListener("DOMContentLoaded", () => {
  // Inicializar canvas firma visitante
  inicializarCanvasFirma({
    canvasId: "canvaVisitante",
    inputId: "firmavisitante",
    btnGuardarId: "guardarVisit",
    btnBorrarId: "borrarVisit",
    modalId: "modalVisitante"
  });

  // Validación en orden
  const camposOrden = ['name', 'email', 'firmavisitante'];

  function obtenerValor(id) {
    return document.getElementById(id)?.value.trim();
  }

  function mostrarNombreCampo(id) {
    const label = document.querySelector(`[for="${id}"]`);
    return label ? label.innerText : id;
  }

  function verificarAnteriores(actualIndex) {
    for (let i = 0; i < actualIndex; i++) {
      const campoId = camposOrden[i];
      if (!obtenerValor(campoId)) {
        mostrarToast(`Por favor, complete primero el campo "${mostrarNombreCampo(campoId)}"`);
        const campoElemento = document.getElementById(campoId);
        if (campoElemento) campoElemento.focus();
        return false;
      }
      if (campoId === 'email' && !validarCorreo(obtenerValor(campoId))) {
        mostrarToast("Ingrese un correo electrónico válido.");
        return false;
      }
    }
    return true;
  }

  camposOrden.forEach((campoId, index) => {
    if (campoId === 'firmavisitante') return;
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.addEventListener('focus', () => {
        verificarAnteriores(index);
      });
    }
  });

  // Abrir modal firma visitante
  document.getElementById('btnAbrirModalVisitante')?.addEventListener('click', () => {
    const index = camposOrden.indexOf('firmavisitante');
    if (!verificarAnteriores(index)) return;
    const modal = new bootstrap.Modal(document.getElementById('modalVisitante'));
    modal.show();
  });

  // Inactividad
  const temporizador = 60000;
  let inactividadTimeout;
  let temporizadorIniciado = false;

  function limpiarFormulario() {
    document.querySelector("form")?.reset();
    const canvas = document.getElementById("canvaVisitante");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function limpiarmemoria(event) {
    if (event.target.id !== "name" || temporizadorIniciado) return;
    const valor = event.target.value.trim();
    if (valor !== "") {
      temporizadorIniciado = true;
      inactividadTimeout = setTimeout(() => {
        mostrarToast("Se ha terminado el tiempo. El formulario será reiniciado.");
        limpiarFormulario();
        temporizadorIniciado = false;
      }, temporizador);
    }
  }

  document.getElementById("name")?.addEventListener("input", limpiarmemoria);

  document.getElementById("btnGuardar")?.addEventListener("click", () => {
    clearTimeout(inactividadTimeout);
    temporizadorIniciado = false;
  });
});

function todosLosCamposAutorizanteCompletos() 
{ const radioChecked = Array.from(document.getElementsByName('autorizante')).some(r => r.checked); 
  const motivo = document.getElementById('motivo')?.value.trim(); 
  const firma = document.getElementById('firmaautorizacion')?.value; 
  return radioChecked && motivo && firma;
 }  

document.getElementById('btnGuardar').addEventListener('click', (e) => {
  if (!todosLosCamposAutorizanteCompletos()) {
    e.preventDefault(); // Evita que redirija
    mostrarToast('Por favor, complete todos los campos antes de continuar.');
  }
});
