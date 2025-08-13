    // Mostrar toasts con bootstrap back
    document.addEventListener('DOMContentLoaded', function () {
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.forEach(toastEl => {
        const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
        toast.show();
        console.log("mostrando toast")
    });
    });

    // Mostrar toast front
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


    document.querySelector(".fecha-fil").addEventListener("submit", function(e) {
        const start = document.getElementById("fecha_inicio").value;
        const end = document.getElementById("fecha_fin").value;
        if ((start && !end) || (!start && end) || (!start && !end)) {
            e.preventDefault();
            mostrarToast("Por favor, complete ambas fechas para filtrar.");
        }
        });
