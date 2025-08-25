// Orden de los campos en el flujo
const camposOrden = [
  'autorizante',
  'motivo',
  'firmaautorizacion'
];

// Función para obtener el valor del campo
function obtenerValor(id) {
  if (id === 'autorizante') {
    const radios = document.getElementsByName('autorizante');
    return Array.from(radios).some(r => r.checked);
  }
  return document.getElementById(id)?.value.trim();
}

// Función para obtener el nombre legible del campo
function mostrarNombreCampo(id) {
  const label = document.querySelector(`[for="${id}"]`);
  if (label) return label.innerText;
  if (id === 'autorizante') return 'Autorizante';
  return id;
}

// Verificar que los campos anteriores estén completos
function verificarAnteriores(actualIndex) {
  for (let i = 0; i < actualIndex; i++) {
    const campoId = camposOrden[i];
    const valor = obtenerValor(campoId);

    if (!valor) {
      mostrarToast(`Por favor, complete primero el campo "${mostrarNombreCampo(campoId)}"`);
      const elemento = document.getElementById(campoId);
      if (elemento) elemento.focus();
      return false;
    }
  }
  return true;
}

// Inicializar canvas de firma del autorizante
inicializarCanvasFirma({
  canvasId: "canvaAutorizante",
  inputId: "firmaautorizacion",
  btnGuardarId: "guardarAutorizante",
  btnBorrarId: "borrarAutorizante",
  modalId: "modalAutorizante"
});

// Validación en foco de los campos de texto
camposOrden.forEach((campoId, index) => {
  if (campoId === 'firmaautorizacion') return; // se maneja por separado
  const campo = document.getElementById(campoId);
  if (campo) {
    campo.addEventListener('focus', () => {
      verificarAnteriores(index);
    });
  }
});

// Validar selección de radio
const radios = document.getElementsByName('autorizante');
radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const index = camposOrden.indexOf('autorizante');
    if (!verificarAnteriores(index)) {
      e.target.checked = false;
    }
  });
});

// Abrir modal de firma del autorizante si todo lo anterior está bien
document.getElementById('btnAbrirModalAutorizante')?.addEventListener('click', () => {
  const index = camposOrden.indexOf('firmaautorizacion');
  if (!verificarAnteriores(index)) return;

  const modal = new bootstrap.Modal(document.getElementById('modalAutorizante'));
  modal.show();
});

function todosLosCamposAutorizanteCompletos() {
  const radioChecked = Array.from(document.getElementsByName('autorizante')).some(r => r.checked);
  const motivo = document.getElementById('motivo')?.value.trim();
  const firma = document.getElementById('firmaautorizacion')?.value;

  return radioChecked && motivo && firma;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnEnviar = document.getElementById('btnEnviar');

  if (btnEnviar) {
    btnEnviar.addEventListener('click', (e) => {
      if (!todosLosCamposAutorizanteCompletos()) {
        e.preventDefault(); // Evita la navegación
        mostrarToast('Por favor, complete todos los campos antes de continuar.');
      }
    });
  }
});