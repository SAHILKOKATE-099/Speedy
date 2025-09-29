     document.addEventListener("DOMContentLoaded", () => {
  const paragraphs = [
    // Medium paragraphs
    "Typing is an essential skill in the modern world. Practicing regularly not only increases speed but also improves accuracy. A person who types quickly and correctly can complete tasks faster, communicate more effectively, and reduce mistakes in writing. Consistent practice and concentration are key to mastering typing, and gradually, even complex paragraphs can be typed effortlessly.",
    "Haathi, the majestic elephant, is renowned for its remarkable intelligence and memory. Elephants are capable of recognizing their companions, recalling water sources over long distances, and even showing empathy towards other creatures. Observing elephants in their natural habitat reveals their complex social structures, strong bonds within family groups, and their ability to solve problems using logic and cooperation.",
    "In the digital era, learning to type efficiently has become more important than ever. Students, professionals, and content creators depend on typing for writing reports, coding, sending emails, and managing social media. Developing the skill of touch typing, where one types without looking at the keyboard, saves significant time and allows the mind to focus entirely on ideas and composition rather than searching for keys.",
    "Technology has transformed communication, making it faster and more accessible. From emails to instant messaging, typing forms the backbone of modern interactions. Learning proper typing techniques can prevent repetitive strain injuries, improve ergonomics, and enhance overall productivity. Typing courses and online tools provide structured practice, gradually increasing both speed and accuracy, which are essential for professional growth.",
    "The journey of mastering typing is similar to learning a musical instrument. Initially, progress may be slow, and mistakes are frequent. However, with patience, practice, and determination, typing can become a seamless extension of thought. Over time, individuals develop muscle memory, allowing them to type complex sentences and lengthy paragraphs with minimal errors, turning typing into a fast, efficient, and enjoyable skill.",

    // Small paragraphs (2–3 lines)
    "Typing is like riding a bicycle. At first, it feels awkward, but soon your fingers move without thinking. Practice makes it second nature.",
    "A fast typist saves time on every task. Speed and accuracy together make you more efficient at school, work, and even gaming.",
    "Good posture while typing prevents strain. Sit upright, keep wrists straight, and let your fingers glide across the keys with ease.",
    "Short typing sessions every day are better than one long session once in a while. Consistency builds speed and accuracy over time.",
    "Typing without looking at the keyboard is called touch typing. It helps you stay focused on ideas instead of searching for letters."
  ];

  const textDisplay = document.getElementById("text-display");
  const textInput = document.getElementById("text-input");
  const timerEl = document.getElementById("timer");
  const speedEl = document.getElementById("speed");
  const accuracyEl = document.getElementById("accuracy");
  const modal = document.getElementById("result-modal");
  const modalMessage = document.getElementById("modal-message");
  const closeModal = document.getElementById("close-modal");
  const restartBtn = document.getElementById("restart-btn");

  let timer;
  let timeLimit = 120; // 2 minutes
  let timeLeft;
  let currentParagraph = "";
  let startTime;
  let isTestRunning = false;

  function loadParagraph() {
    currentParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    textDisplay.innerHTML = "";
    currentParagraph.split("").forEach(char => {
      const span = document.createElement("span");
      span.innerText = char;
      textDisplay.appendChild(span);
    });
    textInput.value = "";
  }

  function startTest() {
    loadParagraph();
    textInput.disabled = false;
    textInput.focus();
    timeLeft = timeLimit;
    timerEl.innerText = timeLeft;
    startTime = null;
    isTestRunning = true;

    timer = setInterval(() => {
      timeLeft--;
      timerEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        finishTest();
      }
    }, 1000);
  }

  function finishTest() {
    clearInterval(timer);
    isTestRunning = false;
    textInput.disabled = true;

    const typedText = textInput.value.trim();
    const correctChars = currentParagraph.split("").filter((ch, i) => typedText[i] === ch).length;
    const accuracy = Math.round((correctChars / currentParagraph.length) * 100);

    const timeTaken = (timeLimit - timeLeft) / 60; // in minutes
    const wordsTyped = typedText.split(" ").length;
    const speed = Math.round(wordsTyped / timeTaken) || 0;

    accuracyEl.innerText = accuracy + "%";
    speedEl.innerText = speed + " WPM";

    let performance = "";
    if (accuracy > 90 && speed > 40) {
      performance = "Excellent! 🚀";
    } else if (accuracy > 70 && speed > 25) {
      performance = "Good Job 👍";
    } else {
      performance = "Keep Practicing 💪";
    }

    modalMessage.innerText = `Speed: ${speed} WPM\nAccuracy: ${accuracy}%\nPerformance: ${performance}`;
    modal.style.display = "block";
  }

  textInput.addEventListener("input", () => {
    const arrayText = textDisplay.querySelectorAll("span");
    const arrayValue = textInput.value.split("");

    let correct = true;
    arrayText.forEach((char, index) => {
      const typedChar = arrayValue[index];
      if (typedChar == null) {
        char.classList.remove("correct", "incorrect");
        correct = false;
      } else if (typedChar === char.innerText) {
        char.classList.add("correct");
        char.classList.remove("incorrect");
      } else {
        char.classList.add("incorrect");
        char.classList.remove("correct");
        correct = false;
      }
    });

    if (correct && arrayValue.length === currentParagraph.length) {
      finishTest();
    }
  });

  restartBtn.addEventListener("click", () => {
    modal.style.display = "none";
    startTest();
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Prevent copy/paste/selection on paragraph
  textDisplay.addEventListener("contextmenu", (e) => e.preventDefault());
  textDisplay.addEventListener("copy", (e) => e.preventDefault());
  textDisplay.addEventListener("cut", (e) => e.preventDefault());
  textDisplay.style.userSelect = "none";

  // Start test when page loads
  startTest();
});

