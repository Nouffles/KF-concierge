const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const logoUrl = "https://images.squarespace-cdn.com/content/v1/684758debc5a091431c9977a/c0085606-09b9-4b02-9940-94c6800fd72b/Logo+-+Color+-+White+Text.png?format=1000w";

// Random welcome messages
const welcomeMessages = [
  "Hey — I’m Kayen, your personal fitness concierge 👋 What’s something you’ve been wanting to work on lately — or a change you’re hoping to make?",
  "Hi there! I’m Kayen 👋 I match people with trainers based on their goals. What are you hoping to achieve right now?",
  "Welcome! I’m Kayen, your fitness concierge. Want to tell me what you’re working toward lately?",
  "Hello! I’m Kayen — here to guide you to the right trainer. What’s a goal you’ve got in mind right now?"
];

// Utility: add message to DOM
function addMessage(text, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  if (sender === "bot") {
    const avatar = document.createElement("img");
    avatar.src = logoUrl;
    avatar.alt = "Kayen logo";
    messageDiv.appendChild(avatar);

    const textSpan = document.createElement("span");
    messageDiv.appendChild(textSpan);
    chatBox.appendChild(messageDiv);
    animateTyping(textSpan, text);
  } else {
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Utility: animate bot typing
function animateTyping(el, text) {
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 20);
}

// Add loading dots while waiting
function showLoading() {
  const loading = document.createElement("div");
  loading.classList.add("message", "bot", "typing");
  loading.innerHTML = `<img src="${logoUrl}" alt="Kayen logo"><span>...</span>`;
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;
  return loading;
}

// Send user message and fetch reply
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = userInput.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  userInput.value = "";

  const loadingEl = showLoading();

  try {
    const res = await fetch("https://kayen-concierge.nouf.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userText, session: { messageCount: 1 } })
    });

    const data = await res.json();
    loadingEl.remove();
    addMessage(data.reply);
  } catch (err) {
    loadingEl.remove();
    addMessage("Oops — something went wrong. Try again?");
  }
});

// Trigger random welcome message on load
window.addEventListener("load", () => {
  const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  addMessage(randomMsg);
});
