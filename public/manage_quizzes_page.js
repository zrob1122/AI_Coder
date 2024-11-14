document.addEventListener('DOMContentLoaded', async () => {
    await loadQuizzes();
});

// Function to load all quizzes
async function loadQuizzes() {
    const response = await fetch('/quizzes', { credentials: 'include' });
    const quizzes = await response.json();

    const container = document.getElementById('quizzesContainer');
    container.innerHTML = '';

    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'card mb-3';
        quizCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${quiz.title}</h5>
                <p class="card-text">${quiz.description}</p>
                <p class="card-text">Time Limit: ${quiz.time_limit} minutes</p>
                <button class="btn btn-primary" onclick="editQuiz(${quiz.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteQuiz(${quiz.id})">Delete</button>
            </div>
        `;
        container.appendChild(quizCard);
    });
}

// Function to delete a quiz
async function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    const response = await fetch(`/quiz/${quizId}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (response.ok) {
        alert('Quiz deleted successfully');
        await loadQuizzes();
    } else {
        alert('Failed to delete quiz');
    }
}

function editQuiz(quizId) {
    window.location.href = `edit_quiz_page.html?id=${quizId}`;
}
