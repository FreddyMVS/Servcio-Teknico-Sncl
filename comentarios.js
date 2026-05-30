const URL_COMENTARIOS = "https://script.google.com/macros/s/AKfycbyjoU7ItsL6m0GkkWPyRsKSLW1s2GmHhwtarq3arnhmeerFh_5LKTrw2Guxct_VdnaaWQ/exec";

const contenedorTrabajosResenas = document.getElementById("trabajos-resenas-container");

function crearEstrellas(calificacion) {
    const nota = Math.max(1, Math.min(5, Number(calificacion) || 5));
    return "★".repeat(nota) + "☆".repeat(5 - nota);
}

function crearTarjetaTrabajo(trabajo, index) {
    const estrellas = crearEstrellas(trabajo.calificacion);
    const imagenes = Array.isArray(trabajo.imagenes) && trabajo.imagenes.length ? trabajo.imagenes : trabajo.imagen ? [trabajo.imagen] : [];

    const imagenHTML = imagenes.length
        ? `<div class="trabajo-slider" data-slider="${index}">
                <div class="trabajo-slider-track">
                    ${imagenes.map((imagen, imgIndex) => `<img src="${imagen}" alt="${trabajo.tituloTrabajo} imagen ${imgIndex + 1}" class="trabajo-imagen-slider">`).join("")}
                </div>
            </div>`
        : `<div class="trabajo-placeholder">Sin imagen</div>`;

    return `
        <article class="trabajo-resena-card fade-up">
            <div class="trabajo-imagen-wrap">${imagenHTML}</div>
            <div class="trabajo-contenido">
                <h3>${trabajo.tituloTrabajo}</h3>
                <p class="trabajo-descripcion">${trabajo.descripcionTrabajo}</p>
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
        contenedorTrabajosResenas.innerHTML = `<p class="sin-resenas">Pronto se mostrarán trabajos realizados.</p>`;
        return;
    }

    contenedorTrabajosResenas.innerHTML = trabajos.map((trabajo, index) => crearTarjetaTrabajo(trabajo, index)).join("");

    // Pequeño retraso para que la animación de entrada funcione tras cargar
    setTimeout(() => {
        document.querySelectorAll('.trabajo-resena-card').forEach((el, i) => {
            setTimeout(() => el.classList.add('show'), i * 150);
        });
    }, 100);
}

function cargarTrabajosResenas() {
    if (!contenedorTrabajosResenas) return;

    // Mostrar el Skeleton Loader (Tarjetas parpadeando en gris)
    contenedorTrabajosResenas.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;

    const callbackName = "recibirResenasFreddyFix";

    window[callbackName] = function(data) {
        mostrarTrabajosResenas(data);
        delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src = `${URL_COMENTARIOS}?callback=${callbackName}&t=${Date.now()}`;
    script.onerror = function() {
        contenedorTrabajosResenas.innerHTML = `<p class="sin-resenas">No se pudieron cargar las reseñas en este momento.</p>`;
    };
    document.body.appendChild(script);
}

cargarTrabajosResenas();