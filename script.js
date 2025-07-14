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

function appendMessage(sender, text) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-message");

  const message = document.createElement("div");
  message.className = sender === "user" ? "user-message" : "bot-message";
  message.textContent = "";

  if (sender === "bot") {
    const avatar = document.createElement("img");
    avatar.src = "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";
    avatar.alt = "Kayen Logo";
    message.appendChild(avatar);
  }

  bubble.appendChild(message);
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Typing animation
  const dots = document.createElement("span");
  dots.className = "typing-dots";
  dots.textContent = "...";
  if (sender === "bot") message.appendChild(dots);

  setTimeout(() => {
    if (sender === "bot") {
      message.removeChild(dots);
    }
    message.textContent = text;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 700);
}

async function sendMessage(e) {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  input.value = "";
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  try {
    const response = await fetch("https://kayen-concierge.nouf.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session }),
    });

    const rawText = await response.text();
    console.log("Raw API Response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error:", err);
      appendMessage("bot", "Oops! Invalid response from the server.");
      return;
    }

    if (data.reply) {
      appendMessage("bot", data.reply);
      session.history.push({ sender: "assistant", text: data.reply });
    } else {
      appendMessage("bot", "Oops! No reply from the concierge.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    appendMessage("bot", "Oops! Something went wrong.");
  }
}

form.addEventListener("submit", sendMessage);
