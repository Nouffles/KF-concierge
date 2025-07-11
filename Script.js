const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function addMessage(message, sender = 'bot') {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = message;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getBotResponse(input) {
  try {
    const res = await fetch("https://kayen-concierge.nouf.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    return data.reply;
  } catch (err) {
    return "Hmm, I’m having a techy moment. Try again in a sec!";
  }
}

chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  addMessage(message, 'user');
  userInput.value = '';

  const reply = await getBotResponse(message);
  addMessage(reply, 'bot');
});
