function inicializarCanvasFirma({ canvasId, inputId, btnGuardarId, btnBorrarId, modalId }) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const input = document.getElementById(inputId);
  const btnGuardar = document.getElementById(btnGuardarId);
  const btnBorrar = document.getElementById(btnBorrarId);
  const modal = document.getElementById(modalId);

  let isDrawing = false;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  modal.addEventListener('shown.bs.modal', () => {
    resizeCanvas();
  });

  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  canvas.addEventListener("touchend", () => {
    isDrawing = false;
    ctx.closePath();
  });

  btnBorrar.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  btnGuardar.addEventListener("click", () => {
    const dataURL = canvas.toDataURL("image/png");
    input.value = dataURL;
  });
}

// Inicializa canvas
inicializarCanvasFirma({
  canvasId: "canvaVisitante",
  inputId: "firmavisitante",
  btnGuardarId: "guardarVisit",
  btnBorrarId: "borrarVisit",
  modalId: "modalVisitante"
});

inicializarCanvasFirma({
  canvasId: "canvaAutorizante",
  inputId: "firmaautorizacion",
  btnGuardarId: "guardarAutorizante",
  btnBorrarId: "borrarAutorizante",
  modalId: "modalAutorizante"
});

// Campos en orden para validar
const camposOrden = [
  'name',
  'email',
  'date',
  'timein',
  'timeout',
  'motivo',
  'firmavisitante',
  'autorizante',  
  'firmaautorizacion'
];

// Funciones para obtener valor y mostrar etiqueta
function obtenerValor(id) {
  if (id === 'autorizante') {
    const radios = document.getElementsByName('autorizante');
    return Array.from(radios).some(r => r.checked);
  }
  return document.getElementById(id)?.value.trim();
}

function mostrarNombreCampo(id) {
  const label = document.querySelector(`[for="${id}"]`);
  if (label) return label.innerText;
  if (id === 'autorizante') return 'Autorizado por';
  return id;
}

function verificarAnteriores(actualIndex) {
  for (let i = 0; i < actualIndex; i++) {
    const campoId = camposOrden[i];
    if (!obtenerValor(campoId)) {
      alert(`Por favor, complete primero el campo "${mostrarNombreCampo(campoId)}"`);
      const campoElemento = document.getElementById(campoId);
      if (campoElemento) campoElemento.focus();
      return false;
    }
  }
  return true;
}

// Validar orden de ingreso para campos normales
camposOrden.forEach((campoId, index) => {
  if (['firmavisitante', 'firmaautorizacion', 'autorizante'].includes(campoId)) {
    return; // ya están manejados por separado
  }

  const campo = document.getElementById(campoId);
  if (campo) {
    campo.addEventListener('focus', () => {
      verificarAnteriores(index);
    });
  }
});


// Abrir modal visitante solo si validación pasa
document.getElementById('btnAbrirModalVisitante').addEventListener('click', () => {
  const index = camposOrden.indexOf('firmavisitante');
  if (!verificarAnteriores(index)) return;

  const modalVisitante = new bootstrap.Modal(document.getElementById('modalVisitante'));
  modalVisitante.show();
});

// Abrir modal autorizante solo si validación pasa
document.getElementById('btnAbrirModalAutorizante').addEventListener('click', () => {
  const index = camposOrden.indexOf('firmaautorizacion');
  if (!verificarAnteriores(index)) return;

  const modalAutorizante = new bootstrap.Modal(document.getElementById('modalAutorizante'));
  modalAutorizante.show();
});

// Validar selección de radios autorizante
const radiosAutorizante = document.getElementsByName('autorizante');
radiosAutorizante.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const index = camposOrden.indexOf('autorizante');
    if (!verificarAnteriores(index)) {
      e.target.checked = false;
    }
  });
});

// Mostrar toasts con bootstrap
document.addEventListener('DOMContentLoaded', function () {
  const toastElList = [].slice.call(document.querySelectorAll('.toast'));
  toastElList.forEach(toastEl => {
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
  });
});

// Función para limpiar formulario y canvas
function limpiarFormulario() {
  document.querySelector("form").reset();

  const canvaVisitante = document.getElementById("canvaVisitante");
  const canvaAutorizante = document.getElementById("canvaAutorizante");

  if (canvaVisitante) {
    const ctx = canvaVisitante.getContext("2d");
    ctx.clearRect(0, 0, canvaVisitante.width, canvaVisitante.height);
  }

  if (canvaAutorizante) {
    const ctx = canvaAutorizante.getContext("2d");
    ctx.clearRect(0, 0, canvaAutorizante.width, canvaAutorizante.height);
  }
}
