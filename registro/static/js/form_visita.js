//evitar despliegue de opciones de inputs fecha, hora cliente y autorizante si no se respeta el camposOrden
document.addEventListener("DOMContentLoaded", () => {
const btnGuardarVisita = document.getElementById("guardarVisita")

    function validarTodoslosCamposCompletos(){
        const cliente = document.getElementById("cliente").value;
        const fecha = document.getElementById("fecha").value;
        const horaEntrada = document.getElementById("hora_entrada").value;
        const horaSalida = document.getElementById("hora_salida").value;
        const autorizante = document.getElementById("autorizante").value;
        const motivo = document.getElementById("motivo").value;
        return cliente && fecha && horaEntrada && horaSalida && autorizante && motivo
    }
    function validarCargaHoraria(e){
    //hora salida no debe ser menor a hora entrada
    const horaEntrada = document.getElementById("hora_entrada").value;
    const horaSalida = document.getElementById("hora_salida").value;
    if (horaSalida <= horaEntrada){
        e.preventDefault();
        mostrarToast("El horario de salida no puede ser menor que el horario de entra", "warning");
        return false;
    }
    return true;
    }

    const camposOrden = ["cliente", "fecha", "hora_entrada", "hora_salida", "motivo", "autorizante"]

    function obtenerValor(id){
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function mostrarNombreCampo(id){
        const label = document.querySelector(`[for="${id}"]`);
        return label ? label.innerText : id;
    }

    function validarOrdenCompletadoCampos(actualIndex){
        for (let i = 0; i < actualIndex; i++){
            const campoId = camposOrden[i];
            if (!obtenerValor(campoId)) return false;
        }
        return true;
    }

    function actualizarCamposHabilitados(){
        camposOrden.forEach((campoId, index) => {
            const campo = document.getElementById(campoId);
            if (!campo) return;

            const habilitar = validarOrdenCompletadoCampos(index);
            campo.disabled = !habilitar;

        });
    }

    actualizarCamposHabilitados();
    camposOrden.forEach((campoId) => {
        const campo = document.getElementById(campoId);
        if (!campo) return;
        
        campo.addEventListener("input", actualizarCamposHabilitados);
        campo.addEventListener("change", actualizarCamposHabilitados);
    });

    if (btnGuardarVisita) {
        btnGuardarVisita.addEventListener("click", (e) => {
            if (!validarTodoslosCamposCompletos()) {
                e.preventDefault();
                mostrarToast("Por favor, complete todos los campos", "warning");
                return;
            }
            if (!validarCargaHoraria(e)) {
                return;
            }
        });
    }
});