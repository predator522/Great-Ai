// ===== CONFIGURATION ===== //
const API_OPTIONS = {
  offline: { name: "Offline AI", endpoint: "offline", key: null, model: null },
  greatai: { 
    name: "Great AI", 
    endpoint: "/api/chat", // 🔥 calls your backend instead of OpenRouter directly
    key: null,
    model: "openai/gpt-4o-mini"
  }
};

let currentApi = "greatai";
let currentPersonality = null;

// ===== SESSION MEMORY ===== //
const sessionMemory = {
  history: [],
  add: function(sender, content) {
    this.history.push({ sender, content, timestamp: new Date() });
  },
  getContext: function() {
    return this.history.slice(-20);
  },
  clear: function() {
    this.history = [];
  }
};

// ===== PERSONALITY CONFIG ===== //
const PERSONALITY_CONFIG = {
  presets: {
    professional: "You are professional and formal. Provide detailed, business-appropriate responses.",
    friendly: "You are warm and conversational. Be empathetic and approachable.",
    sarcastic: "You are witty and sarcastic. Respond with dry humor and clever remarks.",
    concise: "You are brief and to-the-point. Answer in the shortest possible way."
  },
  generatePrompt: function(settings) {
    let base = "You are Great AI, developed by Evolutional Tech. ";
    if (settings.preset && this.presets[settings.preset]) {
      base += this.presets[settings.preset] + " ";
    }
    if (settings.custom) {
      base += settings.custom + " ";
    }
    if (settings.humor === false) base += "Do not use humor. ";
    if (settings.empathy === false) base += "Be straightforward without empathy. ";
    if (settings.formality) {
      base += `Your tone should be ${settings.formality}. `;
    }
    return base.trim();
  }
};

// ===== OFFLINE MODE ===== //
const OFFLINE_KNOWLEDGE = {
  "hello": "Hi! I'm Great AI (offline mode). How can I assist you today?",
  "who created you": "I was developed by Great Mayuku, CEO of Evolutional Tech (2025).",
  "what is your version": "I am Great AI version 1.0 (Final Release).",
  "bye": "Goodbye! Looking forward to chatting again."
};

// ===== CHAT FUNCTIONS ===== //
function addMessage(content, sender = "user") {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = `<div class="bubble">${content}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  sessionMemory.add(sender, content);
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  if (currentApi === "offline") {
    const reply = getOfflineResponse(text);
    addMessage(reply, "bot");
  } else {
    processAPIRequest(text);
  }
}

function getOfflineResponse(text) {
  text = text.toLowerCase();
  for (const key in OFFLINE_KNOWLEDGE) {
    if (text.includes(key)) return OFFLINE_KNOWLEDGE[key];
  }
  return "I'm in offline mode. Limited responses available.";
}

// ===== FIXED BACKEND VERSION ===== //
async function processAPIRequest(text) {
  showTyping();

  try {
    const context = sessionMemory.getContext().slice(-50);

    const systemPrompt = currentPersonality 
      ? PERSONALITY_CONFIG.generatePrompt(currentPersonality)
      : "You are Great AI — an advanced, intelligent assistant developed by Evolutional Tech.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...context.map(msg => ({
        role: msg.sender === "bot" ? "assistant" : "user",
        content: msg.content
      })),
      { role: "user", content: text }
    ];

    // 🔥 Calls secure backend route
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages
      })
    });

    const data = await response.json();
    hideTyping();

    if (data.choices && data.choices[0]) {
      const botResponse = data.choices[0].message.content;
      addMessage(botResponse, "bot");
      showQuickReplies(["Interesting!", "Tell me more", "Thanks!"]);
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    hideTyping();
    console.error("Error:", error);
    addMessage("Sorry, I couldn't process your request. Please try again.", "bot");
  }
}

// ===== UTILITIES ===== //
function clearChat() {
  document.getElementById("chat").innerHTML = "";
  sessionMemory.clear();
}

function saveChat() {
  const text = sessionMemory.history
    .map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.sender.toUpperCase()}: ${m.content}`)
    .join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_history.txt";
  link.click();
}

function showTyping() {
  const chat = document.getElementById("chat");
  const typing = document.createElement("div");
  typing.className = "message bot typing-indicator";
  typing.innerHTML = "<div class='bubble'>...</div>";
  typing.id = "typing";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

function showQuickReplies(options) {
  const chat = document.getElementById("chat");
  const container = document.createElement("div");
  container.className = "quick-replies";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      addMessage(opt, "user");
      processAPIRequest(opt);
      container.remove();
    };
    container.appendChild(btn);
  });
  chat.appendChild(container);
  chat.scrollTop = chat.scrollHeight;
}

// ===== PERSONALITY MODAL ===== //
document.getElementById("personalityBtn").onclick = () => {
  document.getElementById("personalityModal").style.display = "flex";
};

document.getElementById("savePersonalityBtn").onclick = () => {
  const activeTab = document.querySelector(".tab-btn.active").dataset.tab;

  if (activeTab === "presets") {
    const selected = document.querySelector(".preset-card.selected");
    if (selected) {
      currentPersonality = { preset: selected.dataset.preset };
    }
  } else if (activeTab === "custom") {
    const custom = document.getElementById("personalityInput").value;
    const creativity = document.getElementById("creativitySlider").value;
    currentPersonality = { custom, creativity };
  } else if (activeTab === "advanced") {
    const humor = document.getElementById("humorToggle").checked;
    const empathy = document.getElementById("empathyToggle").checked;
    const formality = document.getElementById("formalitySelect").value;
    currentPersonality = { humor, empathy, formality };
  }

  document.getElementById("personalityModal").style.display = "none";
  addMessage("Personality updated ✅", "bot");
};

// ===== MODALS & EVENTS ===== //
document.getElementById("closeJoinModal").onclick = () => {
  document.getElementById("joinModal").style.display = "none";
};

document.querySelectorAll(".preset-card").forEach(card => {
  card.onclick = () => {
    document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
  };
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
    document.getElementById(`${btn.dataset.tab}-tab`).classList.remove("hidden");
  };
});

// ===== BUTTONS ===== //
document.getElementById("clearBtn").onclick = clearChat;
document.getElementById("saveBtn").onclick = saveChat;
document.getElementById("jokeBtn").onclick = () => processAPIRequest("Tell me a joke");
document.getElementById("quoteBtn").onclick = () => processAPIRequest("Give me a random motivational quote");
document.getElementById("calcBtn").onclick = () => processAPIRequest("Open calculator");
document.getElementById("apiSelector").onchange = (e) => {
  currentApi = e.target.value;
};
