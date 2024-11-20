document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if the candidate is logged in
        const response = await fetch('/check-candidate-auth', { credentials: 'include' });

        if (!response.ok) {
            // Redirect to login page if not authenticated
            window.location.href = 'candidate_login.html';
            return;
        }

        console.log('Candidate is authenticated');
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = 'candidate_login.html';
    }

    // Handle the quiz key form submission
    const unlockForm = document.getElementById('unlockForm');

    unlockForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const quizKey = document.getElementById('quizKey').value;

        try {
            // Send the quiz key to the backend for validation
            const response = await fetch('/verify-quiz-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizKey }),
                credentials: 'include'
            });

            if (response.ok) {
                const quiz = await response.json();
                alert(`Quiz "${quiz.title}" unlocked successfully!`);
                window.location.href = `take_quiz.html?key=${quizKey}`;
            } else {
                const error = await response.json();
                alert(error.error || 'Invalid quiz key.');
            }
        } catch (error) {
            console.error('Error verifying quiz key:', error);
            alert('An error occurred while verifying the quiz key.');
        }
    });
});
