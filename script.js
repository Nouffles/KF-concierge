const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let session = {
  consentGiven: false,
  userType: "",
  primaryGoal: "",
  additionalInfo: "",
  email: "",
  region: "",
  chatOutcome: "",
  history: [],
  messageCount: 0,
  logged: false,
};

function appendUserMessage(text) {
  const bubble = document.createElement("div");
  bubble.className = "user message";
  bubble.innerText = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotMessageAnimated(text) {
  const botMessage = document.createElement("div");
  botMessage.className = "bot-message";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src =
    "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";

  const message = document.createElement("div");
  message.className = "message";
  botMessage.appendChild(avatar);
  botMessage.appendChild(message);
  chatBox.appendChild(botMessage);
  chatBox.scrollTop = chatBox.scrollHeight;

  let index = 0;
  const speed = 20;

  function typeNextChar() {
    if (index < text.length) {
      message.textContent += text.charAt(index);
      index++;
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(typeNextChar, speed);
    }
  }

  typeNextChar();
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "bot-message typing";
  typing.innerHTML = `
    <img class="avatar" src="https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w" />
    <div class="message typing-indicator">...</div>
  `;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typing;
}

async function sendMessage(e) {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  appendUserMessage(prompt);
  input.value = "";
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  const typingNode = showTypingIndicator();

  try {
    const res = await fetch("https://kayen-concierge.nouf.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session }),
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
      session.history.push({ sender: "assistant", text: data.reply });
    } else {
      appendBotMessageAnimated("Hmm, no reply received. Try again?");
    }
  } catch (err) {
    chatBox.removeChild(typingNode);
    appendBotMessageAnimated("Oops! Something went wrong.");
    console.error(err);
  }
}

form.addEventListener("submit", sendMessage);

// Optional: Initial message if needed
window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome =
      "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?";
    appendBotMessageAnimated(welcome);
  }
});
