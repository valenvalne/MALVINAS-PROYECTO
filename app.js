/**
 * ==============================================================================
 * MALVINAS 1982: MEMORIA, TERRITORIO Y TESTIMONIOS
 * Frontend Application Logic (Sector 1)
 * Integrado con Leaflet.js (100% Gratuito y Libre)
 * ==============================================================================
 */

// ==================== CONFIGURACIÓN DE RED & ARQUITECTURA (SECTORES 2 Y 3) ====================
const CONFIG = {
  // Cuando el Sector 3 despliegue la API, simplemente se actualiza esta URL:
  API_BASE_URL: "http://localhost:3000/api",
  ENDPOINTS: {
    CHAT: "/chat",
    VETERAN_STORY: "/testimonios"
  },
  // Modo simulación local activado para probar de inmediato sin depender del backend:
  USE_MOCK: true
};

// ==================== BASE DE DATOS CARTOGRÁFICA DE HITOS HISTÓRICOS ====================
// Cada hito se enlaza con el mapa y con la cinta de fotos inferior (consultando /imagenesdeescala)
const PUNTOS_HISTORICOS = [
  {
    id: "pto-argentino",
    nombre: "Puerto Argentino",
    lat: -51.6921,
    lng: -57.8583,
    zoomRecomendado: 14,
    tipo: "Operaciones & Mando",
    fecha: "2 de abril - 14 de junio de 1982",
    imagen: "imagenesdeescala/puerto_argentino.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    descripcion: "Capital de las islas y centro neurálgico de las operaciones militares. Aquí se libró la defensa final en las colinas circundantes y se concentró el comando de las tropas terrestres, navales y aéreas."
  },
  {
    id: "monte-longdon",
    nombre: "Monte Longdon",
    lat: -51.6583,
    lng: -57.9833,
    zoomRecomendado: 15,
    tipo: "Combate de Infantería",
    fecha: "11 y 12 de junio de 1982",
    imagen: "imagenesdeescala/monte_longdon.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    descripcion: "Escenario de uno de los combates terrestres más cruentos y heroicos del conflicto. La Compañía B del Regimiento de Infantería 7 (RI 7) resistió valientemente con apoyo de infantes de marina frente al asalto de las fuerzas británicas."
  },
  {
    id: "pradera-del-ganso",
    nombre: "Pradera del Ganso (Goose Green)",
    lat: -51.8286,
    lng: -58.9722,
    zoomRecomendado: 14,
    tipo: "Batalla Terrestre",
    fecha: "28 de mayo de 1982",
    imagen: "imagenesdeescala/pradera_del_ganso.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    descripcion: "Primera gran batalla terrestre en el istmo de Darwin. La Fuerza de Tareas Mercedes combatió con notable tenacidad y apoyo de fuego artillero de 105 mm y aviones Pucará de la Fuerza Aérea."
  },
  {
    id: "bahia-san-carlos",
    nombre: "Bahía San Carlos",
    lat: -51.5258,
    lng: -59.0347,
    zoomRecomendado: 13,
    tipo: "Combate Aeronaval",
    fecha: "21 al 25 de mayo de 1982",
    imagen: "imagenesdeescala/san_carlos.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    descripcion: "Zona bautizada históricamente como el 'Callejón de las Bombas' (Bomb Alley). Pilotos de la Fuerza Aérea Argentina y de la Aviación Naval realizaron incursiones a ras del agua desafiando intensas defensas antiaéreas y fragatas enemigas."
  },
  {
    id: "dos-hermanas",
    nombre: "Monte Dos Hermanas (Two Sisters)",
    lat: -51.6883,
    lng: -58.0416,
    zoomRecomendado: 15,
    tipo: "Línea Defensiva",
    fecha: "11 y 12 de junio de 1982",
    imagen: "imagenesdeescala/dos_hermanas.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    descripcion: "Sector clave del anillo defensivo exterior de Puerto Argentino defendido por efectivos del Regimiento de Infantería 4. Destacado por su resistencia nocturna ante bombardeos constantes."
  },
  {
    id: "monte-tumbledown",
    nombre: "Monte Tumbledown",
    lat: -51.6983,
    lng: -57.9483,
    zoomRecomendado: 15,
    tipo: "Combate de Infantería",
    fecha: "13 y 14 de junio de 1982",
    imagen: "imagenesdeescala/tumbledown.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    descripcion: "Posición defendida por la Compañía Nácar del Batallón de Infantería de Marina 5 (BIM 5) bajo el mando de Carlos Robacio. Considerado uno de los enfrentamientos más disciplinados y feroces del cierre de la guerra."
  },
  {
    id: "bahia-agradable",
    nombre: "Bahía Agradable (Fitz Roy)",
    lat: -51.7833,
    lng: -58.2166,
    zoomRecomendado: 13,
    tipo: "Ataque Aéreo",
    fecha: "8 de junio de 1982",
    imagen: "imagenesdeescala/bahia_agradable.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    descripcion: "Jornada histórica conocida como el 'Día más negro de la flota británica'. Las escuadrillas de cazabombarderos A-4B Skyhawk y Dagger atacaron y hundieron a los buques de desembarco RFA Sir Galahad y RFA Sir Tristram."
  },
  {
    id: "bahia-fox",
    nombre: "Bahía Fox (Isla Gran Malvina)",
    lat: -51.9666,
    lng: -60.0833,
    zoomRecomendado: 13,
    tipo: "Puesto Militar Austral",
    fecha: "Abril - Junio de 1982",
    imagen: "imagenesdeescala/bahia_fox.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    descripcion: "Principal guarnición militar argentina apostada en la Isla Gran Malvina, compuesta por el Regimiento de Infantería 8 y tropas de ingenieros, sufriendo intenso hostigamiento naval británico."
  }
];

// ==================== VARIABLES DE ESTADO GLOBALES ====================
let map = null;
let markersMap = new Map();
let activePointId = null;
let currentChatMode = "testimonio_veterano"; // o "consulta_historica"

// ==================== INICIALIZACIÓN AL CARGAR EL DOM ====================
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  populatePhotoStrip();
  initScaleControls();
  initChatbot();
  initModals();
  updatePointsCount();
});

// ==================== 1. MOTOR CARTOGRÁFICO (LEAFLET.JS) ====================
function initMap() {
  // Centro geográfico de las Islas Malvinas
  const malvinasCenter = [-51.75, -59.10];
  const initialZoom = 8;

  // Inicializar instancia de Leaflet
  map = L.map("map", {
    center: malvinasCenter,
    zoom: initialZoom,
    minZoom: 6,
    maxZoom: 18,
    zoomControl: false // Personalizaremos o moveremos la posición
  });

  // Reubicar control de zoom en la esquina inferior derecha
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // --- Capas de Azulejos (Tiles 100% Gratuitos y Libres) ---
  // Capa 1: Satelital de alta resolución (Esri World Imagery)
  const esriSatellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri &mdash; Malvinas 1982",
      maxZoom: 18
    }
  );

  // Capa 2: Cartográfica / Calles (OpenStreetMap)
  const osmMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18
    }
  );

  // Cargar capa satelital por defecto (coincide con la vista de Google Maps / Earth)
  esriSatellite.addTo(map);

  // Control de Capas Leaflet (en esquina superior derecha)
  const baseMaps = {
    "Vista Satelital": esriSatellite,
    "Mapa Político / Rutas": osmMap
  };
  L.control.layers(baseMaps, null, { position: "topright" }).addTo(map);

  // Renderizar marcadores conmemorativos
  renderHistoricalMarkers();

  // Actualizar coordenadas en pantalla al mover el ratón
  map.on("mousemove", (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    const coordEl = document.getElementById("coord-values");
    if (coordEl) coordEl.textContent = `Lat: ${lat} | Lng: ${lng}`;
  });

  // Botón para resetear a la vista general
  const btnReset = document.getElementById("btn-reset-map");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      map.flyTo(malvinasCenter, initialZoom, { duration: 1.5 });
      highlightActiveScaleButton(8);
      clearActiveSelection();
    });
  }
}

// ==================== 2. MARCADORES HISTÓRICOS ====================
function renderHistoricalMarkers() {
  PUNTOS_HISTORICOS.forEach((pto) => {
    // Icono HTML personalizado con efecto de pulso conmemorativo
    const customIcon = L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div class="memorial-pin" id="marker-pin-${pto.id}" title="${pto.nombre}">
          <i class="fa-solid fa-location-dot"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([pto.lat, pto.lng], { icon: customIcon }).addTo(map);

    // Contenido del Popup al hacer clic en el mapa
    const popupContent = `
      <div class="custom-popup-content">
        <h3>${pto.nombre}</h3>
        <p><strong>${pto.tipo}</strong> &bull; ${pto.fecha}</p>
        <p>${pto.descripcion.substring(0, 110)}...</p>
        <button class="popup-link-btn" onclick="openDetailModal('${pto.id}')">
          <i class="fa-solid fa-circle-info"></i> Ver detalles históricos
        </button>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 280 });

    // Evento de clic en el marcador del mapa:
    marker.on("click", () => {
      selectPoint(pto.id, false);
    });

    markersMap.set(pto.id, marker);
  });
}

// ==================== 3. CINTA INFERIOR DE FOTOS (GOOGLE MAPS STYLE) ====================
function populatePhotoStrip() {
  const container = document.getElementById("photo-cards-container");
  if (!container) return;

  container.innerHTML = "";

  PUNTOS_HISTORICOS.forEach((pto) => {
    const card = document.createElement("div");
    card.className = "photo-card";
    card.id = `card-${pto.id}`;

    // Construcción de la tarjeta con imagen local + fallback automático si no existe en imagenesdeescala
    card.innerHTML = `
      <img src="${pto.imagen}" alt="${pto.nombre}" class="photo-card-img" 
           onerror="this.onerror=null; this.src='${pto.imagenFallback}';">
      <div class="photo-card-overlay">
        <span class="photo-card-badge">${pto.tipo}</span>
        <div class="photo-card-info">
          <h4>${pto.nombre}</h4>
          <p><i class="fa-regular fa-clock"></i> 1982</p>
        </div>
      </div>
    `;

    // Clic en la foto inferior -> Vuela el mapa hacia el hito geográfico
    card.addEventListener("click", () => {
      selectPoint(pto.id, true);
    });

    container.appendChild(card);
  });

  // Botones de desplazamiento horizontal
  const btnScrollLeft = document.getElementById("btn-scroll-left");
  const btnScrollRight = document.getElementById("btn-scroll-right");

  if (btnScrollLeft && btnScrollRight) {
    btnScrollLeft.addEventListener("click", () => {
      container.scrollBy({ left: -260, behavior: "smooth" });
    });
    btnScrollRight.addEventListener("click", () => {
      container.scrollBy({ left: 260, behavior: "smooth" });
    });
  }

  // Botón para colapsar / expandir la cinta de fotos
  const btnToggle = document.getElementById("btn-toggle-strip");
  const strip = document.getElementById("photo-strip");
  const toggleIcon = document.getElementById("toggle-strip-icon");
  const toggleText = document.getElementById("toggle-strip-text");

  if (btnToggle && strip) {
    btnToggle.addEventListener("click", () => {
      strip.classList.toggle("minimized");
      const isMin = strip.classList.contains("minimized");
      toggleIcon.className = isMin ? "fa-solid fa-angle-up" : "fa-solid fa-angle-down";
      toggleText.textContent = isMin ? "Ver fotos" : "Ocultar fotos";
    });
  }
}

// Sincronización bidireccional: Mapa <-> Cinta de Fotos
function selectPoint(pointId, shouldFlyMap = true) {
  const pto = PUNTOS_HISTORICOS.find((p) => p.id === pointId);
  if (!pto) return;

  activePointId = pointId;

  // 1. Resaltar tarjeta en el carrusel de abajo y desplazar hasta ella
  document.querySelectorAll(".photo-card").forEach((c) => c.classList.remove("active"));
  const activeCard = document.getElementById(`card-${pointId}`);
  if (activeCard) {
    activeCard.classList.add("active");
    activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // 2. Si se solicitó, mover la cámara del mapa con animación suave (flyTo)
  if (shouldFlyMap && map) {
    map.flyTo([pto.lat, pto.lng], pto.zoomRecomendado, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }

  // 3. Abrir el popup del marcador correspondiente
  const marker = markersMap.get(pointId);
  if (marker) {
    setTimeout(() => {
      marker.openPopup();
    }, shouldFlyMap ? 1400 : 100);
  }
}

function clearActiveSelection() {
  activePointId = null;
  document.querySelectorAll(".photo-card").forEach((c) => c.classList.remove("active"));
  map.closePopup();
}

function updatePointsCount() {
  const countEl = document.getElementById("points-count");
  if (countEl) countEl.textContent = `${PUNTOS_HISTORICOS.length} hitos`;
}

// ==================== 4. SELECTOR DE ESCALAS FLOTANTE ====================
function initScaleControls() {
  const scaleBtns = document.querySelectorAll(".scale-btn");
  scaleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const zoom = parseInt(btn.dataset.zoom, 10);
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);

      scaleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    });
  });

  // Si el usuario hace zoom manual, actualizar el botón activo
  map.on("zoomend", () => {
    highlightActiveScaleButton(map.getZoom());
  });
}

function highlightActiveScaleButton(currentZoom) {
  const scaleBtns = document.querySelectorAll(".scale-btn");
  scaleBtns.forEach((btn) => {
    const btnZoom = parseInt(btn.dataset.zoom, 10);
    if (Math.abs(currentZoom - btnZoom) <= 1) {
      scaleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    }
  });
}

// ==================== 5. MODALES DE DETALLE HISTÓRICO Y PROYECTO ====================
function initModals() {
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const btnFlyTo = document.getElementById("btn-fly-to-point");
  const btnStoryAbout = document.getElementById("btn-story-about-this");

  if (modalCloseBtn && modalBackdrop) {
    modalCloseBtn.addEventListener("click", () => modalBackdrop.classList.remove("open"));
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove("open");
    });
  }

  if (btnFlyTo) {
    btnFlyTo.addEventListener("click", () => {
      if (activePointId) {
        modalBackdrop.classList.remove("open");
        selectPoint(activePointId, true);
      }
    });
  }

  // Si hace clic en "Dejar testimonio sobre este lugar", abre el chat con ese lugar como contexto
  if (btnStoryAbout) {
    btnStoryAbout.addEventListener("click", () => {
      if (activePointId) {
        const pto = PUNTOS_HISTORICOS.find((p) => p.id === activePointId);
        modalBackdrop.classList.remove("open");
        openChatbotWithContext(`Quiero consultar o dejar un testimonio sobre lo ocurrido en ${pto.nombre}.`);
      }
    });
  }

  // Modal Informativo del Proyecto
  const btnToggleInfo = document.getElementById("btn-toggle-info");
  const infoModalBackdrop = document.getElementById("info-modal-backdrop");
  const infoCloseBtn = document.getElementById("info-modal-close-btn");
  const btnCloseInfoAction = document.getElementById("btn-close-project-info");

  if (btnToggleInfo && infoModalBackdrop) {
    btnToggleInfo.addEventListener("click", () => infoModalBackdrop.classList.add("open"));
  }
  if (infoCloseBtn && infoModalBackdrop) {
    infoCloseBtn.addEventListener("click", () => infoModalBackdrop.classList.remove("open"));
  }
  if (btnCloseInfoAction && infoModalBackdrop) {
    btnCloseInfoAction.addEventListener("click", () => infoModalBackdrop.classList.remove("open"));
  }
}

// Abrir modal de detalles históricos
window.openDetailModal = function (pointId) {
  const pto = PUNTOS_HISTORICOS.find((p) => p.id === pointId);
  if (!pto) return;

  activePointId = pointId;

  document.getElementById("modal-title").textContent = pto.nombre;
  document.getElementById("modal-date").innerHTML = `<i class="fa-regular fa-calendar"></i> Fecha: ${pto.fecha}`;
  document.getElementById("modal-tag").textContent = pto.tipo;
  document.getElementById("modal-description").textContent = pto.descripcion;

  const modalImg = document.getElementById("modal-image");
  modalImg.src = pto.imagen;
  modalImg.onerror = function () {
    this.onerror = null;
    this.src = pto.imagenFallback;
  };

  document.getElementById("modal-backdrop").classList.add("open");
};

// ==================== 6. WIDGET DE CHATBOT (BURBUJA FLOTANTE) ====================
function initChatbot() {
  const widgetContainer = document.getElementById("chatbot-container");
  const bubbleBtn = document.getElementById("chat-toggle-button");
  const btnMinimize = document.getElementById("btn-minimize-chat");
  const btnHeaderChat = document.getElementById("btn-open-chat-header");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const tabVeterano = document.getElementById("tab-veterano");
  const tabConsulta = document.getElementById("tab-consulta");
  const chipsContainer = document.getElementById("chat-chips");

  // Alternar apertura/cierre de la burbuja
  function toggleChat() {
    widgetContainer.classList.toggle("open");
    if (widgetContainer.classList.contains("open")) {
      setTimeout(() => chatInput.focus(), 300);
    }
  }

  if (bubbleBtn) bubbleBtn.addEventListener("click", toggleChat);
  if (btnMinimize) btnMinimize.addEventListener("click", toggleChat);
  if (btnHeaderChat) btnHeaderChat.addEventListener("click", () => {
    widgetContainer.classList.add("open");
    setTimeout(() => chatInput.focus(), 300);
  });

  // Selector de Modos (Veterano vs Consulta Histórica)
  if (tabVeterano && tabConsulta) {
    tabVeterano.addEventListener("click", () => {
      currentChatMode = "testimonio_veterano";
      tabVeterano.classList.add("active");
      tabConsulta.classList.remove("active");
      chatInput.placeholder = "Indica tu regimiento, rol y testimonio de vivencia...";
    });

    tabConsulta.addEventListener("click", () => {
      currentChatMode = "consulta_historica";
      tabConsulta.classList.add("active");
      tabVeterano.classList.remove("active");
      chatInput.placeholder = "Pregunta sobre fechas, combates, soldados o armamento...";
    });
  }

  // Sugerencias Rápidas (Chips)
  if (chipsContainer) {
    chipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip-btn");
      if (chip) {
        chatInput.value = chip.dataset.text;
        chatInput.focus();
      }
    });
  }

  // Enviar mensaje
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // 1. Agregar mensaje del usuario a la interfaz
      appendMessage("user", text);
      chatInput.value = "";

      // 2. Mostrar indicador de escritura del bot
      showTypingIndicator(true);

      // 3. Enviar a la capa de servicio (Mock local o API Sector 3)
      ChatService.sendMessage(text, currentChatMode)
        .then((response) => {
          showTypingIndicator(false);
          appendMessage("bot", response.respuesta);
        })
        .catch((err) => {
          showTypingIndicator(false);
          appendMessage("bot", "Ocurrió un error al conectar con el servidor. Tu mensaje se conservará localmente.");
          console.error("Chat error:", err);
        });
    });

    // Enviar con Enter (sin Shift)
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
      }
    });
  }
}

function openChatbotWithContext(initialText) {
  const widgetContainer = document.getElementById("chatbot-container");
  const chatInput = document.getElementById("chat-input");
  widgetContainer.classList.add("open");
  chatInput.value = initialText;
  chatInput.focus();
}

function appendMessage(sender, text) {
  const messagesContainer = document.getElementById("chat-messages");
  if (!messagesContainer) return;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${sender === "user" ? "user-message" : "bot-message"}`;

  const senderName = sender === "user" ? "Tú" : (currentChatMode === "testimonio_veterano" ? "Registro Testimonial" : "Historiador Malvinas");
  const icon = sender === "user" ? "fa-user" : "fa-shield-halved";

  bubble.innerHTML = `
    <div class="bubble-sender"><i class="fa-solid ${icon}"></i> ${senderName}</div>
    <div class="bubble-text">${escapeHtml(text)}</div>
    <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  `;

  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator(show) {
  const indicator = document.getElementById("chat-typing");
  if (indicator) {
    indicator.style.display = show ? "flex" : "none";
    const messagesContainer = document.getElementById("chat-messages");
    if (show && messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==================== 7. CAPA DE SERVICIO DE RED (INTEGRACIÓN SECTORES 2 Y 3) ====================
const ChatService = {
  async sendMessage(mensaje, modo) {
    // Si estamos en modo simulación (Mock), responder inmediatamente con lógica contextual
    if (CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.generateMockResponse(mensaje, modo));
        }, 1100);
      });
    }

    // Si USE_MOCK es falso, conectar con la API real del Sector 3:
    const payload = {
      sessionId: "session-" + (sessionStorage.getItem("malvinas_sid") || (sessionStorage.setItem("malvinas_sid", Date.now()), Date.now())),
      tipo: modo,
      mensaje: mensaje,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    return await response.json();
  },

  // Generador de respuestas simuladas para desarrollo local
  generateMockResponse(mensaje, modo) {
    const lower = mensaje.toLowerCase();

    if (modo === "testimonio_veterano") {
      return {
        status: "success",
        guardadoEnDB: true,
        respuesta: `Gracias por compartir tu testimonio. Este relato es fundamental para la memoria colectiva de nuestra Nación. ¿En qué unidad o compañía estuviste destinado y durante qué semanas específicas operaste en esa zona?`
      };
    }

    if (lower.includes("longdon")) {
      return {
        status: "success",
        respuesta: "El combate de Monte Longdon tuvo lugar entre la noche del 11 y la madrugada del 12 de junio de 1982. Fue librado con enorme valentía por el Regimiento de Infantería 7 (RI 7) y efectivos de la Infantería de Marina frente al 3er Batallón de Paracaidistas británico."
      };
    }

    if (lower.includes("bim 5") || lower.includes("robacio")) {
      return {
        status: "success",
        respuesta: "El Batallón de Infantería de Marina N° 5 (BIM 5), comandado por el Capitán de Fragata Carlos Robacio, defendió las alturas de Monte Tumbledown, Monte William y Sapper Hill con disciplina ejemplar hasta las últimas instancias del combate."
      };
    }

    if (lower.includes("san carlos") || lower.includes("bombas")) {
      return {
        status: "success",
        respuesta: "El desembarco en Bahía San Carlos se produjo el 21 de mayo de 1982. Los pilotos de la Fuerza Aérea y de la Aviación Naval argentina volaron a escasos metros sobre las olas, hundiendo y dañando severamente buques británicos como la HMS Ardent y la HMS Antelope."
      };
    }

    return {
      status: "success",
      respuesta: `Tu consulta sobre "${mensaje}" ha sido procesada. En el conflicto de 1982 intervinieron el Ejército, la Armada y la Fuerza Aérea con el apoyo de la Marina Mercante y la Prefectura Naval. Puedes explorar el mapa o seleccionar cualquier foto para ver las coordenadas exactas de las batallas.`
    };
  }
};
