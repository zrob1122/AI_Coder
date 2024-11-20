// Candidate Signup Logic
document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('/candidate-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Account created successfully! You can now log in.');
            window.location.reload();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create account.');
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert('An error occurred while creating your account.');
    }
});

// Candidate Login Logic
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/candidate-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Login successful!');
            window.location.href = 'unlock_quiz.html'; // Redirect to Unlock Quiz page
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to log in.');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred while logging in.');
    }
});

