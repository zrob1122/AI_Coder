document.addEventListener('DOMContentLoaded', async () => {
    const quizId = new URLSearchParams(window.location.search).get('id');
    if (!quizId) {
        alert('Quiz ID is missing');
        return;
    }

    try {
        const response = await fetch(`/quiz/${quizId}`, { credentials: 'include' });
        const quiz = await response.json();
        if (!response.ok) throw new Error(quiz.error);

        populateQuizForm(quiz);
    } catch (error) {
        console.error('Failed to load quiz:', error);
        alert('Failed to load quiz data');
    }
});

function populateQuizForm(quiz) {
    document.getElementById('quizTitle').value = quiz.title;
    document.getElementById('quizDescription').value = quiz.description;
    document.getElementById('quizTimeLimit').value = quiz.time_limit;

    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ''; // Clear any existing questions

    quiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card p-3 mb-4';
        questionDiv.innerHTML = `
            <h5>Question ${index + 1}</h5>
            <div class="mb-3">
                <label class="form-label">Question Type</label>
                <select class="form-select" id="questionType${index}" data-index="${index}">
                    <option value="Multiple Choice" ${question.type === 'Multiple Choice' ? 'selected' : ''}>Multiple Choice</option>
                    <option value="Check-All-That-Apply" ${question.type === 'Check-All-That-Apply' ? 'selected' : ''}>Check-All-That-Apply</option>
                    <option value="True/False" ${question.type === 'True/False' ? 'selected' : ''}>True/False</option>
                    <option value="Free-form" ${question.type === 'Free-form' ? 'selected' : ''}>Short Answer</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Question Text</label>
                <input type="text" class="form-control" id="questionText${index}" value="${question.text}" required>
            </div>
            <div class="options-container mb-3" id="optionsContainer${index}">
                <label class="form-label">Options</label>
                <div id="optionsList${index}">
                    ${question.options.map((option, optionIndex) => `
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" id="optionText${index}_${optionIndex}" value="${option.text}" placeholder="Option text">
                            <div class="input-group-text">
                                <input type="checkbox" id="isCorrect${index}_${optionIndex}" ${option.isCorrect ? 'checked' : ''}>
                            </div>
                            <button type="button" class="btn btn-danger" onclick="deleteOption(this)">Delete</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-secondary" onclick="addOption(${index})">Add Option</button>
            </div>
            <button type="button" class="btn btn-danger mt-2" onclick="deleteQuestion(this)">Delete Question</button>
        `;
        questionsContainer.appendChild(questionDiv);
    });
}

document.getElementById('addQuestionButton').addEventListener('click', addQuestion);

function addQuestion() {
    const questionIndex = document.querySelectorAll('.card').length;
    const questionsContainer = document.getElementById('questionsContainer');
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'card p-3 mb-4';
    questionDiv.innerHTML = `
        <h5>Question ${questionIndex + 1}</h5>
        <div class="mb-3">
            <label class="form-label">Question Type</label>
            <select class="form-select" id="questionType${questionIndex}" data-index="${questionIndex}">
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Check-All-That-Apply">Check-All-That-Apply</option>
                <option value="True/False">True/False</option>
                <option value="Free-form">Short Answer</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label">Question Text</label>
            <input type="text" class="form-control" id="questionText${questionIndex}" required>
        </div>
        <div class="options-container mb-3" id="optionsContainer${questionIndex}">
            <label class="form-label">Options</label>
            <div id="optionsList${questionIndex}"></div>
            <button type="button" class="btn btn-secondary" onclick="addOption(${questionIndex})">Add Option</button>
        </div>
        <button type="button" class="btn btn-danger mt-2" onclick="deleteQuestion(this)">Delete Question</button>
    `;
    questionsContainer.appendChild(questionDiv);
}

function addOption(questionIndex) {
    const optionsList = document.getElementById(`optionsList${questionIndex}`);
    const optionIndex = optionsList.children.length;

    const optionDiv = document.createElement('div');
    optionDiv.className = 'input-group mb-2';
    optionDiv.innerHTML = `
        <input type="text" class="form-control" id="optionText${questionIndex}_${optionIndex}" placeholder="Option text">
        <div class="input-group-text">
            <input type="checkbox" id="isCorrect${questionIndex}_${optionIndex}" title="Mark as correct">
        </div>
        <button type="button" class="btn btn-danger" onclick="deleteOption(this)">Delete</button>
    `;
    optionsList.appendChild(optionDiv);
}

function deleteOption(button) {
    const optionDiv = button.parentElement;
    optionDiv.remove();
}

function deleteQuestion(button) {
    const questionDiv = button.closest('.card');
    questionDiv.remove();

    // Update question numbers dynamically
    const remainingQuestions = document.querySelectorAll('.card');
    remainingQuestions.forEach((div, index) => {
        const questionNumber = index + 1;
        div.querySelector('h5').textContent = `Question ${questionNumber}`;
    });
}

document.getElementById('quizForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const quizId = new URLSearchParams(window.location.search).get('id');
    if (!quizId) {
        alert('Quiz ID is missing');
        return;
    }

    const title = document.getElementById('quizTitle').value;
    const description = document.getElementById('quizDescription').value;
    const timeLimit = parseInt(document.getElementById('quizTimeLimit').value);

    const questions = [];
    document.querySelectorAll('.card').forEach((div, index) => {
        const type = div.querySelector(`#questionType${index}`).value;
        const text = div.querySelector(`#questionText${index}`).value;

        const options = [];
        div.querySelectorAll(`#optionsList${index} .input-group`).forEach((optionDiv, optionIndex) => {
            const optionText = optionDiv.querySelector(`#optionText${index}_${optionIndex}`).value;
            const isCorrect = optionDiv.querySelector(`#isCorrect${index}_${optionIndex}`).checked;
            options.push({ text: optionText, isCorrect });
        });

        questions.push({ type, text, options });
    });

    const quizData = { title, description, timeLimit, questions };

    try {
        const response = await fetch(`/quiz/${quizId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Quiz updated successfully!');
            window.location.href = 'manage_quizzes_page.html';
        } else {
            const error = await response.json();
            alert(`Failed to update quiz: ${error.error}`);
        }
    } catch (error) {
        console.error('Error updating quiz:', error);
        alert('An error occurred while updating the quiz.');
    }
});
