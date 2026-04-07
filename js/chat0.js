// js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const chatBox = document.getElementById('chatBox');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const displaySessionId = document.getElementById('displaySessionId');
    const countdownTimer = document.getElementById('countdownTimer');
    const terminateBtn = document.getElementById('terminateBtn');
    const leaveBtn = document.getElementById('leaveBtn');

    // Retrieve Data from LocalStorage
    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');
    const password = localStorage.getItem('password');
    const expiresAt = localStorage.getItem('expiresAt');

    // Validation: Redirect if data missing
    if (!sessionId || !userId || !password) {
        alert("Session credentials not found. Please login again.");
        window.location.href = 'login.html';
        return;
    }

    displaySessionId.textContent = sessionId;

    // 1. Initialize Socket.io
    const socket = io(CONFIG.BASE_URL);

    // 2. Connection & Join Logic
    socket.on('connect', () => {
        console.log('Connected to server');
        
        // Emit join event with credentials
        socket.emit('joinSession', { sessionId, userId, password }, (response) => {
            if (response.error) {
                alert(`Error: ${response.error}`);
                clearLocalStorage();
                window.location.href = 'login.html';
            } else {
                // Clear the "Connecting..." message
                chatBox.innerHTML = '';
                appendSystemMessage("Connected to secure session.");
                
                // Load previous messages if any
                if (response.messages && response.messages.length > 0) {
                    response.messages.forEach(msg => {
                        appendMessage(msg.text, msg.userId === userId);
                    });
                }
            }
        });
    });

    // 3. Send Message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            socket.emit('sendMessage', { text });
            messageInput.value = '';
        }
    }

    // 4. Receive Message
    socket.on('receiveMessage', (message) => {
        const isMe = message.userId === userId;
        appendMessage(message.text, isMe);
    });

    // 5. Terminate Session
    terminateBtn.addEventListener('click', () => {
        if (confirm("Are you sure? This will end the session for both users immediately.")) {
            socket.emit('terminateSession');
        }
    });

    socket.on('sessionTerminated', (data) => {
        alert(data.message || "Session has been terminated.");
        clearLocalStorage();
        window.location.href = 'login.html';
    });

    // 5. Leave Session
    leaveBtn.addEventListener('click', () => {
        if (confirm("Are you sure? This will end the session for you.")) {
            messageInput.disabled = true;
            sendBtn.disabled = true;
            leaveBtn.disabled = true;
            terminateBtn.disabled = true;
            socket.emit('leaveSession');
        }
    });

    socket.on('leaveSessionSuccess', (data) => {
        alert(data.message || "Session has been left.");
        clearLocalStorage();
        window.location.href = 'login.html';
    });

    socket.on('userLeft', (data) => {
        appendSystemMessage(data.message);
    });

    // 6. Handle Disconnects
    socket.on('disconnect', () => {
        appendSystemMessage("Connection lost. Reconnecting...");
    });

    // 7. Countdown Timer
    function updateTimer() {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            countdownTimer.textContent = "Expired";
            alert("Session has expired.");
            clearLocalStorage();
            window.location.href = 'login.html';
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    setInterval(updateTimer, 1000);
    updateTimer();

    // Helper: Append Message to UI
    function appendMessage(text, isMe) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isMe ? 'you' : 'stranger'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = isMe ? 'You' : 'Stranger';

        msgDiv.appendChild(bubble);
        msgDiv.appendChild(meta);
        chatBox.appendChild(msgDiv);

        // Auto scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function appendSystemMessage(text) {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function clearLocalStorage() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userId');
        localStorage.removeItem('password');
        localStorage.removeItem('expiresAt');
    }
});