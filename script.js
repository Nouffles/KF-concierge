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
  bubble.className = `message ${sender}`;
  bubble.innerText = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(e) {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  input.value = "";

  // Push to history
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  try {
    const safeSession = {
      ...session,
      // Avoid sending functions or anything unserializable
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
    console.error("❌ Fetch failed", err);
    appendMessage("bot", "Oops! Something went wrong.");
  }
}

form.addEventListener("submit", sendMessage);

// Start with the welcome message if it's the user's first message
window.addEventListener("DOMContentLoaded", () => {
  if (session.messageCount === 0) {
    const welcome = `Hey — I'm Kayen, your personal fitness concierge 👋
I'm here to help you find the right personal trainer based on your goals.
What’s something you’ve been wanting to work on lately — or a change you’re hoping to make?`;
    appendMessage("bot", welcome);
  }
});
