const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Add a message to the chat box
function addMessage(message, sender = 'bot') {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = message;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Basic response logic
function getBotResponse(input) {
  input = input.toLowerCase();
  if (input.includes('hello') || input.includes('hi')) {
    return "Hey there 👋! I’m the Kayen Concierge. Tell me a bit about your goals or what kind of trainer you’re looking for.";
  } else if (input.includes('weight') || input.includes('lose') || input.includes('fat')) {
    return "Looking to lose weight? We’ve got strength and conditioning coaches who can help build a long-term plan 💪";
  } else if (input.includes('trainer')) {
    return "We’ve got mobility coaches, strength trainers, and experts in custom programming. Any preference?";
  } else {
    return "Got it! I’m still learning — but I can connect you with a real trainer who fits. Just say the word. 😄";
  }
}

// Handle user input
chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  addMessage(message, 'user');
  const reply = getBotResponse(message);
  setTimeout(() => addMessage(reply, 'bot'), 600);

  userInput.value = '';
});
