const URL_COMENTARIOS = "https://script.google.com/macros/s/AKfycbyjoU7ItsL6m0GkkWPyRsKSLW1s2GmHhwtarq3arnhmeerFh_5LKTrw2Guxct_VdnaaWQ/exec";

const contenedorTrabajosResenas = document.getElementById("trabajos-resenas-container");

function crearEstrellas(calificacion) {
    const nota = Math.max(1, Math.min(5, Number(calificacion) || 5));
    return "★".repeat(nota) + "☆".repeat(5 - nota);
}

function crearTarjetaTrabajo(trabajo) {
    const estrellas = crearEstrellas(trabajo.calificacion);

    const imagenHTML = trabajo.imagen
        ? `<img src="${trabajo.imagen}" alt="${trabajo.tituloTrabajo}" class="trabajo-imagen">`
        : `<div class="trabajo-placeholder">Agrega aquí la foto del computador</div>`;

    return `
        <article class="trabajo-resena-card">
            <div class="trabajo-imagen-wrap">
                ${imagenHTML}
            </div>

            <div class="trabajo-contenido">
                <h3>${trabajo.tituloTrabajo}</h3>

                <p class="trabajo-descripcion">
                    ${trabajo.descripcionTrabajo}
                </p>

                <div class="resena-box">
                    <div class="resena-header">
                        <strong>${trabajo.nombreCliente}</strong>
                        <span class="resena-estrellas">${estrellas}</span>
                    </div>

                    <p class="resena-texto">“${trabajo.comentarioCliente}”</p>
                </div>
            </div>
        </article>
    `;
}

function mostrarTrabajosResenas(trabajos) {
    if (!contenedorTrabajosResenas) return;

    if (!trabajos || !trabajos.length) {
        contenedorTrabajosResenas.innerHTML = `
            <p class="sin-resenas">
                Pronto se mostrarán trabajos realizados y opiniones de clientes.
            </p>
        `;
        return;
    }

    contenedorTrabajosResenas.innerHTML = trabajos
        .map(crearTarjetaTrabajo)
        .join("");
}

function cargarTrabajosResenas() {
    if (!contenedorTrabajosResenas) return;

    contenedorTrabajosResenas.innerHTML = `
        <p class="sin-resenas">Cargando reseñas...</p>
    `;

    const callbackName = "recibirResenasFreddyFix";

    window[callbackName] = function(data) {
        mostrarTrabajosResenas(data);

        const scriptUsado = document.getElementById("script-resenas-freddyfix");
        if (scriptUsado) scriptUsado.remove();

        delete window[callbackName];
    };

    const script = document.createElement("script");
    script.id = "script-resenas-freddyfix";
    script.src = `${URL_COMENTARIOS}?callback=${callbackName}&t=${Date.now()}`;

    script.onerror = function() {
        contenedorTrabajosResenas.innerHTML = `
            <p class="sin-resenas">
                No se pudieron cargar las reseñas en este momento.
            </p>
        `;
    };

    document.body.appendChild(script);
}

cargarTrabajosResenas();