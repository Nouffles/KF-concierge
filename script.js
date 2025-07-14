const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const KAYEN_LOGO_URL =
  "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";

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

function appendMessage(sender, text, isLoading = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${sender === "user" ? "user" : "bot"}-message`;

  if (sender === "assistant") {
    const avatar = document.createElement("img");
    avatar.src = KAYEN_LOGO_URL;
    avatar.alt = "Kayen Logo";
    wrapper.appendChild(avatar);
  }

  const message = document.createElement("div");
  message.className = sender === "user" ? "user-message" : "bot-message";
  if (isLoading) {
    message.textContent = "...";
  } else {
    typeText(message, text);
  }

  wrapper.appendChild(message);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function typeText(element, text, index = 0) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => typeText(element, text, index + 1), 15);
  }
}

async function sendMessage(e) {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  input.value = "";
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  const loadingBubble = appendLoading();

  try {
    const response = await fetch("https://kayen-concierge.nouf.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session }),
    });

    const rawText = await response.text();
    console.log("Raw API Response:", rawText);

    chatBox.removeChild(loadingBubble);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error:", err);
      appendMessage("assistant", "Oops! Invalid response from the server.");
      return;
    }

    if (data.reply) {
      appendMessage("assistant", data.reply);
      session.history.push({ sender: "assistant", text: data.reply });
    } else {
      appendMessage("assistant", "Oops! No reply from the concierge.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    chatBox.removeChild(loadingBubble);
    appendMessage("assistant", "Oops! Something went wrong.");
  }
}

function appendLoading() {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message bot-message";
  const avatar = document.createElement("img");
  avatar.src = KAYEN_LOGO_URL;
  avatar.alt = "Kayen Logo";

  const dots = document.createElement("div");
  dots.className = "bot-message";
  dots.textContent = "...";

  wrapper.appendChild(avatar);
  wrapper.appendChild(dots);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrapper;
}

form.addEventListener("submit", sendMessage);

window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome = "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?";
    appendMessage("assistant", welcome);
  }
});
