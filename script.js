const params = new URLSearchParams(window.location.search);
const temaId = params.get("tema");
const testId = params.get("test");

const tema = bancoPreguntas.find(t => t.id === temaId);
const test = tema.tests.find(t => t.id === testId);

let basePreguntas = [];

if (test.tipo === "aleatorio") {
  tema.tests.forEach((t) => {
    if (t.preguntas) {
      basePreguntas = basePreguntas.concat(t.preguntas);
    }
  });

  basePreguntas = shuffleArray(basePreguntas).slice(0, test.cantidad);
} else {
  basePreguntas = test.preguntas;
}

let questions = [];
let currentQuestion = 0;

const testTitle = document.getElementById("testTitle");
const progress = document.getElementById("progress");
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const resultSection = document.getElementById("result");
const quizSection = document.getElementById("quiz");
const scoreElement = document.getElementById("score");

testTitle.textContent = `${tema.tema} - ${test.nombre}`;

function shuffleArray(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[randomIndex];
    newArray[randomIndex] = temp;
  }

  return newArray;
}

function prepareQuestions() {
  questions = shuffleArray(basePreguntas).map((question) => {
    const answersWithCorrectInfo = question.answers.map((answer, index) => {
      return {
        text: answer,
        isCorrect: index === question.correct
      };
    });

    return {
      question: question.question,
      answers: shuffleArray(answersWithCorrectInfo),
      selectedAnswer: null
    };
  });
}

function showQuestion() {
  answersElement.innerHTML = "";

  const q = questions[currentQuestion];

  progress.textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
  questionElement.textContent = q.question;

  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = "Finalizar test";
  } else {
    nextBtn.textContent = "Siguiente";
  }

  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");

    if (q.selectedAnswer === index) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => selectAnswer(index));

    answersElement.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  questions[currentQuestion].selectedAnswer = selectedIndex;

  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((button) => {
    button.classList.remove("selected");
  });

  buttons[selectedIndex].classList.add("selected");
}

nextBtn.addEventListener("click", () => {
  const q = questions[currentQuestion];

  if (q.selectedAnswer === null) {
    alert("Selecciona una respuesta antes de continuar.");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  quizSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  let correctAnswers = 0;

  questions.forEach((q) => {
    const selected = q.answers[q.selectedAnswer];

    if (selected && selected.isCorrect) {
      correctAnswers++;
    }
  });

  scoreElement.innerHTML = `
    Has acertado <strong>${correctAnswers}</strong> de <strong>${questions.length}</strong> preguntas.
  `;

  const reviewContainer = document.createElement("div");
  reviewContainer.classList.add("review-container");

  questions.forEach((q, questionIndex) => {
    const questionCard = document.createElement("div");
    questionCard.classList.add("review-question");

    const title = document.createElement("h3");
    title.textContent = `${questionIndex + 1}. ${q.question}`;
    questionCard.appendChild(title);

    q.answers.forEach((answer, answerIndex) => {
      const answerDiv = document.createElement("div");
      answerDiv.classList.add("review-answer");
      answerDiv.textContent = answer.text;

      const isSelected = q.selectedAnswer === answerIndex;

      if (answer.isCorrect) {
        answerDiv.classList.add("correct");
      }

      if (isSelected && !answer.isCorrect) {
        answerDiv.classList.add("incorrect");
      }

      if (isSelected) {
        answerDiv.textContent = "Tu respuesta: " + answer.text;
      }

      if (answer.isCorrect && !isSelected) {
        answerDiv.textContent = "Respuesta correcta: " + answer.text;
      }

      if (answer.isCorrect && isSelected) {
        answerDiv.textContent = "Correcta: " + answer.text;
      }

      questionCard.appendChild(answerDiv);
    });

    reviewContainer.appendChild(questionCard);
  });

  resultSection.appendChild(reviewContainer);
}

function restartQuiz() {
  currentQuestion = 0;

  const oldReview = document.querySelector(".review-container");
  if (oldReview) {
    oldReview.remove();
  }

  prepareQuestions();

  resultSection.classList.add("hidden");
  quizSection.classList.remove("hidden");

  showQuestion();
}

prepareQuestions();
showQuestion();