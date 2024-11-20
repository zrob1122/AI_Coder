document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizKey = urlParams.get('key');

    if (!quizKey) {
        alert('Invalid quiz link.');
        window.location.href = 'candidate_login.html';
        return;
    }

    try {
        // Fetch quiz data
        const response = await fetch(`/take-quiz/${quizKey}`, { credentials: 'include' });

        if (!response.ok) {
            alert('Failed to load quiz. Please try again.');
            window.location.href = 'unlock_quiz.html';
            return;
        }

        const quiz = await response.json();
        populateQuizForm(quiz);
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert('An error occurred while loading the quiz.');
        window.location.href = 'unlock_quiz.html';
    }
});

function populateQuizForm(quiz) {
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizDescription').textContent = quiz.description;

    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ''; // Clear any existing content

    quiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'mb-4';
        questionDiv.innerHTML = `
            <h5>Question ${index + 1}: ${question.text}</h5>
            <div>
                ${question.options.map((option, optionIndex) => `
                    <div class="form-check">
                        <input class="form-check-input" type="${question.type === 'Check-All-That-Apply' ? 'checkbox' : 'radio'}" name="question${index}" id="question${index}_option${optionIndex}" value="${option.text}">
                        <label class="form-check-label" for="question${index}_option${optionIndex}">${option.text}</label>
                    </div>
                `).join('')}
            </div>
        `;
        questionsContainer.appendChild(questionDiv);
    });

    // Add submit event listener
    document.getElementById('quizForm').addEventListener('submit', submitQuiz);
}

async function submitQuiz(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const quizKey = urlParams.get('key');
    const answers = [];

    document.querySelectorAll('#questionsContainer > div').forEach((div, index) => {
        const selectedOptions = Array.from(div.querySelectorAll('input:checked')).map(input => input.value);
        answers.push({ questionIndex: index, selectedOptions });
    });

    try {
        const response = await fetch('/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizKey, answers }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Quiz submitted successfully!');
            window.location.href = 'thank_you.html';
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to submit quiz.');
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('An error occurred while submitting the quiz.');
    }
}
