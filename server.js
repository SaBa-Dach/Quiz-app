const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const quizzes = [
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
    question: "What is the function of the `<form>` tag in HTML?",
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

let users = {};
let stats = quizzes.map(() => ({}));

app.post('/start', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (!users[name]) {
    users[name] = Array(quizzes.length).fill(null);
  }

  res.json({ message: 'Quiz started.', totalQuestions: quizzes.length });
});

app.get('/quiz/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= quizzes.length) {
    return res.status(404).json({ error: 'Invalid question index.' });
  }

  const { id, question, choices } = quizzes[index];
  res.json({ id, index, question, choices });
});

app.post('/answer', (req, res) => {
  const { name, questionIndex, answerIndex } = req.body;

  if (!name || users[name] === undefined) {
    return res.status(400).json({ error: 'User not found.' });
  }

  if (
    typeof questionIndex !== 'number' ||
    typeof answerIndex !== 'number' ||
    !quizzes[questionIndex] ||
    !quizzes[questionIndex].choices[answerIndex]
  ) {
    return res.status(400).json({ error: 'Invalid question or answer.' });
  }

  users[name][questionIndex] = answerIndex;
  stats[questionIndex][answerIndex] = (stats[questionIndex][answerIndex] || 0) + 1;

  res.json({ message: 'Answer recorded.' });
});

app.get('/results/:name', (req, res) => {
  const name = req.params.name;
  if (!users[name]) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const userAnswers = users[name].map((answerIndex, i) => ({
    question: quizzes[i].question,
    selectedAnswer: answerIndex !== null ? quizzes[i].choices[answerIndex] : null
  }));

  const globalStats = stats.map((questionStats, i) => {
    const mostChosen = Object.entries(questionStats).reduce((a, b) => (a[1] > b[1] ? a : b), [null, 0])[0];
    return {
      question: quizzes[i].question,
      mostSelectedAnswer: mostChosen !== null ? quizzes[i].choices[mostChosen] : null
    };
  });

  res.json({
    user: name,
    yourAnswers: userAnswers,
    mostChosenPerQuestion: globalStats
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});