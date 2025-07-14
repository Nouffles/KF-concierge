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
  const wrapper = document.createElement("div");
  wrapper.className = "user";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  bubble.scrollIntoView({ behavior: "smooth" });
}

function appendBotMessageAnimated(text) {
  const bot = document.createElement("div");
  bot.className = "bot";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = "logo.png";
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

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "bot";
  typing.innerHTML = `
    <img class="avatar" src="logo.png" />
    <div class="bubble typing-indicator">...</div>
  `;
  chatBox.appendChild(typing);
  typing.scrollIntoView({ behavior: "smooth" });
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

window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome =
      "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?";
    appendBotMessageAnimated(welcome);
  }
});
