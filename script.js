// =================================== 
// CONFIG
// ===================================
const WORKER_BASE = "https://kayen-concierge.nouf.workers.dev"; // no trailing slash is slightly cleaner
const WORKER_LEAD = `${WORKER_BASE}/lead`;
const WORKER_CHAT = `${WORKER_BASE}/chat`;
const KAYEN_AVATAR = "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";

// ===================================
// ELEMENTS
// ===================================
const leadContainer = document.getElementById("lead-container");
const leadForm = document.getElementById("lead-form");
const leadEmail = document.getElementById("lead-email");
const leadConsent = document.getElementById("lead-consent");
const leadContinue = document.getElementById("lead-continue");
const leadMsg = document.getElementById("lead-msg");

const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// ===================================
// Session (client UI; server is source of truth)
// ===================================
let session = {
  sessionId: null,
  history: [],
  messageCount: 0,
};

// ===================================
// UI HELPERS (animated typing, avatar, etc.)
// ===================================
function appendUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "user";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  bubble.scrollIntoView({ behavior: "smooth" });
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "bot";
  typing.innerHTML = `
    <img class="avatar" src="${KAYEN_AVATAR}" alt="Kayen Logo" />
    <div class="bubble typing-indicator">...</div>
  `;
  chatBox.appendChild(typing);
  typing.scrollIntoView({ behavior: "smooth" });
  return typing;
}

function appendBotMessageAnimated(text) {
  const bot = document.createElement("div");
  bot.className = "bot";
  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = KAYEN_AVATAR;
  avatar.alt = "Kayen Logo";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bot.appendChild(avatar);
  bot.appendChild(bubble);
  chatBox.appendChild(bot);
  bubble.scrollIntoView({ behavior: "smooth" });

  let i = 0;
  const speed = 20;
  function typeNext() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(typeNext, speed);
    }
  }
  typeNext();
}

// ===================================
// LEAD: email + consent → POST /lead
// ===================================
leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  leadMsg.textContent = "";
  leadContinue.disabled = true;

  try {
    const res = await fetch(WORKER_LEAD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: leadEmail.value.trim(),
        consent: !!leadConsent.checked,
      }),
    });

    const data = await res.json();

    // Region gate (blocked users not stored)
    if (data.blocked) {
      leadMsg.textContent =
        data.message ||
        "We’re launching in the UK + EU first. Follow @kayenfitness for updates.";
      leadContinue.disabled = false;
      return;
    }

    if (!data.sessionId) {
      leadMsg.textContent = "Something went wrong. Please try again.";
      leadContinue.disabled = false;
      return;
    }

    // Persist sessionId for chat calls and local state
    localStorage.setItem("kayen_session", data.sessionId);
    session.sessionId = data.sessionId;

    // Animate lead → chat
    leadContainer.classList.add("fade-out");
    setTimeout(() => {
      leadContainer.classList.add("hidden");
      chatContainer.classList.remove("hidden");
      chatContainer.classList.add("active");

      // Fixed intro (provided by UI)
      appendBotMessageAnimated(
        "Hi👋 I'm Kayen, your personal fitness concierge!\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately?"
      );
      userInput.focus();
    }, 250);
  } catch (err) {
    leadMsg.textContent = "Network error — please try again.";
  } finally {
    leadContinue.disabled = false;
  }
});

// ===================================
// CHAT: user message → POST /chat
// ===================================
async function sendMessage(e) {
  e.preventDefault();
  const prompt = userInput.value.trim();
  if (!prompt) return;

  appendUserMessage(prompt);
  userInput.value = "";
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  const typingNode = showTypingIndicator();

  try {
    const sid = session.sessionId || localStorage.getItem("kayen_session");
    const res = await fetch(WORKER_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        session: { sessionId: sid }, // server keeps authoritative state
      }),
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      chatBox.removeChild(typingNode);
      appendBotMessageAnimated("Oops! I didn’t get that. Want to try again?");
      return;
    }

    chatBox.removeChild(typingNode);

    if (data.reply) {
      appendBotMessageAnimated(data.reply);
      if (data.session?.sessionId) {
        session.sessionId = data.session.sessionId;
        localStorage.setItem("kayen_session", data.session.sessionId);
      }
    } else {
      appendBotMessageAnimated("Hmm, no reply received. Try again?");
    }
  } catch (err) {
    chatBox.removeChild(typingNode);
    appendBotMessageAnimated("Oops! Something went wrong.");
    console.error(err);
  }
}

chatForm.addEventListener("submit", sendMessage);
