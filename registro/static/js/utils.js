// utils.js para ambos pasos del formulario
function mostrarToast(mensaje) {
  const toastContainer = document.getElementById('toast-container');
  const toastId = `toast-${Date.now()}`;

  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center position-fixed bg-warning top-1 end-0 p-2 text-white border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${mensaje}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  const newToast = document.getElementById(toastId);
  const toast = new bootstrap.Toast(newToast, { delay: 4000 });
  toast.show();

  newToast.addEventListener('hidden.bs.toast', () => {
    newToast.remove();
  });
}

function validarCorreo(email) {
  const mailReq = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return mailReq.test(email);
}

function inicializarCanvasFirma({ canvasId, inputId, btnGuardarId, btnBorrarId, modalId }) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas?.getContext("2d");
  const input = document.getElementById(inputId);
  const btnGuardar = document.getElementById(btnGuardarId);
  const btnBorrar = document.getElementById(btnBorrarId);
  const modal = document.getElementById(modalId);

  if (!canvas || !ctx || !input || !btnGuardar || !btnBorrar || !modal) return;

  let isDrawing = false;
  let hasDrawn = false;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
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
    hasDrawn = true;
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
 function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

   canvas.addEventListener("mousedown", (e) => {
    const pos = getMousePos(e);
    isDrawing = true;
    hasDrawn = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    console.log(hasDrawn)
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.closePath();
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
    ctx.closePath();
  });

  btnBorrar.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
  });

  btnGuardar.addEventListener("click", () => {
    if (!hasDrawn) {
      mostrarToast("Ingrese la firma");
      return;
    }
    input.value = canvas.toDataURL("image/png");

    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) modalInstance.hide();
  });
}
