/* =========================================================================
   LÓGICA DEL CHAT TESTIMONIAL Y SINCRONIZACIÓN EN TIEMPO REAL
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const btnSend = document.getElementById("btnSend");
  const eventsContainer = document.getElementById("eventsContainer");
  const eventsCount = document.getElementById("eventsCount");
  const noEventsMsg = document.getElementById("noEventsMsg");

  const sheetsPill = document.getElementById("sheetsPill");
  const sheetsPillText = document.getElementById("sheetsPillText");
  const sheetsModeText = document.getElementById("sheetsModeText");
  const sheetsIdText = document.getElementById("sheetsIdText");
  const btnSyncSheets = document.getElementById("btnSyncSheets");

  const btnEditProfile = document.getElementById("btnEditProfile");
  const profileModal = document.getElementById("profileModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCancelModal = document.getElementById("btnCancelModal");
  const profileForm = document.getElementById("profileForm");

  const witnessNameDisplay = document.getElementById("witnessNameDisplay");
  const witnessUnitDisplay = document.getElementById("witnessUnitDisplay");
  const witnessPrivacyDisplay = document.getElementById("witnessPrivacyDisplay");
  const witnessRoleBadge = document.getElementById("witnessRoleBadge");

  const btnResetSession = document.getElementById("btnResetSession");

  // Obtener CSRF Token de Django
  function getCsrfToken() {
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    if (input) return input.value;
    const cookie = document.cookie.split("; ").find(row => row.startsWith("csrftoken="));
    return cookie ? cookie.split("=")[1] : "";
  }

  // Auto-scroll al final del chat
  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  scrollToBottom();

  // Formato de hora HH:MM
  function getNowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Agregar mensaje a la interfaz
  function appendMessage(role, text) {
    const row = document.createElement("div");
    row.className = `message-row ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "👤" : "🇦🇷";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const sender = document.createElement("span");
    sender.className = "sender-name";
    sender.textContent = role === "user" ? (witnessNameDisplay.textContent || "Testimoniante") : "Asistente Testimonial";

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = getNowTime();

    meta.appendChild(sender);
    meta.appendChild(time);

    const body = document.createElement("div");
    body.className = "message-body";
    body.innerHTML = text.replace(/\n/g, "<br>");

    bubble.appendChild(meta);
    bubble.appendChild(body);

    row.appendChild(avatar);
    row.appendChild(bubble);

    chatMessages.appendChild(row);
    scrollToBottom();
    return row;
  }

  // Agregar tarjeta de acontecimiento georreferenciado
  function appendEventCard(ev) {
    if (noEventsMsg) {
      noEventsMsg.style.display = "none";
    }

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-card-top">
        <span class="event-place">📍 ${ev.toponymy || ev.title}</span>
        <span class="event-date">${ev.event_date || '1982'}</span>
      </div>
      <div class="event-coords">
        Lat: ${ev.latitude || '-'} • Lng: ${ev.longitude || '-'}
      </div>
      ${ev.units ? `<div class="event-units">🎖️ ${ev.units}</div>` : ''}
      <div class="event-quote">${ev.quote || ''}</div>
      <div class="event-status-footer">
        <span class="badge ${ev.synced ? 'badge-success' : 'badge-sky'}">
          ${ev.synced ? '✓ En Google Sheets' : '⚡ Respaldo Local'}
        </span>
      </div>
    `;

    eventsContainer.prepend(card);

    const currentTotal = parseInt(eventsCount.textContent || "0", 10);
    eventsCount.textContent = currentTotal + 1;
  }

  // Actualizar estado de Google Sheets
  function updateSheetsStatusUI(status) {
    if (!status) return;

    if (status.is_connected) {
      sheetsPill.className = "status-pill connected";
      sheetsPillText.textContent = "Google Sheets: En Vivo";
      sheetsModeText.textContent = status.mode;
    } else {
      sheetsPill.className = "status-pill local";
      sheetsPillText.textContent = "Respaldo Local Activo";
      sheetsModeText.textContent = status.mode;
    }

    if (status.spreadsheet_id && sheetsIdText) {
      sheetsIdText.textContent = status.spreadsheet_id.slice(0, 20) + (status.spreadsheet_id.length > 20 ? "..." : "");
    }
  }

  // Envío del mensaje del chat
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Agregar mensaje del usuario en pantalla
    appendMessage("user", text);
    chatInput.value = "";

    // Estado cargando
    btnSend.disabled = true;
    const btnSpinner = btnSend.querySelector(".btn-spinner");
    const btnText = btnSend.querySelector(".btn-text");
    if (btnSpinner) btnSpinner.style.display = "inline";
    if (btnText) btnText.textContent = "Escuchando...";

    // Burbuja temporal de espera
    const tempLoading = appendMessage("assistant", "<em>El asistente está procesando su testimonio con respeto...</em>");

    try {
      const response = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken()
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      tempLoading.remove();

      if (data.reply) {
        appendMessage("assistant", data.reply);
      } else if (data.error) {
        appendMessage("assistant", `Disculpas: ${data.error}`);
      }

      // Si se extrajeron nuevos acontecimientos, renderizarlos de inmediato
      if (data.events_extracted && Array.isArray(data.events_extracted)) {
        data.events_extracted.forEach(ev => appendEventCard(ev));
      }

      // Actualizar monitoreo de Google Sheets
      if (data.sheets_status) {
        updateSheetsStatusUI(data.sheets_status);
      }

    } catch (err) {
      tempLoading.remove();
      appendMessage("assistant", "Hubo un inconveniente momentáneo de conexión. Por favor reintente.");
      console.error("Chat error:", err);
    } finally {
      btnSend.disabled = false;
      if (btnSpinner) btnSpinner.style.display = "none";
      if (btnText) btnText.textContent = "Enviar";
      chatInput.focus();
    }
  });

  // Botones de sugerencias rápidas
  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-text");
      if (text && chatInput) {
        chatInput.value = text;
        chatInput.focus();
      }
    });
  });

  // Modal de Perfil
  if (btnEditProfile && profileModal) {
    btnEditProfile.addEventListener("click", () => {
      profileModal.style.display = "flex";
    });

    const closeModal = () => { profileModal.style.display = "none"; };
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("inputName").value.trim(),
        role: document.getElementById("selectRole").value,
        unit: document.getElementById("inputUnit").value.trim(),
        privacy_level: document.getElementById("selectPrivacy").value,
        consent_given: document.getElementById("checkConsent").checked
      };

      try {
        const resp = await fetch("/api/profile/update/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
          },
          body: JSON.stringify(payload)
        });
        const res = await resp.json();
        if (res.ok) {
          witnessNameDisplay.textContent = payload.name;
          witnessUnitDisplay.textContent = payload.unit || "No especificada";
          witnessPrivacyDisplay.textContent = payload.privacy_level;
          witnessRoleBadge.textContent = payload.role;
          closeModal();
        }
      } catch (err) {
        alert("Error guardando el perfil.");
      }
    });
  }

  // Reiniciar Sesión
  if (btnResetSession) {
    btnResetSession.addEventListener("click", async () => {
      if (!confirm("¿Desea iniciar una nueva entrevista testimonial?")) return;

      try {
        const resp = await fetch("/api/session/reset/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
          }
        });
        const res = await resp.json();
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        alert("Error reiniciando sesión.");
      }
    });
  }

  // Forzar sincronización con Google Sheets
  if (btnSyncSheets) {
    btnSyncSheets.addEventListener("click", async () => {
      btnSyncSheets.style.transform = "rotate(360deg)";
      try {
        const resp = await fetch("/api/sheets/sync-all/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
          }
        });
        const res = await resp.json();
        if (res.sheets_status) {
          updateSheetsStatusUI(res.sheets_status);
        }
        alert(res.message || "Sincronización procesada.");
      } catch (err) {
        alert("Error en la sincronización.");
      } finally {
        setTimeout(() => { btnSyncSheets.style.transform = ""; }, 500);
      }
    });
  }
});
