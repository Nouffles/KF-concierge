const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

let session = {
  consentGiven: false,
  userType: "",
  primaryGoal: "",
  additionalInfo: "",
  email: "",
  region: "",
  chatOutcome: "",
  history: []
};

function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.className = sender;
  message.innerText = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(userMessage) {
  appendMessage('user', userMessage);
  session.history.push({ role: 'user', content: userMessage });

  const response = await fetch("https://kayen-concierge.nouf.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(session)
  });

  const data = await response.json();
  if (data.reply) {
    appendMessage('bot', data.reply);
    session.history.push({ role: 'assistant', content: data.reply });
  } else {
    appendMessage('bot', "Oops, something went wrong!");
  }
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (input !== "") {
    sendMessage(input);
    userInput.value = "";
  }
});

// First bot message
appendMessage('bot', "Hey — I'm Kayen, your personal fitness concierge 👋\nI'm here to help you find the right personal trainer based on your goals.\nWhat’s something you’ve been wanting to work on lately — or a change you’re hoping to make?");
