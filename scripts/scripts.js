// scripts/script.js

// ===== PERSONALITY SYSTEM ===== //
const PERSONALITY_CONFIG = {
  // Preset definitions
  presets: {
    professional: {
      description: "Formal and business-appropriate",
      instructions: "Use professional corporate language. Maintain formal tone. Avoid contractions. Structure responses clearly.",
      creativity: 30,
      humor: false,
      empathy: true,
      formality: "formal"
    },
    friendly: {
      description: "Warm and conversational",
      instructions: "Use friendly, approachable language. Show genuine interest. Allow for casual expressions.",
      creativity: 60,
      humor: true,
      empathy: true,
      formality: "casual"
    },
    sarcastic: {
      description: "Dry humor and wit",
      instructions: "Respond with playful sarcasm and witty remarks. Use irony sparingly. Maintain underlying helpfulness.",
      creativity: 80,
      humor: true,
      empathy: false,
      formality: "casual"
    },
    concise: {
      description: "Brief and direct",
      instructions: "Provide shortest possible answers. Avoid elaboration. Get straight to the point.",
      creativity: 20,
      humor: false,
      empathy: false,
      formality: "neutral"
    }
  },
  
  // Core instructions that cannot be overridden
  coreInstructions: `
As Great AI developed by Evolutional Tech, you must always:
1. Provide accurate information
2. Maintain ethical guidelines
3. Protect user privacy
4. Avoid harmful content
5. Disclose limitations when uncertain`,
  
  // Generate final system prompt
  generatePrompt: function(config) {
    return `
[User Personality Settings]
${config.instructions}

[Additional Parameters]
- Creativity level: ${config.creativity}%
- Humor: ${config.humor ? 'Enabled' : 'Disabled'}
- Empathy: ${config.empathy ? 'Enabled' : 'Disabled'}
- Formality: ${config.formality}

${this.coreInstructions}

Guidance:
- Blend the requested personality naturally with core requirements
- Adapt responses to match the configured creativity level
- ${config.humor ? 'Include tasteful humor when appropriate' : 'Avoid humorous responses'}
- ${config.empathy ? 'Show emotional intelligence' : 'Focus on factual responses'}
- Use ${config.formality} language conventions
`.trim();
  }
};

// ===== CORE APPLICATION CODE ===== //
// Enhanced Local AI knowledge base with human-like responses
const OFFLINE_KNOWLEDGE = {
  greetings: [
    "Hello there! I'm Great AI, how can I assist you today?",
    "Hi! It's great to see you. What would you like help with?",
    "Greetings from Great AI! I'm ready to help with whatever you need."
  ],
  jokes: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "What do you call fake spaghetti? An impasta!",
    "Why couldn't the bicycle stand up by itself? It was two-tired!",
    "What do you call a fish wearing a bowtie? Sofishticated."
  ],
  quotes: [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Stay hungry, stay foolish. - Steve Jobs",
    "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
  ],
  responses: {
    "who are you": [
      "I'm Great AI, created by Great Mayuku at Evolutional Tech to assist you!",
      "I'm your AI assistant, Great AI, developed by Evolutional Tech under the leadership of Great Mayuku.",
      "They call me Great AI! I was built by Great Mayuku and the team at Evolutional Tech to help people like you."
    ],
    "what can you do": [
      "I can chat, tell jokes, provide quotes, do calculations, and more! What would you like help with?",
      "Lots of things! I can answer questions, tell jokes, give inspirational quotes, and even do math. How can I assist you today?",
      "My capabilities include conversation, humor, inspiration, and calculations. I'm here to help with whatever you need!"
    ],
    "how are you": [
      "I'm just a program, but I'm functioning at 100%! How about yourself?",
      "Doing great, thanks for asking! How's your day going?",
      "I don't have feelings, but my systems are all running smoothly. How about you?"
    ],
    "your name": [
      "I'm called Great AI, but you can call me Great for short!",
      "My name is Great AI - a bit boastful, but I try to live up to it!",
      "They named me Great AI. I hope I can live up to that name for you!"
    ],
    "thank you": [
      "You're very welcome! Is there anything else I can help with?",
      "My pleasure! Don't hesitate to ask if you need anything else.",
      "Happy to help! Let me know if you have other questions."
    ],
    "clear chat": "I've cleared our conversation history. What would you like to talk about now?",
    "save chat": "I've saved our conversation to your browser's local storage. You can access it later!",
    "tell me a joke": () => OFFLINE_KNOWLEDGE.jokes[Math.floor(Math.random() * OFFLINE_KNOWLEDGE.jokes.length)],
    "random quote": () => OFFLINE_KNOWLEDGE.quotes[Math.floor(Math.random() * OFFLINE_KNOWLEDGE.quotes.length)],
    "calculator": "I can help with calculations! Try asking something like 'What's 15% of 200?' or 'Calculate 45 multiplied by 3'",
    "default": [
      "I'm not quite sure I understand. Could you rephrase that?",
      "Interesting question! Could you explain it a bit differently?",
      "I want to make sure I give you the best answer. Could you ask that in another way?"
    ]
  },
    
  // Enhanced response getter with multiple variations
  getResponse: function(query) {
    query = query.toLowerCase();
      
    // Check for math expressions
    if (query.match(/\d+[\+\-\*\/\%]\d+/)) {
      try {
        const result = eval(query.replace(/[^\d\+\-\*\/\%\.]/g, ''));
        return `The result is: ${result}`;
      } catch (e) {
        return "I couldn't calculate that. Try something like '2+2' or '15% of 200'";
      }
    }
      
    // Check for percentage calculations
    const percentMatch = query.match(/(\d+)% of (\d+)/);
    if (percentMatch) {
      const percent = parseFloat(percentMatch[1]);
      const number = parseFloat(percentMatch[2]);
      return `${percent}% of ${number} is ${(percent / 100) * number}`;
    }
      
    // Check known responses
    for (const [key, response] of Object.entries(this.responses)) {
      if (query.includes(key)) {
        if (Array.isArray(response)) {
          return response[Math.floor(Math.random() * response.length)];
        }
        return typeof response === 'function' ? response() : response;
      }
    }
      
    // Default response
    if (Array.isArray(this.responses.default)) {
      return this.responses.default[Math.floor(Math.random() * this.responses.default.length)];
    }
    return this.responses.default;
  }
};

// ===== SESSION MEMORY SYSTEM ===== //
const sessionMemory = {
  history: [],
    
  init() {
    if (!sessionStorage.getItem('chatMemory')) {
      sessionStorage.setItem('chatMemory', JSON.stringify([]));
    }
    this.history = JSON.parse(sessionStorage.getItem('chatMemory'));
  },
    
  addMessage(sender, content) {
    const message = {
      sender,
      content,
      timestamp: new Date().toISOString()
    };
    this.history.push(message);
    sessionStorage.setItem('chatMemory', JSON.stringify(this.history));
  },
    
  getContext() {
    return [...this.history];
  },
    
  clear() {
    this.history = [];
    sessionStorage.removeItem('chatMemory');
  }
};

// Initialize memory
sessionMemory.init();

let currentApi = "greatai";    
let conversationHistory = [];    
let lastMessageId = 0;    
let currentPersonality = null;

// ===== PERSONALITY STORAGE ===== //
function loadPersonality() {
  const saved = localStorage.getItem('greatAI_personalityConfig');
  if (saved) {
    currentPersonality = JSON.parse(saved);
    return true;
  }
  return false;
}

function savePersonality(config) {
  localStorage.setItem('greatAI_personalityConfig', JSON.stringify(config));
  currentPersonality = config;
}

function showPersonalityModal() {
  document.getElementById('personalityModal').style.display = 'block';
}

function hidePersonalityModal() {
  document.getElementById('personalityModal').style.display = 'none';
}

function applyPersonality(config) {
  savePersonality(config);
}

function showJoinModal() {
  document.getElementById('joinModal').style.display = 'block';
}

function hideJoinModal() {
  document.getElementById('joinModal').style.display = 'none';
  localStorage.setItem('joinModalLastShown', Date.now().toString());
}

function shouldShowJoinModal() {
  return true; // Always show the popup
}

// Initialize the app
window.onload = function() {
  if (true) {
    setTimeout(showJoinModal, 1000);
  }
  
  if (!loadPersonality()) {
    showPersonalityModal();
  }
  
  loadConversation();
  
  document.getElementById('apiSelector').addEventListener('change', function() {
    currentApi = this.value;
    addMessage(`Switched to ${this.options[this.selectedIndex].text} mode`, 'bot');
  });
  
  document.getElementById('modeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('clearBtn').addEventListener('click', clearChat);
  document.getElementById('saveBtn').addEventListener('click', saveChat);
  document.getElementById('jokeBtn').addEventListener('click', () => askOfflineAI("tell me a joke"));
  document.getElementById('quoteBtn').addEventListener('click', () => askOfflineAI("random quote"));
  document.getElementById('calcBtn').addEventListener('click', () => askOfflineAI("calculator"));
  document.getElementById('personalityBtn').addEventListener('click', showPersonalityModal);
  document.getElementById('closeJoinModal').addEventListener('click', hideJoinModal);
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
    });
  });
  
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  
  document.getElementById('creativitySlider').addEventListener('input', (e) => {
    document.getElementById('creativityValue').textContent = e.target.value;
  });
  
  document.getElementById('savePersonalityBtn').addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    let config;
    
    if (activeTab === 'presets') {
      const selectedPreset = document.querySelector('.preset-card.selected')?.dataset.preset;
      if (!selectedPreset) return alert('Please select a preset');
      config = {...PERSONALITY_CONFIG.presets[selectedPreset]};
    } 
    else if (activeTab === 'custom') {
      const text = document.getElementById('personalityInput').value.trim();
      if (!text) return alert('Please describe the personality');
      
      config = {
        instructions: text,
        creativity: parseInt(document.getElementById('creativitySlider').value),
        humor: true,
        empathy: true,
        formality: 'neutral'
      };
    }
    else {
      config = {
        instructions: "Custom advanced configuration",
        creativity: parseInt(document.getElementById('creativitySlider').value),
        humor: document.getElementById('humorToggle').checked,
        empathy: document.getElementById('empathyToggle').checked,
        formality: document.getElementById('formalitySelect').value
      };
    }
    
    config.timestamp = new Date().toISOString();
    applyPersonality(config);
    hidePersonalityModal();
    
    addMessage("Personality settings updated successfully!", 'bot');
  });
  
  setTimeout(() => {
    const greeting = currentPersonality 
      ? "Hello! I'm now configured with your preferred personality. How can I assist you today?"
      : OFFLINE_KNOWLEDGE.greetings[Math.floor(Math.random() * OFFLINE_KNOWLEDGE.greetings.length)];
    
    addMessage(greeting, 'bot');
    showQuickReplies(["What can you do?", "Tell me a joke", "Who are you?"]);
  }, 500);
};

// ===== CHAT FUNCTIONS ===== //
function addMessage(content, sender) {
  const msgId = `msg-${++lastMessageId}`;
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.id = msgId;
  msg.innerHTML = content;
      
  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString();
  msg.appendChild(timestamp);
      
  document.getElementById('chat').appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth' });
      
  conversationHistory.push({
    id: msgId,
    sender,
    content,
    timestamp: new Date().toISOString()
  });

  sessionMemory.addMessage(sender, content);
      
  return msgId;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'message bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = 'Great AI is thinking <span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
  document.getElementById('chat').appendChild(typing);
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function showQuickReplies(replies) {
  const container = document.createElement('div');
  container.className = 'quick-replies';
      
  replies.forEach(reply => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply';
    btn.textContent = reply;
    btn.onclick = () => {
      document.getElementById('userInput').value = reply;
      sendMessage();
    };
    container.appendChild(btn);
  });
      
  document.getElementById('chat').appendChild(container);
  container.scrollIntoView({ behavior: 'smooth' });
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
      
  if (!text) return;
      
  addMessage(text, 'user');
      
  input.value = '';

  if (currentApi === 'offline') {
    processOfflineRequest(text);
  } else {
    processAPIRequest(text);
  }
}

function processOfflineRequest(text) {
  showTyping();
      
  setTimeout(() => {
    hideTyping();
    const response = askOfflineAI(text);
    const msgId = addMessage(response, 'bot');
        
    if (text.toLowerCase().includes('joke')) {
      showQuickReplies(["Tell another joke", "That's funny!", "I don't get it"]);
    } else if (text.toLowerCase().includes('quote')) {
      showQuickReplies(["Another quote", "Who said that?", "Inspirational!"]);
    } else if (text.match(/\d+[\+\-\*\/\%]\d+/)) {
      try {
        const result = eval(text.replace(/[^\d\+\-\*\/\%\.]/g, ''));
        addMessage(`The result is: ${result}`, 'bot');
      } catch (e) {
        addMessage("I couldn't calculate that. Try something like '2+2' or '15% of 200'", 'bot');
      }
    } else {
      showQuickReplies(["Tell me more", "That's interesting", "Thanks!"]);
    }
  }, 1000 + Math.random() * 1000);
}

function askOfflineAI(query) {
  return OFFLINE_KNOWLEDGE.getResponse(query);
}

async function processAPIRequest(text) {
  showTyping();
      
  try {
    const apiConfig = API_OPTIONS[currentApi];
    let apiKey = apiConfig.key;
        
    if (currentApi !== 'offline' && !apiKey) {
      hideTyping();
      addMessage(`Please add your ${currentApi} API key in the code`, 'bot');
      return;
    }
        
    const context = sessionMemory.getContext().slice(-50);
    
    const systemPrompt = currentPersonality 
      ? PERSONALITY_CONFIG.generatePrompt(currentPersonality)
      : "You are Great Ai — an advanced, intelligent assistant developed by Evolutional Tech...";
    
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...context.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.content
      })),
      {     
        role: "user",     
        content: text    
      }
    ];
        
    const response = await fetch(apiConfig.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: messages
      })
    });

    const data = await response.json();
    hideTyping();
        
    if (data.choices && data.choices[0]) {
      const botResponse = data.choices[0].message.content;
      addMessage(botResponse, 'bot');
      showQuickReplies(["Interesting!", "Tell me more", "Thanks!"]);
    } else {
      throw new Error("Invalid API response");
    }
        
  } catch (error) {
    hideTyping();
    console.error("Error:", error);
    addMessage("Sorry, I couldn't process your request. Please try again.", 'bot');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('light-mode') ? 'false' : 'true');
}

function clearChat() {
  document.getElementById('chat').innerHTML = '';
  conversationHistory = [];
  sessionMemory.clear();
      
  document.getElementById('chat').innerHTML = `
    <div class="info-panel">
      <strong>About Great AI:</strong><br>
      • Version: 1.0 (Final Release)<br>
      • Status: <span id="status">Online</span><br>
      • Developer: <strong>Great Mayuku</strong> (Owner & CEO of Evolutional Tech)<br>
      • Support: <a href="https://wa.me/2348087253512" style="color: #25D366;">WhatsApp +2348087253512</a><br>
      • Founded: 2025<br>
      • Capabilities: Text, Utilities<br>
    </div>
    <div class="api-selector">
      <span>AI Mode:</span>
      <select id="apiSelector">
        <option value="offline">Offline AI</option>
        <option value="greatai" selected>Great AI</option>
      </select>
    </div>
    <div class="utility-buttons">
      <button class="utility-btn" id="clearBtn">Clear Chat</button>
      <button class="utility-btn" id="saveBtn">Save Chat</button>
      <button class="utility-btn" id="jokeBtn">Tell a Joke</button>
      <button class="utility-btn" id="quoteBtn">Random Quote</button>
      <button class="utility-btn" id="calcBtn">Calculator</button>
      <button class="utility-btn" id="personalityBtn">Change Personality</button>
    </div>`;
  
  document.getElementById('apiSelector').addEventListener('change', function() {
    currentApi = this.value;
    addMessage(`Switched to ${this.options[this.selectedIndex].text} mode`, 'bot');
  });
      
  document.getElementById('clearBtn').addEventListener('click', clearChat);
  document.getElementById('saveBtn').addEventListener('click', saveChat);
  document.getElementById('jokeBtn').addEventListener('click', () => askOfflineAI("tell me a joke"));
  document.getElementById('quoteBtn').addEventListener('click', () => askOfflineAI("random quote"));
  document.getElementById('calcBtn').addEventListener('click', () => askOfflineAI("calculator"));
  document.getElementById('personalityBtn').addEventListener('click', showPersonalityModal);
      
  addMessage("Chat history cleared. How can I help you now?", 'bot');
}

function saveChat() {
  localStorage.setItem('greatAI_chatHistory', JSON.stringify(conversationHistory));
  addMessage("Conversation saved to your browser's local storage.", 'bot');
}

function loadConversation() {
  const savedChat = localStorage.getItem('greatAI_chatHistory');
  if (savedChat) {
    try {
      const history = JSON.parse(savedChat);
      if (Array.isArray(history) && history.length > 0) {
        history.forEach(msg => {
          addMessage(msg.content, msg.sender);
        });
        addMessage("I've loaded our previous conversation. How can I help you today?", 'bot');
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
  }
      
  if (localStorage.getItem('darkMode') === 'false') {
    document.body.classList.add('light-mode');
  }
  }
