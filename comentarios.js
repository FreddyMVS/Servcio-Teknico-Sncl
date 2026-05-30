const URL_COMENTARIOS = "https://script.google.com/macros/s/AKfycbyjoU7ItsL6m0GkkWPyRsKSLW1s2GmHhwtarq3arnhmeerFh_5LKTrw2Guxct_VdnaaWQ/exec";

const contenedorTrabajosResenas = document.getElementById("trabajos-resenas-container");
const esPaginaTrabajos = document.body.classList.contains("pagina-trabajos") || location.pathname.includes("trabajos.html");
const LIMITE_INICIO = 5;

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
                            alt="${trabajo.tituloTrabajo || "Trabajo realizado"} imagen ${imgIndex + 1}" 
                            class="trabajo-imagen-slider"
                            loading="lazy"
                        >
                    `).join("")}
                </div>

                ${imagenes.length > 1 ? `
                    <button class="slider-btn slider-prev" type="button" aria-label="Imagen anterior">‹</button>
                    <button class="slider-btn slider-next" type="button" aria-label="Imagen siguiente">›</button>

                    <div class="slider-dots" aria-label="Selector de imágenes">
                        ${imagenes.map((_, dotIndex) => `
                            <button class="slider-dot ${dotIndex === 0 ? "active" : ""}" type="button" aria-label="Ver imagen ${dotIndex + 1}"></button>
                        `).join("")}
                    </div>
                ` : ""}
            </div>
        `
        : `<div class="trabajo-placeholder">Sin imagen</div>`;

    return `
        <article class="trabajo-resena-card fade-up">
            <div class="trabajo-imagen-wrap">
                ${imagenHTML}
            </div>

            <div class="trabajo-contenido">
                <h3>${trabajo.tituloTrabajo || "Trabajo realizado"}</h3>

                <p class="trabajo-descripcion">
                    ${trabajo.descripcionTrabajo || ""}
                </p>

                <div class="resena-box">
                    <div class="resena-header">
                        <strong>${trabajo.nombreCliente || "Cliente FreddyFix"}</strong>
                        <span class="resena-estrellas">${estrellas}</span>
                    </div>

                    <p class="resena-texto">“${trabajo.comentarioCliente || ""}”</p>
                </div>
            </div>
        </article>
    `;
}

function prepararCarruselInicio() {
    if (!contenedorTrabajosResenas || esPaginaTrabajos) return;

    const tarjetas = Array.from(contenedorTrabajosResenas.querySelectorAll(".trabajo-resena-card"));
    if (!tarjetas.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = "trabajos-home-carousel";

    const viewport = document.createElement("div");
    viewport.className = "trabajos-home-viewport";

    const track = document.createElement("div");
    track.className = "trabajos-home-track";

    tarjetas.forEach((tarjeta) => track.appendChild(tarjeta));

    viewport.appendChild(track);
    wrapper.appendChild(viewport);

    if (tarjetas.length > 1) {
        const prev = document.createElement("button");
        prev.className = "home-carousel-btn home-carousel-prev";
        prev.type = "button";
        prev.setAttribute("aria-label", "Trabajo anterior");
        prev.textContent = "‹";

        const next = document.createElement("button");
        next.className = "home-carousel-btn home-carousel-next";
        next.type = "button";
        next.setAttribute("aria-label", "Trabajo siguiente");
        next.textContent = "›";

        const dots = document.createElement("div");
        dots.className = "home-carousel-dots";

        tarjetas.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = `home-carousel-dot ${index === 0 ? "active" : ""}`;
            dot.type = "button";
            dot.setAttribute("aria-label", `Ver trabajo ${index + 1}`);
            dots.appendChild(dot);
        });

        wrapper.appendChild(prev);
        wrapper.appendChild(next);
        wrapper.appendChild(dots);

        let posicion = 0;

        function actualizarCarrusel() {
            const ancho = tarjetas[0].getBoundingClientRect().width;
            const gap = Number(getComputedStyle(track).gap.replace("px", "")) || 0;
            track.style.transform = `translateX(-${posicion * (ancho + gap)}px)`;

            dots.querySelectorAll(".home-carousel-dot").forEach((dot, index) => {
                dot.classList.toggle("active", index === posicion);
            });
        }

        next.addEventListener("click", () => {
            posicion = (posicion + 1) % tarjetas.length;
            actualizarCarrusel();
        });

        prev.addEventListener("click", () => {
            posicion = (posicion - 1 + tarjetas.length) % tarjetas.length;
            actualizarCarrusel();
        });

        dots.querySelectorAll(".home-carousel-dot").forEach((dot, index) => {
            dot.addEventListener("click", () => {
                posicion = index;
                actualizarCarrusel();
            });
        });

        window.addEventListener("resize", actualizarCarrusel);
        setTimeout(actualizarCarrusel, 100);
    }

    contenedorTrabajosResenas.innerHTML = "";
    contenedorTrabajosResenas.appendChild(wrapper);
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

    const trabajosAMostrar = esPaginaTrabajos ? trabajos : trabajos.slice(0, LIMITE_INICIO);

    contenedorTrabajosResenas.innerHTML = trabajosAMostrar
        .map((trabajo, index) => crearTarjetaTrabajo(trabajo, index))
        .join("");

    activarSliders();
    prepararCarruselInicio();
    activarAnimacionesResenas();
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

function activarAnimacionesResenas() {
    const tarjetas = document.querySelectorAll(".trabajo-resena-card");

    tarjetas.forEach((tarjeta, index) => {
        tarjeta.classList.add("fade-up");

        setTimeout(() => {
            tarjeta.classList.add("show");
        }, index * 120);
    });
}

function cargarTrabajosResenas() {
    if (!contenedorTrabajosResenas) return;

    const skeletons = esPaginaTrabajos ? 6 : 3;

    contenedorTrabajosResenas.innerHTML = Array.from({ length: skeletons }, () => `
        <div class="skeleton-card"></div>
    `).join("");

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
