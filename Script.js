// Updated script.js for Kayen Concierge – handles full session and chat logic

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

let messageCount = 0;
let history = [];
let consentGiven = false;
let logged = false;

// Helper to append a message
function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.className = sender;
  message.innerText = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Sends prompt + session data to Cloudflare
async function sendMessage(prompt) {
  const payload = {
    prompt,
    session: {
      messageCount,
      consentGiven,
      userType: "",
      primaryGoal: "",
      additionalInfo: "",
      email: "",
      region: "",
      chatOutcome: "",
      logged,
      history: history.map(h => ({ sender: h.sender, text: h.text }))
    }
  };

  try {
    const res = await fetch("https://kayen-concierge.nouf.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.reply) {
      appendMessage("bot", data.reply);
      history.push({ sender: "assistant", text: data.reply });
      messageCount++;
    } else {
      appendMessage("bot", "Hmm, I didn’t catch that. Want to try again?");
    }
  } catch (err) {
    appendMessage("bot", "Oops! Something went wrong.");
    console.error(err);
  }
}

chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  appendMessage("user", input);
  history.push({ sender: "user", text: input });
  userInput.value = "";
  await sendMessage(input);
});

// Trigger welcome message
window.onload = () => {
  sendMessage("[init]");
};
