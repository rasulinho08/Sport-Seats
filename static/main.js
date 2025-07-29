// Connect to Socket.IO server
const socket = io('http://127.0.0.1:5000');

// Elements
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Send message
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('send_message', { message: message });
        chatInput.value = '';
    }
});

// Receive message
socket.on('receive_message', function(data) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.textContent = data.message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}); 