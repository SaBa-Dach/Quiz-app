const quizContainer = document.getElementById('quiz-container');
const getStatsBtn = document.getElementById('getStatsBtn');
const statsContainer = document.getElementById('stats-container');

let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizSubmitted = false;

async function startQuiz() {
  const userNameInput = document.getElementById('username');
  const userName = userNameInput.value.trim();

  if (!userName) {
    alert("Please enter your name.");
    return;
  }

  try {
  const res = await fetch('/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: userName })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  userAnswers = Array(data.totalQuestions).fill(null);
  currentQuestionIndex = 0;
  quizSubmitted = false;
  await fetchQuestion(currentQuestionIndex);
} catch (err) {
  quizContainer.innerHTML = `<div class="error">Failed to start quiz: ${err.message}</div>`;
}

}

async function fetchQuestion(index) {
  try {
    const res = await fetch(`/quiz/${index}`);
    if (!res.ok) throw new Error("Question not found");

    const question = await res.json();
    quizData[index] = question;
    renderCurrentQuestion();
  } catch (err) {
    quizContainer.innerHTML = `<div class="error">Failed to load question: ${err.message}</div>`;
  }
}

function renderCurrentQuestion() {
  const question = quizData[currentQuestionIndex];

  if (!question) return;

  quizContainer.innerHTML = `
    <div class="question">
      <div class="progress">Question ${currentQuestionIndex + 1} of ${userAnswers.length}</div>
      <h3>${question.question}</h3>
      <div class="choices">
        ${question.choices.map((choice, i) => `
          <div class="choice">
            <input 
              type="radio" 
              name="question-${question.id}" 
              id="q${question.id}-option${i}" 
              value="${i}"
              ${userAnswers[currentQuestionIndex] === i ? 'checked' : ''}
              ${quizSubmitted ? 'disabled' : ''}
            >
            <label for="q${question.id}-option${i}">${choice}</label>
          </div>
        `).join('')}
      </div>
      <div class="navigation">
        <button id="prevBtn" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
        ${currentQuestionIndex < userAnswers.length - 1 ?
          `<button id="nextBtn">Next</button>` :
          `<button id="submitBtn">Submit Quiz</button>`
        }
      </div>
    </div>
  `;

  document.querySelectorAll(`input[name="question-${question.id}"]`).forEach(radio => {
    radio.addEventListener('change', (e) => {
      userAnswers[currentQuestionIndex] = parseInt(e.target.value);
      sendAnswer(currentQuestionIndex, userAnswers[currentQuestionIndex]);
    });
  });

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    currentQuestionIndex--;
    renderCurrentQuestion();
  });

  if (currentQuestionIndex < userAnswers.length - 1) {
    document.getElementById('nextBtn')?.addEventListener('click', async () => {
      currentQuestionIndex++;
      if (!quizData[currentQuestionIndex]) {
        await fetchQuestion(currentQuestionIndex);
      } else {
        renderCurrentQuestion();
      }
    });
  } else {
    document.getElementById('submitBtn')?.addEventListener('click', submitQuiz);
  }
}

async function sendAnswer(index, answerIndex) {
  const name = document.getElementById('username').value.trim();
  await fetch('/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      questionIndex: index,
      answerIndex
    })
  });
}

async function submitQuiz() {
  const name = document.getElementById('username').value.trim();
  if (!name) {
    alert("Please enter your name before submitting.");
    return;
  }

  quizSubmitted = true;

  try {
    const res = await fetch(`/results/${name}`);
    const result = await res.json();
    showFinalResults(result);
  } catch (err) {
    alert("Failed to fetch results.");
  }
}

function showFinalResults(result) {
  quizContainer.innerHTML = `
    <div class="question">
      <h2>Quiz Completed!</h2>
      <p>Your answers have been recorded.</p>
      <button id="restartBtn">Restart Quiz</button>
    </div>
  `;

  statsContainer.innerHTML = `
    <h2>Detailed Results</h2>
    ${result.yourAnswers.map((r, i) => `
      <div class="result-item">
        <p><strong>Q${i + 1}:</strong> ${r.question}</p>
        <p><strong>Your answer:</strong> ${r.selectedAnswer ?? "Not answered"}</p>
        <p><strong>Most chosen:</strong> ${result.mostChosenPerQuestion[i].mostSelectedAnswer ?? "N/A"}</p>
      </div>
    `).join('')}
  `;

  statsContainer.style.display = 'block';
  document.getElementById('restartBtn').addEventListener('click', () => location.reload());
}

getStatsBtn.addEventListener('click', () => {
  statsContainer.style.display = statsContainer.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('username')?.addEventListener('change', startQuiz);