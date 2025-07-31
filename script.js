const quizData = [
  {
    id: 0,
    question: "What does HTML stand for?",
    choices: [
      "Hyper Text Markup Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
      "Hyper Trainer Marking Language"
    ]
  },
  {
    id: 1,
    question: "What is the purpose of CSS in web development?",
    choices: [
      "To create server logic",
      "To style web pages",
      "To handle databases",
      "To generate HTML"
    ]
  },
  {
    id: 2,
    question: "Which language is primarily used to add interactivity to a webpage?",
    choices: ["Java", "Python", "JavaScript", "PHP"]
  },
  {
    id: 3,
    question: "Which of the following is a JavaScript framework?",
    choices: ["Laravel", "Django", "React", "Flask"]
  },
  {
    id: 4,
    question: "What does a web developer use Git for?",
    choices: [
      "To write HTML",
      "To style a website",
      "To track changes in code",
      "To host videos"
    ]
  },
  {
    id: 5,
    question: "Which of these is a backend technology?",
    choices: ["Node.js", "HTML", "CSS", "Bootstrap"]
  },
  {
    id: 6,
    question: "What is the average salary of a junior web developer in the USA (2024)?",
    choices: [
      "$30,000 - $45,000",
      "$45,000 - $65,000",
      "$65,000 - $85,000",
      "$100,000+"
    ]
  },
  {
    id: 7,
    question: "Which HTML tag is used to create a hyperlink?",
    choices: ["<a>", "<link>", "<url>", "<href>"]
  },
  {
    id: 8,
    question: "What is the function of the <form> tag in HTML?",
    choices: [
      "To structure articles",
      "To embed media",
      "To create input forms",
      "To format text"
    ]
  },
  {
    id: 9,
    question: "Which company developed the React library?",
    choices: ["Google", "Facebook", "Microsoft", "Apple"]
  }
];

async function loadQuiz() {
  try {
    const response = await fetch('/api/quiz/questions');
    if (!response.ok) throw new Error('Failed to load quiz');
    quizData = await response.json();
    renderCurrentQuestion();
  } catch (error) {
    quizContainer.innerHTML = `
      <div class="error">
        Failed to load quiz: ${error.message}
        <button onclick="loadQuiz()">Retry</button>
      </div>
    `;
  }
}

//loadQuiz();
const quizContainer = document.getElementById('quiz-container');
const getStatsBtn = document.getElementById('getStatsBtn');
const statsContainer = document.getElementById('stats-container');


let currentQuestionIndex = 0;
let userAnswers = Array(quizData.length).fill(null);
let quizSubmitted = false;

function renderCurrentQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        showFinalResults();
        return;
    }
    const question = quizData[currentQuestionIndex];
      
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

      if (currentQuestionIndex > 0) {
        document.getElementById('prevBtn').addEventListener('click', () => {
          saveCurrentAnswer();
          currentQuestionIndex--;
          renderCurrentQuestion();
        });
      }

      if (currentQuestionIndex < quizData.length - 1) {
        document.getElementById('nextBtn').addEventListener('click', () => {
          saveCurrentAnswer();
          currentQuestionIndex++;
          renderCurrentQuestion();
        });
      } else {
        document.getElementById('submitBtn').addEventListener('click', submitQuiz);
      }

      document.querySelectorAll(`input[name="question-${question.id}"]`).forEach(radio => {
        radio.addEventListener('change', (e) => {
          userAnswers[currentQuestionIndex] = parseInt(e.target.value);
        });
      });
    }

    function saveCurrentAnswer() {
      const selectedOption = document.querySelector(`input[name="question-${quizData[currentQuestionIndex].id}"]:checked`);
      if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
      }
    }

// Submit the quiz
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

    function showFinalResults() {
      let score = 0;
      const results = [];
      
      quizData.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.answer;
        if (isCorrect) score++;
        
        results.push({
          question: question.question,
          correct: isCorrect,
          userAnswer: userAnswers[index] !== null ? question.choices[userAnswers[index]] : "Not answered",
          correctAnswer: question.choices[question.answer]
        });
      });
      
      quizContainer.innerHTML = `
        <div class="question">
          <h2>Quiz Completed!</h2>
          <p>Your score: ${score} out of ${quizData.length}</p>
          <button id="restartBtn">Restart Quiz</button>
        </div>
      `;
      
      statsContainer.innerHTML = `
        <h2>Detailed Results</h2>
        <div class="results">
          ${results.map((result, i) => `
            <div class="result-item ${result.correct ? 'correct' : 'incorrect'}">
              <p><strong>Question ${i + 1}:</strong> ${result.question}</p>
              <p><strong>Your answer:</strong> ${result.userAnswer}</p>
              ${!result.correct ? `<p><strong>Correct answer:</strong> ${result.correctAnswer}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
      
      document.getElementById('restartBtn').addEventListener('click', restartQuiz);
      statsContainer.style.display = 'block';
    }

    getStatsBtn.addEventListener('click', () => {
      statsContainer.style.display = statsContainer.style.display === 'none' ? 'block' : 'none';
    });

renderCurrentQuestion();