// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('joinSessionForm');
    const sessionIdInput = document.getElementById('sessionId');
    const passwordInput = document.getElementById('password');

    // 1. Handle Form Submission
    joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const sessionId = sessionIdInput.value.trim(); // Ensure uppercase
        const password = passwordInput.value;

        if (!sessionId || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            // Send POST request to join endpoint
            const response = await fetch(`${CONFIG.BASE_URL}/api/session/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, password })
            });

            const data = await response.json();

            if (data.success) {
                // 2. Save critical data to LocalStorage
                // This allows the user to refresh or reconnect if the internet drops
                localStorage.setItem('sessionId', data.sessionId);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('password', password); // Store raw password for socket reconnection auth
                localStorage.setItem('expiresAt', data.expiresAt);

                // 3. Redirect to Chat Page
                window.location.href = 'chat.html';
            } else {
                // Handle specific errors from backend
                alert(`Error: ${data.error || 'Unable to join session'}`);
            }
        } catch (error) {
            console.error('Error joining session:', error);
            alert('Could not connect to the server. Please check your connection.');
        }
    });
});