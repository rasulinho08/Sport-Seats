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
// Original bookEvent function
function bookEvent(eventId) {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
        showToast(`Redirecting to seat selection...`, "success");
        // Store event data for seat selection page
        localStorage.setItem('selectedEvent', JSON.stringify(event));
        // Redirect to seat selection page
        setTimeout(() => {
            window.location.href = 'seat-selection.html';
        }, 1000);
    }
}
