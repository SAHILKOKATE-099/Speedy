     document.addEventListener('DOMContentLoaded', () => {

const TEST_DURATION = 120; // 2 minutes
const textSamples = [
  // Medium paragraphs
  "Consistent practice and concentration are key to mastering typing and gradually even complex paragraphs can be typed effortlessly",
  "Haathi the majestic elephant is renowned for its  habitat reveals their complex social structures strong bonds within family groups and their ability to solve problems using logic and cooperation",
  "In the digital era learning to type efficiently has become more important than ever Students pr where one types on ideas and composition rather than searching for keys",
  "Making it faster and enhance overall productivity Typing courses and online tools provide structured practice gradually increasing both speed and accuracy which are essential for professional growth",
  "typing can become a seamless extension of thought Over time individuals develop muscle memory allowing them to type complex sentences and lengthy paragraphs with minefficient and enjoyable skill",

  // Small paragraphs
  "Typing is like riding a bicycle At first it feels awkward, but soon your fingers move without thinking Practice makes it second nature",
  "A fast typist saves time on every task Speed and accuracy together make you more efficient at schoolwork and even gaming",
  "Good posture while typing prevents strain Sit upright keep wrists straight and let your fingers glide across the keys with ease",
  "Short typing sessions every day are better than one long session once in a while Consistency builds speed and accuracy over time",
  "Typing without looking at the keyboard is called touch typing It helps you stay focused on ideas instead of searching for letters"
];

const textEl = document.getElementById('text-to-type');
const inputText = document.getElementById('input-text');
const speedEl = document.getElementById('speed');
const accuracyEl = document.getElementById('accuracy');
const mistakesEl = document.getElementById('mistakes');
const timeLeftEl = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const playerNameEl = document.getElementById('player-name');
const modal = document.getElementById('result-modal');
const modalMessage = document.getElementById('modal-message');
const closeModal = document.getElementById('close-modal');
const restartBtn = document.getElementById('restart-btn');

let timerRunning = false;
let timeLeft = TEST_DURATION;
let interval = null;
let currentText = "";

// Player Name
const savedUser = localStorage.getItem('speedyUser');
if (!savedUser) window.location.href = 'index.html';
playerNameEl.textContent = `Player: ${savedUser}`;

// Helper Functions
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function pickRandomText() {
  return textSamples[Math.floor(Math.random() * textSamples.length)];
}

function displayText(text) {
  textEl.innerHTML = '';
  for (const ch of text) {
    const span = document.createElement('span');
    span.textContent = ch;
    textEl.appendChild(span);
  }
}

function startTest() {
  clearInterval(interval);
  startBtn.disabled = true;
  startBtn.textContent = 'Running...';

  currentText = pickRandomText();
  displayText(currentText);

  inputText.value = '';
  inputText.disabled = false;
  inputText.focus();

  timerRunning = true;
  timeLeft = TEST_DURATION;
  timeLeftEl.textContent = formatTime(timeLeft);
  speedEl.textContent = 0;
  accuracyEl.textContent = 0;
  mistakesEl.textContent = 0;

  interval = setInterval(tick,1000);
}

function tick() {
  timeLeft--;
  if (timeLeft < 0) timeLeft = 0;
  timeLeftEl.textContent = formatTime(timeLeft);
  if (timeLeft <= 20) timeLeftEl.style.color = '#ff0';
  if (timeLeft <= 10) timeLeftEl.style.color = '#f00';
  if (timeLeft <=0) finalizeTest(false);
}

function calculateStats() {
  if(!timerRunning) return;
  const typed = inputText.value;
  const spans = textEl.querySelectorAll('span');

  let correctChars = 0;
  spans.forEach((span,i)=>{
    const c = typed[i];
    if(c == null){
      span.classList.remove('correct','incorrect');
    } else if(c === span.textContent){
      span.classList.add('correct');
      span.classList.remove('incorrect');
      correctChars++;
    } else {
      span.classList.add('incorrect');
      span.classList.remove('correct');
    }
  });

  const typedChars = typed.length;
  const mistakes = typedChars - correctChars;
  const elapsedSeconds = Math.max(TEST_DURATION - timeLeft,1);
  const elapsedMinutes = elapsedSeconds / 60;
  const wordsTyped = typed.split(/\s+/).filter(w=>w.length>0).length;
  const wpm = Math.round(wordsTyped / elapsedMinutes);
  const accuracy = typedChars>0 ? Math.round((correctChars/typedChars)*100) : 0;

  speedEl.textContent = wpm;
  accuracyEl.textContent = accuracy;
  mistakesEl.textContent = mistakes;

  if(typed.length >= currentText.length) finalizeTest(true);
}

function finalizeTest(completed){
  clearInterval(interval);
  timerRunning = false;
  inputText.disabled = true;
  startBtn.disabled = false;
  startBtn.textContent = 'Start Test';

  const typed = inputText.value;
  const typedChars = typed.length;
  let correctChars = 0;
  for(let i=0;i<typedChars;i++){
    if(typed[i]===currentText[i]) correctChars++;
  }
  const mistakes = typedChars - correctChars;
  const elapsedSeconds = Math.max(TEST_DURATION - timeLeft,1);
  const elapsedMinutes = elapsedSeconds/60;
  const wordsTyped = typed.split(/\s+/).filter(w=>w.length>0).length;
  const wpm = Math.round(wordsTyped / elapsedMinutes);
  const accuracy = typedChars>0 ? Math.round((correctChars/typedChars)*100) : 0;
  const points = Math.max(0, Math.round((wpm*2)+accuracy-elapsedSeconds));

  modalMessage.innerText = `${completed ? 'Test Completed!' : "Time's up!"}\n\nSpeed: ${wpm} WPM\nAccuracy: ${accuracy}%\nMistakes: ${mistakes}\nPoints: ${points}`;
  modal.style.display = 'block';

  if(completed){
    const leaderboard = JSON.parse(localStorage.getItem('speedyLeaderboard')||'[]');
    leaderboard.push({name: savedUser,wpm,accuracy,mistakes,time:elapsedSeconds,points,date:new Date().toISOString()});
    localStorage.setItem('speedyLeaderboard',JSON.stringify(leaderboard));
  }
}

// Event Listeners
inputText.addEventListener('input',calculateStats);
startBtn.addEventListener('click',()=>{if(!timerRunning) startTest();});
quitBtn.addEventListener('click',()=>{
  if(timerRunning && !confirm("Quit test? Progress won't be saved.")) return;
  clearInterval(interval);
  timerRunning = false;
  inputText.disabled = true;
  startBtn.disabled = false;
  startBtn.textContent = 'Start Test';
  window.location.href='index.html';
});
closeModal.addEventListener('click',()=>{modal.style.display='none';});
restartBtn.addEventListener('click',()=>{modal.style.display='none'; startTest();});
window.onclick = function(event){if(event.target==modal) modal.style.display='none';};

timeLeftEl.textContent = formatTime(TEST_DURATION);
speedEl.textContent = 0;
accuracyEl.textContent = 0;
mistakesEl.textContent = 0;
});


