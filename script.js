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
  bubble.className = "chat-bubble user";
  bubble.innerText = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotMessageTyped(text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("bot-message");

  const avatar = document.createElement("img");
  avatar.src = "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";
  avatar.alt = "Kayen Bot";
  avatar.classList.add("bot-avatar");

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", "bot");

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  let i = 0;
  const speed = 20;

  function type() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  type();
}

async function sendMessage(e) {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  appendUserMessage(prompt);
  input.value = "";

  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  try {
    const safeSession = {
      ...session,
      history: session.history.map(m => ({ sender: m.sender, text: m.text }))
    };

    const response = await fetch("https://kayen-concierge.nouf.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session: safeSession }),
    });

    const rawText = await response.text();
    console.log("Raw response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ JSON parse failed", err);
      appendBotMessageTyped("Oops! Invalid response from the server.");
      return;
    }

    if (data.reply) {
      appendBotMessageTyped(data.reply);
      session.history.push({ sender: "assistant", text: data.reply });
    } else {
      appendBotMessageTyped("Oops! No reply from the concierge.");
    }
  } catch (err) {
    console.error("❌ Fetch failed", err);
    appendBotMessageTyped("Oops! Something went wrong.");
  }
}

form.addEventListener("submit", sendMessage);

window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome = `Hey — I'm Kayen, your personal fitness concierge 👋
I'm here to help you find the right personal trainer based on your goals.
What’s something you’ve been wanting to work on lately — or a change you’re hoping to make?`;
    appendBotMessageTyped(welcome);
  }
});
