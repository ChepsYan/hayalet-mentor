// DOM Elements
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const figureEl = document.getElementById("figure");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const clearHistoryBtn = document.getElementById("clearHistory");
const toast = document.getElementById("toast");
const characterAvatar = document.getElementById("characterAvatar");
const characterDesc = document.getElementById("characterDesc");
const characterName = document.getElementById("characterName");
const emptyState = document.getElementById("emptyState");

// Theme icons
const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const sunIcon = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

// State
let sending = false;
let characters = [];
let currentCharacter = null;

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  // Load saved theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeIcon.innerHTML = sunIcon;
  } else {
    themeIcon.innerHTML = moonIcon;
  }

  // Load characters
  await loadCharacters();
});

// --- API Functions ---

/**
 * Load all available characters from server
 */
async function loadCharacters() {
  try {
    const res = await fetch("/characters");
    characters = await res.json();

    if (characters.length === 0) {
      showToast("Karakter bulunamadi!");
      return;
    }

    // Populate select dropdown
    figureEl.innerHTML = "";
    characters.forEach((char) => {
      const option = document.createElement("option");
      option.value = char.id;
      option.textContent = char.name;
      figureEl.appendChild(option);
    });

    // Restore last selected character or use first one
    const lastCharacter = localStorage.getItem("lastCharacter");
    if (lastCharacter && characters.find((c) => c.id === lastCharacter)) {
      figureEl.value = lastCharacter;
    } else {
      figureEl.value = characters[0].id;
    }

    // Update display and load history
    await onCharacterChange();
  } catch (error) {
    console.error("Error loading characters:", error);
    showToast("Karakterler yuklenemedi!");
  }
}

/**
 * Load conversation history for current character
 */
async function loadHistory() {
  if (!currentCharacter) return;

  try {
    const res = await fetch(`/history/${currentCharacter.id}`);
    const data = await res.json();

    // Clear chat
    chat.innerHTML = "";

    // Display messages or empty state
    if (data.messages && data.messages.length > 0) {
      hideEmptyState();
      data.messages.forEach((msg) => {
        addMessage(msg.text, msg.role === "user" ? "user" : "bot", false);
      });
    } else {
      showEmptyState();
    }
  } catch (error) {
    console.error("Error loading history:", error);
    showEmptyState();
  }
}

/**
 * Clear conversation history for current character
 */
async function clearHistory() {
  if (!currentCharacter) return;

  if (!confirm(`${currentCharacter.name} ile olan konusma gecmisini silmek istediginize emin misiniz?`)) {
    return;
  }

  try {
    const res = await fetch(`/history/${currentCharacter.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      chat.innerHTML = "";
      showEmptyState();
      showToast("Gecmis temizlendi");
    } else {
      showToast("Gecmis temizlenemedi!");
    }
  } catch (error) {
    console.error("Error clearing history:", error);
    showToast("Gecmis temizlenemedi!");
  }
}

// --- UI Functions ---

/**
 * Show empty state
 */
function showEmptyState() {
  chat.innerHTML = `
    <div class="empty-state" id="emptyState">
      <div class="empty-state-icon">💭</div>
      <p class="empty-state-text">${currentCharacter ? currentCharacter.name + " ile sohbete baslayin" : "Sohbete baslamak icin bir soru sorun"}</p>
    </div>
  `;
}

/**
 * Hide empty state
 */
function hideEmptyState() {
  const empty = document.getElementById("emptyState");
  if (empty) empty.remove();
}

/**
 * Add a message to the chat
 */
function addMessage(text, who, scroll = true) {
  hideEmptyState();
  
  const div = document.createElement("div");
  div.className = `message ${who}`;

  if (who === "bot" && currentCharacter) {
    // Create avatar for bot messages
    const avatar = document.createElement("img");
    avatar.className = "message-avatar";
    avatar.src = currentCharacter.avatar;
    avatar.alt = currentCharacter.name;
    avatar.onerror = () => {
      avatar.style.display = "none";
    };

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    div.appendChild(avatar);
    div.appendChild(content);
  } else {
    div.textContent = text;
  }

  chat.appendChild(div);

  if (scroll) {
    chat.scrollTop = chat.scrollHeight;
  }

  return div;
}

/**
 * Add typing indicator
 */
function addTyping() {
  hideEmptyState();
  
  const wrap = document.createElement("div");
  wrap.className = "message bot";

  if (currentCharacter) {
    const avatar = document.createElement("img");
    avatar.className = "message-avatar";
    avatar.src = currentCharacter.avatar;
    avatar.alt = currentCharacter.name;
    avatar.onerror = () => {
      avatar.style.display = "none";
    };
    wrap.appendChild(avatar);
  }

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrap.appendChild(typing);

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

/**
 * Show toast notification
 */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2500);
}

/**
 * Update character display (avatar and description)
 */
function updateCharacterDisplay() {
  if (!currentCharacter) return;

  characterAvatar.src = currentCharacter.avatar;
  characterAvatar.alt = currentCharacter.name;
  characterAvatar.onerror = () => {
    characterAvatar.src = "";
    characterAvatar.style.display = "none";
  };
  characterAvatar.onload = () => {
    characterAvatar.style.display = "block";
  };

  characterName.textContent = currentCharacter.name;
  characterDesc.textContent = currentCharacter.description || "";
}

/**
 * Handle character change
 */
async function onCharacterChange() {
  const characterId = figureEl.value;
  currentCharacter = characters.find((c) => c.id === characterId);

  if (!currentCharacter) return;

  // Save selection
  localStorage.setItem("lastCharacter", characterId);

  // Update UI
  updateCharacterDisplay();

  // Load history for this character
  await loadHistory();
}

// --- Message Sending ---

async function sendMessage() {
  const text = input.value.trim();
  if (!text || sending || !currentCharacter) return;

  sending = true;
  sendBtn.disabled = true;

  addMessage(text, "user");
  input.value = "";

  const typing = addTyping();

  try {
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        characterId: currentCharacter.id,
      }),
    });

    const data = await res.json();
    typing.remove();

    if (res.ok) {
      addMessage(data.reply, "bot");
    } else if (res.status === 503) {
      addMessage(data.error || "Servis gecici olarak kullanilamiyor.", "bot");
      setTimeout(() => {
        if (confirm("Tekrar denemek ister misin?")) {
          input.value = text;
          sendMessage();
        }
      }, 3000);
    } else {
      addMessage(data.error || "Bir hata olustu. Tekrar dene.", "bot");
    }
  } catch (e) {
    typing.remove();
    addMessage("Baglanti hatasi. Lutfen tekrar dene.", "bot");
    console.error("Fetch hatasi:", e);
  } finally {
    sending = false;
    sendBtn.disabled = false;
  }
}

// --- Event Listeners ---

sendBtn.onclick = sendMessage;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

figureEl.addEventListener("change", onCharacterChange);

clearHistoryBtn.onclick = clearHistory;

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
  localStorage.setItem("theme", isDark ? "dark" : "light");
  showToast(isDark ? "Karanlik tema" : "Aydinlik tema");
};

// Auto-resize textarea
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
});
