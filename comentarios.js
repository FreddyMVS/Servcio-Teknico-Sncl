const URL_COMENTARIOS = "https://script.google.com/macros/s/AKfycbyjoU7ItsL6m0GkkWPyRsKSLW1s2GmHhwtarq3arnhmeerFh_5LKTrw2Guxct_VdnaaWQ/exec";

const contenedorTrabajosResenas = document.getElementById("trabajos-resenas-container");

function crearEstrellas(calificacion) {
    const nota = Math.max(1, Math.min(5, Number(calificacion) || 5));
    return "★".repeat(nota) + "☆".repeat(5 - nota);
}

function crearTarjetaTrabajo(trabajo, index) {
    const estrellas = crearEstrellas(trabajo.calificacion);

    const imagenes = Array.isArray(trabajo.imagenes) && trabajo.imagenes.length
        ? trabajo.imagenes
        : trabajo.imagen
            ? [trabajo.imagen]
            : [];

    const imagenHTML = imagenes.length
        ? `
            <div class="trabajo-slider" data-slider="${index}">
                <div class="trabajo-slider-track">
                    ${imagenes.map((imagen, imgIndex) => `
                        <img 
                            src="${imagen}" 
                            alt="${trabajo.tituloTrabajo} imagen ${imgIndex + 1}" 
                            class="trabajo-imagen-slider"
                        >
                    `).join("")}
                </div>

                ${imagenes.length > 1 ? `
                    <button class="slider-btn slider-prev" type="button" aria-label="Imagen anterior">‹</button>
                    <button class="slider-btn slider-next" type="button" aria-label="Imagen siguiente">›</button>

                    <div class="slider-dots">
                        ${imagenes.map((_, dotIndex) => `
                            <button class="slider-dot ${dotIndex === 0 ? "active" : ""}" type="button" aria-label="Ver imagen ${dotIndex + 1}"></button>
                        `).join("")}
                    </div>
                ` : ""}
            </div>
        `
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
        .map((trabajo, index) => crearTarjetaTrabajo(trabajo, index))
        .join("");

    activarSliders();
}

function activarSliders() {
    const sliders = document.querySelectorAll(".trabajo-slider");

    sliders.forEach((slider) => {
        const track = slider.querySelector(".trabajo-slider-track");
        const imagenes = slider.querySelectorAll(".trabajo-imagen-slider");
        const prev = slider.querySelector(".slider-prev");
        const next = slider.querySelector(".slider-next");
        const dots = slider.querySelectorAll(".slider-dot");

        if (!track || imagenes.length <= 1) return;

        let posicion = 0;

        function actualizarSlider() {
            track.style.transform = `translateX(-${posicion * 100}%)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === posicion);
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                posicion = (posicion + 1) % imagenes.length;
                actualizarSlider();
            });
        }

        if (prev) {
            prev.addEventListener("click", () => {
                posicion = (posicion - 1 + imagenes.length) % imagenes.length;
                actualizarSlider();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                posicion = index;
                actualizarSlider();
            });
        });
    });
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