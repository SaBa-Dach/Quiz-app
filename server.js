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
    ],
    answer: 0
  },
  {
    id: 1,
    question: "What is the purpose of CSS in web development?",
    choices: [
      "To create server logic",
      "To style web pages",
      "To handle databases",
      "To generate HTML"
    ],
    answer: 1
  },
  {
    id: 2,
    question: "Which language is primarily used to add interactivity to a webpage?",
    choices: ["Java", "Python", "JavaScript", "PHP"],
    answer: 2
  },
  {
    id: 3,
    question: "Which of the following is a JavaScript framework?",
    choices: ["Laravel", "Django", "React", "Flask"],
    answer: 2
  },
  {
    id: 4,
    question: "What does a web developer use Git for?",
    choices: [
      "To write HTML",
      "To style a website",
      "To track changes in code",
      "To host videos"
    ],
    answer: 2
  },
  {
    id: 5,
    question: "Which of these is a backend technology?",
    choices: ["Node.js", "HTML", "CSS", "Bootstrap"],
    answer: 0
  },
  {
    id: 6,
    question: "What is the average salary of a junior web developer in the USA (2024)?",
    choices: [
      "$30,000 - $45,000",
      "$45,000 - $65,000",
      "$65,000 - $85,000",
      "$100,000+"
    ],
    answer: 2
  },
  {
    id: 7,
    question: "Which HTML tag is used to create a hyperlink?",
    choices: ["a", "link", "url", "href"],
    answer: 0
  },
  {
    id: 8,
    question: "What is the function of the <form> tag in HTML?",
    choices: [
      "To structure articles", "To embed media", "To create input forms", "To format text"
    ],
    answer: 2
  },
  {
    id: 9,
    question: "Which company developed the React library?",
    choices: ["Google", "Facebook", "Microsoft", "Apple"],
    answer: 1
  }
];

let users = {};
let stats = quizzes.map(() => ({}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/start', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }
  res.json({ totalQuestions: quizzes.length });
});

app.get('/quiz/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= quizzes.length) {
    return res.status(404).json({ error: 'Question not found' });
  }
  const { id, question, choices } = quizzes[index];
  res.json({ id, question, choices });
});

app.post('/answer', (req, res) => {
  const { name, questionIndex, answerIndex } = req.body;
  if (!name || typeof questionIndex !== 'number' || typeof answerIndex !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  if (!users[name]) {
    users[name] = Array(quizzes.length).fill(null);
  }

  users[name][questionIndex] = answerIndex;

  if (!stats[questionIndex][answerIndex]) {
    stats[questionIndex][answerIndex] = 0;
  }
  stats[questionIndex][answerIndex]++;

  res.json({ message: 'Answer recorded' });
});

app.get('/results/:name', (req, res) => {
  const name = req.params.name;
  const answers = users[name];

  if (!answers) {
    return res.status(404).json({ error: 'User not found' });
  }

  const yourAnswers = quizzes.map((q, i) => ({
    question: q.question,
    selectedAnswer: answers[i] !== null ? q.choices[answers[i]] : null
  }));

  const mostChosenPerQuestion = quizzes.map((q, i) => {
    const countMap = stats[i];
    let max = -1;
    let mostSelected = null;
    for (const index in countMap) {
      if (countMap[index] > max) {
        max = countMap[index];
        mostSelected = q.choices[index];
      }
    }
    return { mostSelectedAnswer: mostSelected };
  });

  res.json({ yourAnswers, mostChosenPerQuestion });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
