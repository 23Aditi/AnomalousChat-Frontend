// // js/chat.js

// document.addEventListener('DOMContentLoaded', () => {
//     // Elements
//     const chatBox = document.getElementById('chatBox');
//     const messageInput = document.getElementById('messageInput');
//     const sendBtn = document.getElementById('sendBtn');
//     const displaySessionId = document.getElementById('displaySessionId');
//     const countdownTimer = document.getElementById('countdownTimer');
//     const terminateBtn = document.getElementById('terminateBtn');
//     const leaveBtn = document.getElementById('leaveBtn');
//     const connStatus = document.getElementById('connStatus');
//     const soundToggleBtn = document.getElementById('soundToggleBtn'); // New Button

//     // Retrieve Data
//     const sessionId = localStorage.getItem('sessionId');
//     const userId = localStorage.getItem('userId');
//     const password = localStorage.getItem('password');
//     const expiresAt = localStorage.getItem('expiresAt');

//     // Sound Configuration
//     let isSoundEnabled = true;
//     // Base64 encoded short "pop" sound (royalty-free)
//     const popSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNbrGcAAAAAAD/+1DEAAAFoANoAAAAACKgA1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMQeAAi0A2gAAAAAAACAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+1DEQAAAAAH/AAAAAAAANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==');

//     // Validation
//     if (!sessionId || !userId || !password) {
//         alert("Session credentials not found. Please login again.");
//         window.location.href = 'login.html';
//         return;
//     }

//     displaySessionId.textContent = sessionId;

//     // 1. Initialize Socket.io
//     const socket = io(CONFIG.BASE_URL);

//     // Helper: Update Connection Status
//     function setConnectionStatus(connected) {
//         if(connected) {
//             connStatus.classList.add('connected');
//             connStatus.querySelector('.text').textContent = 'Secure';
//         } else {
//             connStatus.classList.remove('connected');
//             connStatus.querySelector('.text').textContent = 'Reconnecting...';
//         }
//     }

//     // 2. Connection & Join
//     socket.on('connect', () => {
//         console.log('Connected to server');
//         setConnectionStatus(true);
        
//         socket.emit('joinSession', { sessionId, userId, password }, (response) => {
//             if (response.error) {
//                 alert(`Error: ${response.error}`);
//                 clearLocalStorage();
//                 window.location.href = 'login.html';
//             } else {
//                 chatBox.innerHTML = ''; 
//                 appendSystemMessage("Connection established. You are now anonymous.");
                
//                 if (response.messages && response.messages.length > 0) {
//                     response.messages.forEach(msg => {
//                         appendMessage(msg.text, msg.userId === userId);
//                     });
//                 }
//             }
//         });
//     });

//     // 3. Send Message
//     sendBtn.addEventListener('click', sendMessage);
//     messageInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') sendMessage();
//     });

//     function sendMessage() {
//         const text = messageInput.value.trim();
//         if (text) {
//             socket.emit('sendMessage', { text });
//             messageInput.value = '';
//         }
//     }

//     // 4. Receive Message (Updated with Sound)
//     socket.on('receiveMessage', (message) => {
//         const isMe = message.userId === userId;
//         appendMessage(message.text, isMe);

//         // Play sound only if it's NOT me and sound is enabled
//         if (!isMe && isSoundEnabled) {
//             playNotificationSound();
//         }
//     });

//     // 5. Sound Toggle Logic
//     soundToggleBtn.addEventListener('click', () => {
//         isSoundEnabled = !isSoundEnabled;
//         const icon = soundToggleBtn.querySelector('i');
        
//         if (isSoundEnabled) {
//             soundToggleBtn.classList.add('active');
//             icon.className = 'fas fa-bell';
//             soundToggleBtn.title = "Sound On";
//         } else {
//             soundToggleBtn.classList.remove('active');
//             icon.className = 'fas fa-bell-slash'; // Icon changes to slashed bell
//             soundToggleBtn.title = "Sound Off";
//         }
//     });

//     function playNotificationSound() {
//         // Reset time to 0 allows rapid repeated playback
//         popSound.currentTime = 0; 
//         popSound.play().catch(e => console.log("Audio play failed (browser interaction policy):", e));
//     }

//     // 6. Terminate Session
//     terminateBtn.addEventListener('click', () => {
//         if (confirm("Are you sure? This will end the session for both users immediately.")) {
//             socket.emit('terminateSession');
//         }
//     });

//     socket.on('sessionTerminated', (data) => {
//         appendSystemMessage("Session terminated by peer.");
//         setTimeout(() => {
//             alert(data.message || "Session has been terminated.");
//             clearLocalStorage();
//             window.location.href = 'login.html';
//         }, 500);
//     });

//     // 7. Leave Session
//     leaveBtn.addEventListener('click', () => {
//         if (confirm("Are you sure? You will be disconnected from the session.")) {
//             setUIEnabled(false);
//             appendSystemMessage("Disconnecting...");
//             socket.emit('leaveSession');
//         }
//     });

//     socket.on('leaveSessionSuccess', (data) => {
//         alert(data.message || "Session has been left.");
//         clearLocalStorage();
//         window.location.href = 'login.html';
//     });

//     socket.on('userLeft', (data) => {
//         appendSystemMessage(data.message);
//     });

//     // 8. Handle Disconnects
//     socket.on('disconnect', () => {
//         setConnectionStatus(false);
//         appendSystemMessage("Connection lost. Reconnecting...");
//     });

//     // 9. Countdown Timer
//     function updateTimer() {
//         const now = new Date();
//         const expiry = new Date(expiresAt);
//         const diff = expiry - now;

//         if (diff <= 0) {
//             countdownTimer.textContent = "Expired";
//             alert("Session has expired.");
//             clearLocalStorage();
//             window.location.href = 'login.html';
//             return;
//         }

//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((diff % (1000 * 60)) / 1000);

//         countdownTimer.textContent = 
//             `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//     }
//     setInterval(updateTimer, 1000);
//     updateTimer();

//     // Helpers
//     function appendMessage(text, isMe) {
//         const msgDiv = document.createElement('div');
//         msgDiv.className = `message ${isMe ? 'you' : 'stranger'}`;
        
//         const bubble = document.createElement('div');
//         bubble.className = 'message-bubble';
//         bubble.textContent = text;

//         const meta = document.createElement('div');
//         meta.className = 'message-meta';
        
//         if(isMe) {
//             meta.innerHTML = '<i class="fas fa-check-double"></i> You';
//         } else {
//             meta.innerHTML = '<i class="fas fa-user-secret"></i> Stranger';
//         }

//         msgDiv.appendChild(bubble);
//         msgDiv.appendChild(meta);
//         chatBox.appendChild(msgDiv);

//         chatBox.scrollTo({
//             top: chatBox.scrollHeight,
//             behavior: 'smooth'
//         });
//     }

//     function appendSystemMessage(text) {
//         const div = document.createElement('div');
//         div.className = 'system-message';
//         div.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
//         chatBox.appendChild(div);
//         chatBox.scrollTop = chatBox.scrollHeight;
//     }

//     function setUIEnabled(enabled) {
//         messageInput.disabled = !enabled;
//         sendBtn.disabled = !enabled;
//         leaveBtn.disabled = !enabled;
//         terminateBtn.disabled = !enabled;
//     }

//     function clearLocalStorage() {
//         localStorage.removeItem('sessionId');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('password');
//         localStorage.removeItem('expiresAt');
//     }
// });

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
    const connStatus = document.getElementById('connStatus');
    const soundToggleBtn = document.getElementById('soundToggleBtn'); // New Button

    // Retrieve Data
    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');
    const password = localStorage.getItem('password');
    const expiresAt = localStorage.getItem('expiresAt');

    // Sound Configuration
    let isSoundEnabled = true;

    // Web Audio API context (created lazily on first user interaction)
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playNotificationSound() {
        try {
            const ctx = getAudioContext();

            // Oscillator 1: high-pitched pop
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);          // A5
            osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // A4
            gain1.gain.setValueAtTime(0.4, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);

            // Oscillator 2: soft lower note for warmth
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.05);  // E5
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc2.start(ctx.currentTime + 0.05);
            osc2.stop(ctx.currentTime + 0.25);

        } catch (e) {
            console.log("Audio play failed:", e);
        }
    }

    // Unlock AudioContext on first user interaction
    document.addEventListener('click', () => getAudioContext(), { once: true });
    document.addEventListener('keydown', () => getAudioContext(), { once: true });

    // Validation
    if (!sessionId || !userId || !password) {
        alert("Session credentials not found. Please login again.");
        window.location.href = 'login.html';
        return;
    }

    displaySessionId.textContent = sessionId;

    // 1. Initialize Socket.io
    const socket = io(CONFIG.BASE_URL);

    // Helper: Update Connection Status
    function setConnectionStatus(connected) {
        if(connected) {
            connStatus.classList.add('connected');
            connStatus.querySelector('.text').textContent = 'Secure';
        } else {
            connStatus.classList.remove('connected');
            connStatus.querySelector('.text').textContent = 'Reconnecting...';
        }
    }

    // 2. Connection & Join
    socket.on('connect', () => {
        console.log('Connected to server');
        setConnectionStatus(true);
        
        socket.emit('joinSession', { sessionId, userId, password }, (response) => {
            if (response.error) {
                alert(`Error: ${response.error}`);
                clearLocalStorage();
                window.location.href = 'login.html';
            } else {
                chatBox.innerHTML = ''; 
                appendSystemMessage("Connection established. You are now anonymous.");
                
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

    // 4. Receive Message (Updated with Sound)
    socket.on('receiveMessage', (message) => {
        const isMe = message.userId === userId;
        appendMessage(message.text, isMe);

        // Play sound only if it's NOT me and sound is enabled
        if (!isMe && isSoundEnabled) {
            playNotificationSound();
        }
    });

    // 5. Sound Toggle Logic
    soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        const icon = soundToggleBtn.querySelector('i');
        
        if (isSoundEnabled) {
            soundToggleBtn.classList.add('active');
            icon.className = 'fas fa-bell';
            soundToggleBtn.title = "Sound On";
        } else {
            soundToggleBtn.classList.remove('active');
            icon.className = 'fas fa-bell-slash'; // Icon changes to slashed bell
            soundToggleBtn.title = "Sound Off";
        }
    });



    // 6. Terminate Session
    terminateBtn.addEventListener('click', () => {
        if (confirm("Are you sure? This will end the session for both users immediately.")) {
            socket.emit('terminateSession');
        }
    });

    socket.on('sessionTerminated', (data) => {
        appendSystemMessage("Session terminated by peer.");
        setTimeout(() => {
            alert(data.message || "Session has been terminated.");
            clearLocalStorage();
            window.location.href = 'login.html';
        }, 500);
    });

    // 7. Leave Session
    leaveBtn.addEventListener('click', () => {
        if (confirm("Are you sure? You will be disconnected from the session.")) {
            setUIEnabled(false);
            appendSystemMessage("Disconnecting...");
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

    // 8. Handle Disconnects
    socket.on('disconnect', () => {
        setConnectionStatus(false);
        appendSystemMessage("Connection lost. Reconnecting...");
    });

    // 9. Countdown Timer
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

        countdownTimer.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    setInterval(updateTimer, 1000);
    updateTimer();

    // Helpers
    function appendMessage(text, isMe) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isMe ? 'you' : 'stranger'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        
        if(isMe) {
            meta.innerHTML = '<i class="fas fa-check-double"></i> You';
        } else {
            meta.innerHTML = '<i class="fas fa-user-secret"></i> Stranger';
        }

        msgDiv.appendChild(bubble);
        msgDiv.appendChild(meta);
        chatBox.appendChild(msgDiv);

        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }

    function appendSystemMessage(text) {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function setUIEnabled(enabled) {
        messageInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        leaveBtn.disabled = !enabled;
        terminateBtn.disabled = !enabled;
    }

    function clearLocalStorage() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userId');
        localStorage.removeItem('password');
        localStorage.removeItem('expiresAt');
    }
});