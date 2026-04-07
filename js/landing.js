// js/landing.js

document.addEventListener('DOMContentLoaded', () => {
    const expirySelect = document.getElementById('expiry');
    const createForm = document.getElementById('createSessionForm');
    const modal = document.getElementById('sessionModal');
    const sessionIdDisplay = document.getElementById('generatedSessionId');
    const copyBtn = document.getElementById('copyBtn');

    // 1. Populate Expiry Dropdown (1 to 24 hours)
    for (let i = 1; i <= 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} Hour${i > 1 ? 's' : ''}`;
        expirySelect.appendChild(option);
    }

    // 2. Handle Form Submission
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expiryHours = expirySelect.value;
        const password = document.getElementById('password').value;

        // Basic Frontend Validation
        if (!password) {
            alert("Please enter a password.");
            return;
        }

        try {
            // Send POST request to backend
            const response = await fetch(`${CONFIG.BASE_URL}/api/session/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, expiryHours })
            });

            const data = await response.json();

            if (data.success) {
                // Show the Modal with the Session ID
                sessionIdDisplay.textContent = data.sessionId;
                modal.classList.add('active');
            } else {
                // Display error message from backend
                alert(`Error: ${data.error || 'Failed to create session'}`);
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Could not connect to the server. Please check if the backend is running.');
        }
    });

    // 3. Copy Button Logic
    copyBtn.addEventListener('click', () => {
        const textToCopy = sessionIdDisplay.textContent;
        
        // Use the Clipboard API
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            copyBtn.style.backgroundColor = "#00ff9d"; // Green success color
            copyBtn.style.color = "#000";

            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = ""; // Reset to CSS default
                copyBtn.style.color = "";
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy. Please copy the ID manually.");
        });
    });
});