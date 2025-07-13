const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const session = {
  history: [],
  messageCount: 0,
  consentGiven: false,
  logged: false,
};

const WORKER_ENDPOINT = "https://kayen-concierge.nouf.workers.dev/";

function appendMessage(text, sender = "user") {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = `message ${sender}`;

  if (sender === "kayen") {
    const avatar = document.createElement("img");
    avatar.src = "logo.png"; // replace with correct path to your logo
    avatar.alt = "Kayen logo";
    avatar.className = "avatar";
    messageWrapper.appendChild(avatar);
  }

  const messageText = document.createElement("div");
  messageText.className = "message-text";
  messageText.textContent = text;

  messageWrapper.appendChild(messageText);
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(prompt) {
  appendMessage(prompt, "user");
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session }),
    });

    const data = await res.json();
    const reply = data.reply || "Something went wrong.";

    appendMessage(reply, "kayen");
    session.history.push({ sender: "assistant", text: reply });

    if (data.sessionUpdate) {
      Object.assign(session, data.sessionUpdate);
    }
  } catch (err) {
    appendMessage("Oops! Something went wrong.", "kayen");
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (input) {
    sendMessage(input);
    userInput.value = "";
  }
});

// Initial welcome message
appendMessage(
  "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?",
  "kayen"
);
