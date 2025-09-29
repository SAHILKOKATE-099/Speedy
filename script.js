     // script.js - final version: alignment, modal, copy-blocking, 10 paragraphs
document.addEventListener('DOMContentLoaded', () => {
  const TEST_DURATION = 120; // seconds

  const textSamples = [
    // 5 medium/long
    "Typing is an essential skill in the modern world. Practicing regularly not only increases speed but also improves accuracy. A person who types quickly and correctly can complete tasks faster, communicate more effectively, and reduce mistakes in writing. Consistent practice and concentration are key to mastering typing, and gradually, even complex paragraphs can be typed effortlessly.",
    "Haathi, the majestic elephant, is renowned for its remarkable intelligence and memory. Elephants are capable of recognizing their companions, recalling water sources over long distances, and even showing empathy towards other creatures. Observing elephants in their natural habitat reveals their complex social structures, strong bonds within family groups, and their ability to solve problems using logic and cooperation.",
    "In the digital era, learning to type efficiently has become more important than ever. Students, professionals, and content creators depend on typing for writing reports, coding, sending emails, and managing social media. Developing the skill of touch typing, where one types without looking at the keyboard, saves significant time and allows the mind to focus entirely on ideas and composition rather than searching for keys.",
    "Technology has transformed communication, making it faster and more accessible. From emails to instant messaging, typing forms the backbone of modern interactions. Learning proper typing techniques can prevent repetitive strain injuries, improve ergonomics, and enhance overall productivity. Typing courses and online tools provide structured practice, gradually increasing both speed and accuracy, which are essential for professional growth.",
    "The journey of mastering typing is similar to learning a musical instrument. Initially, progress may be slow, and mistakes are frequent. However, with patience, practice, and determination, typing can become a seamless extension of thought. Over time, individuals develop muscle memory, allowing them to type complex sentences and lengthy paragraphs with minimal errors, turning typing into a fast, efficient, and enjoyable skill.",
    // 5 small (2-3 lines)
    "Typing is like riding a bicycle. At first, it feels awkward, but soon your fingers move without thinking. Practice makes it second nature.",
    "A fast typist saves time on every task. Speed and accuracy together make you more efficient at school, work, and even gaming.",
    "Good posture while typing prevents strain. Sit upright, keep wrists straight, and let your fingers glide across the keys with ease.",
    "Short typing sessions every day are better than one long session once in a while. Consistency builds speed and accuracy over time.",
    "Typing without looking at the keyboard is called touch typing. It helps you stay focused on ideas instead of searching for letters."
  ];

  // DOM elements (IDs must match your HTML)
  const textEl = document.getElementById('text-to-type');
  const inputEl = document.getElementById('input-text');
  const timeLeftEl = document.getElementById('time-left');
  const speedEl = document.getElementById('speed');
  const accuracyEl = document.getElementById('accuracy');
  const mistakesEl = document.getElementById('mistakes');
  const startBtn = document.getElementById('start-btn');
  const quitBtn = document.getElementById('quit-btn');
  const playerNameEl = document.getElementById('player-name');

  // modal elements (optional but recommended in your test.html)
  const modal = document.getElementById('result-modal');
  const modalMessage = document.getElementById('modal-message');
  const closeModal = document.getElementById('close-modal');
  const restartBtn = document.getElementById('restart-btn');

  if (!textEl || !inputEl || !timeLeftEl || !startBtn) {
    console.error('Missing required elements. Make sure IDs match test.html');
    return;
  }

  // Player check
  const savedUser = localStorage.getItem('speedyUser');
  if (!savedUser) {
    // force registration
    window.location.href = 'index.html';
    return;
  }
  if (playerNameEl) playerNameEl.textContent = `Player: ${savedUser}`;

  // State
  let currentText = '';
  let timerId = null;
  let timerRunning = false;
  let startTime = null; // timestamp in ms

  // ---------- Levenshtein alignment (DP) ----------
  // Align target (currentText) and typed using DP to identify matches/subst/ins/del
  function alignStrings(target, typed) {
    const n = target.length, m = typed.length;
    const dp = Array.from({length: n+1}, () => new Array(m+1).fill(0));
    for (let i=0;i<=n;i++) dp[i][0] = i;
    for (let j=0;j<=m;j++) dp[0][j] = j;

    for (let i=1;i<=n;i++){
      for (let j=1;j<=m;j++){
        const sub = dp[i-1][j-1] + (target[i-1] === typed[j-1] ? 0 : 1);
        const del = dp[i-1][j] + 1;
        const ins = dp[i][j-1] + 1;
        dp[i][j] = Math.min(sub, del, ins);
      }
    }

    // backtrace
    let i = n, j = m;
    const ops = [];
    while (i>0 || j>0) {
      if (i>0 && j>0 && dp[i][j] === dp[i-1][j-1] + (target[i-1] === typed[j-1] ? 0 : 1)) {
        ops.push({op: target[i-1] === typed[j-1] ? 'match' : 'subst', ti: j-1, si: i-1});
        i--; j--;
      } else if (j>0 && dp[i][j] === dp[i][j-1] + 1) {
        ops.push({op: 'ins', ti: j-1});
        j--;
      } else {
        ops.push({op: 'del', si: i-1});
        i--;
      }
    }
    ops.reverse();

    const targetStatus = new Array(n).fill(null); // true = correct, false = incorrect, null = not typed
    let correctCount = 0;
    let typedCount = m;

    for (const op of ops) {
      if (op.op === 'match') {
        targetStatus[op.si] = true;
        correctCount++;
      } else if (op.op === 'subst') {
        targetStatus[op.si] = false;
      } else if (op.op === 'ins') {
        // typed extra char — we don't mark target but counted in typedCount
      } else if (op.op === 'del') {
        // target char not typed => remain null
      }
    }

    return { targetStatus, correctCount, typedCount };
  }

  // ---------- Utilities ----------
  function formatTime(sec) {
    const m = Math.floor(sec/60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function pickText() {
    return textSamples[Math.floor(Math.random() * textSamples.length)];
  }

  function renderText(txt) {
    textEl.innerHTML = '';
    for (const ch of txt) {
      const sp = document.createElement('span');
      sp.textContent = ch;
      textEl.appendChild(sp);
    }
  }

  // ---------- Test control ----------
  function startTest() {
    clearInterval(timerId);
    currentText = pickText();
    renderText(currentText);
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();

    timerRunning = true;
    startTime = Date.now();
    // set time-left (mm:ss)
    timeLeftEl.textContent = formatTime(TEST_DURATION);
    // initialize stats
    speedEl.textContent = '0';
    accuracyEl.textContent = '0';
    mistakesEl.textContent = '0';

    // run second interval to update time-left
    timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(TEST_DURATION - elapsed, 0);
      timeLeftEl.textContent = formatTime(left);
      if (left <= 20) timeLeftEl.style.color = '#ff0';
      if (left <= 10) timeLeftEl.style.color = '#f00';
      if (left <= 0) finalizeTest(false);
    }, 250); // 250ms makes the clock responsive
    startBtn.disabled = true;
    startBtn.textContent = 'Running...';
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // ---------- Stats & highlighting ----------
  function updateStatsAndHighlight() {
    if (!timerRunning) return;
    const typed = inputEl.value;
    const spans = textEl.querySelectorAll('span');
    const alignment = alignStrings(currentText, typed);

    // update spans based on alignment.targetStatus
    for (let i = 0; i < spans.length; i++) {
      const st = alignment.targetStatus[i];
      const span = spans[i];
      if (st === true) {
        span.classList.add('correct');
        span.classList.remove('incorrect');
      } else if (st === false) {
        span.classList.add('incorrect');
        span.classLis
