const apiEndpoint = "https://kayen-concierge.nouf.workers.dev/";

let session = {
  consentGiven: false,
  userType: "",
  primaryGoal: "",
  additionalInfo: "",
  email: "",
  region: "",
  chatOutcome: "",
  history: [],
  messageCount: 0
};

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function appendMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "message user" : "message bot";
  messageDiv.innerText = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(prompt) {
  appendMessage("user", prompt);
  session.history.push({ sender: "user", text: prompt });
  session.messageCount++;

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session })
    });

    const data = await response.json();

    if (!response.ok) {
      appendMessage("bot", `Error: ${data.reply || 'Something went wrong.'}`);
      console.error("Backend error:", data);
      return;
    }

    const botReply = data.reply || "Oops, no response. Try again?";
    appendMessage("bot", botReply);
    session.history.push({ sender: "assistant", text: botReply });

  } catch (err) {
    appendMessage("bot", "Oops! Something went wrong.");
    console.error("Frontend error:", err);
  }
}

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = userInput.value.trim();
  if (input) {
    sendMessage(input);
    userInput.value = "";
  }
});
