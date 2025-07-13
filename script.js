const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let session = {
  consentGiven: false,
  marketingOptIn: false,
  userType: "",
  primaryGoal: "",
  additionalInfo: "",
  email: "",
  region: "",
  chatOutcome: "",
  history: [],
  messageCount: 0,
  logged: false
};

function appendMessage(sender, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `message ${sender}`;
  bubble.innerText = text;

  if (sender === "bot") {
    const logo = document.createElement("img");
    logo.src = "logo-small.png"; // Replace with your logo file
    logo.alt = "Kayen Logo";
    logo.className = "avatar";
    wrapper.appendChild(logo);
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
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
      body: JSON.stringify({ prompt, session })
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      appendMessage("bot", "Oops! Something went wrong parsing the reply.");
      return;
    }

    if (data.reply) {
      appendMessage("bot", data.reply);
      session.history.push({ sender: "assistant", text: data.reply });
    } else {
      appendMessage("bot", "No reply received — want to try rephrasing?");
    }
  } catch (err) {
    appendMessage("bot", "Error contacting Kayen Concierge.");
    console.error("Fetch error:", err);
  }
}

form.addEventListener("submit", sendMessage);

// Initial welcome message
window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome = "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?";
    appendMessage("bot", welcome);
  }
});
