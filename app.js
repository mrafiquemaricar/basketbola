/**
 * Basketbola - Web & Mobile Basketball Arcade Game Engine
 * Features: 60s Time Attack Challenge vs Endless Mode, On-Canvas Timer Clock,
 * Global Leaderboard & Country Pickers, 2PT & 3PT Shooting Spots, Web Audio.
 */

(function () {
  'use strict';

  // --- Canvas & DOM Setup ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Scoreboard DOM Elements
  const scoreDisplay = document.getElementById('score-display');
  const highScoreDisplay = document.getElementById('high-score-display');
  const streakDisplay = document.getElementById('streak-display');
  const streakContainer = document.getElementById('streak-container');
  const accuracyDisplay = document.getElementById('accuracy-display');
  const shotTypeBadge = document.getElementById('shot-type-badge');
  const shotTypeText = document.getElementById('shot-type-text');
  const shotPointsTag = document.getElementById('shot-points-tag');
  const spotBtnLabel = document.getElementById('spot-btn-label');
  const powerMeterWrapper = document.getElementById('power-meter-wrapper');
  const powerMeterFill = document.getElementById('power-meter-fill');
  const shotResultBanner = document.getElementById('shot-result-banner');
  const resultText = document.getElementById('result-text');
  const angleDisplay = document.getElementById('angle-display');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  // Mode Selector DOM
  const modeEndlessBtn = document.getElementById('mode-endless-btn');
  const modeTimerBtn = document.getElementById('mode-timer-btn');
  const timerStatCard = document.getElementById('timer-stat-card');
  const timerDisplay = document.getElementById('timer-display');

  // Game Over Modal DOM
  const gameOverModal = document.getElementById('game-over-modal');
  const modalScore = document.getElementById('modal-score');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalShots = document.getElementById('modal-shots');
  const modalStreak = document.getElementById('modal-streak');
  const newRecordBadge = document.getElementById('new-record-badge');
  const modalRestartBtn = document.getElementById('modal-restart-btn');

  // Leaderboard DOM Elements
  const openLeaderboardBtn = document.getElementById('open-leaderboard-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const closeLbBtn = document.getElementById('close-lb-btn');
  const lbTabTimer = document.getElementById('lb-tab-timer');
  const lbTabEndless = document.getElementById('lb-tab-endless');
  const lbTableBody = document.getElementById('lb-table-body');
  const lbPlayBtn = document.getElementById('lb-play-btn');

  // Form DOM
  const playerCountryInput = document.getElementById('player-country');
  const playerNicknameInput = document.getElementById('player-nickname');
  const btnSubmitLeaderboard = document.getElementById('btn-submit-leaderboard');

  // Prayer & Hijri DOM Elements
  const hijriDateText = document.getElementById('hijri-date-text');
  const nextPrayerNameEl = document.getElementById('next-prayer-name');
  const nextPrayerTimerEl = document.getElementById('next-prayer-timer');

  const prayerChips = {
    Fajr: document.getElementById('chip-fajr'),
    Sunrise: document.getElementById('chip-sunrise'),
    Dhuhr: document.getElementById('chip-dhuhr'),
    Asr: document.getElementById('chip-asr'),
    Maghrib: document.getElementById('chip-maghrib'),
    Isha: document.getElementById('chip-isha')
  };

  const prayerTimeEls = {
    Fajr: document.getElementById('time-fajr'),
    Sunrise: document.getElementById('time-sunrise'),
    Dhuhr: document.getElementById('time-dhuhr'),
    Asr: document.getElementById('time-asr'),
    Maghrib: document.getElementById('time-maghrib'),
    Isha: document.getElementById('time-isha')
  };

  // On-screen Touch Buttons
  const btnToggleSpot = document.getElementById('btn-toggle-spot');
  const btnAngleDown = document.getElementById('btn-angle-down');
  const btnAngleUp = document.getElementById('btn-angle-up');
  const btnShoot = document.getElementById('btn-shoot');

  // --- Sound Effects Synthesizer (Web Audio API) ---
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function triggerHaptic(ms = 25) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // ignore
      }
    }
  }

  function playBounceSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playRimSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.18);
      osc2.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playSwishSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
      filter.Q.setValueAtTime(3.0, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start();
      whiteNoise.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playCheerSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playBuzzerSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // --- Global Leaderboard Manager ---
  const DEFAULT_LB_TIMER = [
    { country: '🇸🇬', name: '@codelaju', score: 48, accuracy: 92 },
    { country: '🇸🇬', name: 'SG_Hooper', score: 42, accuracy: 85 },
    { country: '🇲🇾', name: 'KL_Shooter', score: 39, accuracy: 81 },
    { country: '🇮🇩', name: 'Jkt_Bucket', score: 35, accuracy: 78 },
    { country: '🇯🇵', name: 'Tokyo_3pt', score: 31, accuracy: 75 }
  ];

  const DEFAULT_LB_ENDLESS = [
    { country: '🇸🇬', name: '@codelaju', score: 120, accuracy: 95 },
    { country: '🇺🇸', name: 'Mamba_24', score: 98, accuracy: 90 },
    { country: '🇲🇾', name: 'Penang_King', score: 84, accuracy: 84 }
  ];

  let currentLbTab = 'timer';
  let lastSubmittedId = null;

  function loadLeaderboard(mode) {
    const key = mode === 'timer' ? 'basketbola_lb_timer' : 'basketbola_lb_endless';
    const defaults = mode === 'timer' ? DEFAULT_LB_TIMER : DEFAULT_LB_ENDLESS;
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaults;
    }
  }

  function saveLeaderboard(mode, list) {
    const key = mode === 'timer' ? 'basketbola_lb_timer' : 'basketbola_lb_endless';
    localStorage.setItem(key, JSON.stringify(list));
  }

  function renderLeaderboardTable(mode) {
    currentLbTab = mode;
    lbTabTimer.classList.toggle('active', mode === 'timer');
    lbTabEndless.classList.toggle('active', mode === 'endless');

    const list = loadLeaderboard(mode);
    lbTableBody.innerHTML = '';

    list.forEach((item, index) => {
      const tr = document.createElement('tr');
      if (item.id && item.id === lastSubmittedId) {
        tr.classList.add('user-row');
      }

      let rankDisplay = `#${index + 1}`;
      if (index === 0) rankDisplay = '🥇 1st';
      else if (index === 1) rankDisplay = '🥈 2nd';
      else if (index === 2) rankDisplay = '🥉 3rd';

      tr.innerHTML = `
        <td><strong>${rankDisplay}</strong></td>
        <td>${item.country || '🌐'} ${escapeHtml(item.name || 'Anonymous')}</td>
        <td><strong>${item.score}</strong> pts</td>
        <td>${item.accuracy}%</td>
      `;
      lbTableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function submitCurrentScore() {
    const name = (playerNicknameInput.value || 'Player').trim().slice(0, 12);
    const country = playerCountryInput.value || '🌐';

    localStorage.setItem('basketbola_last_nick', name);
    localStorage.setItem('basketbola_last_country', country);

    const mode = state.gameMode;
    const list = loadLeaderboard(mode);

    const pct = state.shotsTaken > 0 ? Math.round((state.shotsMade / state.shotsTaken) * 100) : 0;
    const submissionId = Date.now().toString();
    lastSubmittedId = submissionId;

    list.push({
      id: submissionId,
      country: country,
      name: name,
      score: state.score,
      accuracy: pct
    });

    list.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
    const top15 = list.slice(0, 15);
    saveLeaderboard(mode, top15);

    triggerHaptic(60);
    showResultBanner('SCORE SUBMITTED! 🏆', 'swish');

    if (gameOverModal) gameOverModal.classList.remove('active');
    renderLeaderboardTable(mode);
    if (leaderboardModal) leaderboardModal.classList.add('active');
  }

  const savedNick = localStorage.getItem('basketbola_last_nick');
  const savedCountry = localStorage.getItem('basketbola_last_country');
  if (savedNick && playerNicknameInput) playerNicknameInput.value = savedNick;
  if (savedCountry && playerCountryInput) playerCountryInput.value = savedCountry;

  // --- Singapore MUIS Prayer Times & Hijri Calendar Engine ---
  let prayerTimesData = {
    Fajr: "05:40",
    Sunrise: "07:05",
    Dhuhr: "13:12",
    Asr: "16:35",
    Maghrib: "19:15",
    Isha: "20:28"
  };

  const PRAYER_LABELS = {
    Fajr: 'Subuh',
    Sunrise: 'Syuruk',
    Dhuhr: 'Zohor',
    Asr: 'Asar',
    Maghrib: 'Maghrib',
    Isha: 'Isyak'
  };

  function fetchSingaporePrayerTimes() {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Singapore&country=Singapore&method=11')
      .then(res => res.json())
      .then(data => {
        if (data && data.code === 200 && data.data) {
          const timings = data.data.timings;
          prayerTimesData.Fajr = cleanTimeString(timings.Fajr);
          prayerTimesData.Sunrise = cleanTimeString(timings.Sunrise);
          prayerTimesData.Dhuhr = cleanTimeString(timings.Dhuhr);
          prayerTimesData.Asr = cleanTimeString(timings.Asr);
          prayerTimesData.Maghrib = cleanTimeString(timings.Maghrib);
          prayerTimesData.Isha = cleanTimeString(timings.Isha);

          const hijri = data.data.date.hijri;
          if (hijri) {
            hijriDateText.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
          }
          updatePrayerTimesDisplay();
        }
      })
      .catch(err => {
        console.warn("Using offline Singapore prayer time calculations:", err);
        fallbackHijriDate();
        updatePrayerTimesDisplay();
      });
  }

  function cleanTimeString(t) {
    if (!t) return "00:00";
    return t.split(' ')[0];
  }

  function fallbackHijriDate() {
    try {
      const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      hijriDateText.textContent = formatter.format(new Date());
    } catch (e) {
      hijriDateText.textContent = "14 Safar 1448 AH";
    }
  }

  function updatePrayerTimesDisplay() {
    for (let key in prayerTimesData) {
      if (prayerTimeEls[key]) {
        prayerTimeEls[key].textContent = prayerTimesData[key];
      }
    }
    updatePrayerCountdown();
  }

  function updatePrayerCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextPrayerKey = null;
    let nextPrayerTargetTime = null;

    for (let key of prayerOrder) {
      const [h, m] = prayerTimesData[key].split(':').map(Number);
      const pDate = new Date(currentYear, currentMonth, currentDate, h, m, 0);

      if (pDate > now) {
        nextPrayerKey = key;
        nextPrayerTargetTime = pDate;
        break;
      }
    }

    if (!nextPrayerKey) {
      nextPrayerKey = 'Fajr';
      const [h, m] = prayerTimesData['Fajr'].split(':').map(Number);
      nextPrayerTargetTime = new Date(currentYear, currentMonth, currentDate + 1, h, m, 0);
    }

    for (let key in prayerChips) {
      if (prayerChips[key]) {
        prayerChips[key].classList.toggle('next-prayer', key === nextPrayerKey);
      }
    }

    if (nextPrayerTargetTime && nextPrayerNameEl && nextPrayerTimerEl) {
      nextPrayerNameEl.textContent = PRAYER_LABELS[nextPrayerKey] || nextPrayerKey;
      const diffMs = nextPrayerTargetTime - now;

      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        nextPrayerTimerEl.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
      } else {
        nextPrayerTimerEl.textContent = "00:00:00";
      }
    }
  }

  function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  // --- Game State Constants & Variables ---
  const COURT = {
    floorY: 480,
    threePointLineX: 320,
    keyLineX: 520,
    hoopX: 830,
    hoopY: 230,
    rimRadius: 4,
    rimWidth: 50,
    backboardX: 880,
    backboardY1: 140,
    backboardY2: 290,
  };

  const SPOTS = {
    '3pt': { x: 160, label: '3-POINTER SPOT', points: 3, nextLabel: 'Switch to 2PT' },
    '2pt': { x: 420, label: '2-POINTER SPOT', points: 2, nextLabel: 'Switch to 3PT' }
  };

  let state = {
    gameMode: 'timer', // 'timer' (60s Time Attack active by default!) or 'endless'
    score: 0,
    highScoreEndless: parseInt(localStorage.getItem('basketbola_highscore_endless') || '0', 10),
    highScoreTimer: parseInt(localStorage.getItem('basketbola_highscore_timer') || '0', 10),
    streak: 0,
    bestStreakSession: 0,
    shotsTaken: 0,
    shotsMade: 0,
    currentSpotKey: '3pt',
    angle: 52,
    power: 0,
    powerDirection: 1.6,
    isCharging: false,
    soundOn: true,
    bannerTimeout: null,
    netSwishTimer: 0,
    touchStartY: 0,
    // Time Attack Timer State
    timerSeconds: 60,
    timerActive: false,
    timerInterval: null,
    isGameOver: false
  };

  // Ball Object
  const ball = {
    x: SPOTS['3pt'].x,
    y: COURT.floorY - 24,
    radius: 14,
    vx: 0,
    vy: 0,
    rotation: 0,
    inAir: false,
    scored: false,
    hitRim: false,
    hitBackboard: false,
    prevY: 0,
    trail: []
  };

  const rimFront = { x: COURT.hoopX - COURT.rimWidth, y: COURT.hoopY };
  const rimBack = { x: COURT.hoopX, y: COURT.hoopY };

  let particles = [];

  function createSwishParticles(x, y) {
    particles = [];
    const colors = ['#00e676', '#00e5ff', '#ffbd00', '#ff6b00', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // --- Mode Switching & Reset Handlers ---
  function setGameMode(mode) {
    state.gameMode = mode;
    if (modeEndlessBtn) modeEndlessBtn.classList.toggle('active', mode === 'endless');
    if (modeTimerBtn) modeTimerBtn.classList.toggle('active', mode === 'timer');
    if (timerStatCard) timerStatCard.style.display = mode === 'timer' ? 'flex' : 'none';

    stopTimer();
    restartGame();
  }

  function restartGame() {
    state.score = 0;
    state.streak = 0;
    state.bestStreakSession = 0;
    state.shotsTaken = 0;
    state.shotsMade = 0;
    state.timerSeconds = 60;
    state.timerActive = false;
    state.isGameOver = false;

    stopTimer();
    if (timerDisplay) timerDisplay.textContent = '60s';
    if (timerStatCard) timerStatCard.classList.remove('timer-warning');
    if (gameOverModal) gameOverModal.classList.remove('active');
    if (leaderboardModal) leaderboardModal.classList.remove('active');

    updateScoreboardUI();
    resetBall();
  }

  function startTimer() {
    if (state.timerActive || state.gameMode !== 'timer') return;
    state.timerActive = true;

    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      if (timerDisplay) timerDisplay.textContent = `${state.timerSeconds}s`;

      if (state.timerSeconds <= 10 && timerStatCard) {
        timerStatCard.classList.add('timer-warning');
      }

      if (state.timerSeconds <= 0) {
        endTimerChallenge();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.timerActive = false;
  }

  function endTimerChallenge() {
    stopTimer();
    state.isGameOver = true;
    playBuzzerSound();
    triggerHaptic(100);

    const isNewRecord = state.score > state.highScoreTimer && state.score > 0;
    if (isNewRecord) {
      state.highScoreTimer = state.score;
      localStorage.setItem('basketbola_highscore_timer', state.score.toString());
    }

    if (modalScore) modalScore.textContent = state.score;
    const pct = state.shotsTaken > 0 ? Math.round((state.shotsMade / state.shotsTaken) * 100) : 0;
    if (modalAccuracy) modalAccuracy.textContent = `${pct}%`;
    if (modalShots) modalShots.textContent = `${state.shotsMade}/${state.shotsTaken}`;
    if (modalStreak) modalStreak.textContent = `${state.bestStreakSession} 🔥`;

    if (newRecordBadge) newRecordBadge.style.display = isNewRecord ? 'block' : 'none';
    if (gameOverModal) gameOverModal.classList.add('active');

    updateScoreboardUI();
  }

  function resetBall() {
    const spot = SPOTS[state.currentSpotKey];
    ball.x = spot.x;
    ball.y = COURT.floorY - ball.radius - 10;
    ball.vx = 0;
    ball.vy = 0;
    ball.inAir = false;
    ball.scored = false;
    ball.hitRim = false;
    ball.hitBackboard = false;
    ball.trail = [];
    state.isCharging = false;
    state.power = 0;
    powerMeterFill.style.width = '0%';
    powerMeterWrapper.classList.remove('charging');
    if (btnShoot) btnShoot.classList.remove('active');
  }

  function setSpot(spotKey) {
    if (ball.inAir || state.isGameOver) return;
    state.currentSpotKey = spotKey;
    const spot = SPOTS[spotKey];
    
    shotTypeText.textContent = spot.label;
    shotPointsTag.textContent = `+${spot.points} PTS`;
    if (spotBtnLabel) spotBtnLabel.textContent = spot.nextLabel;

    if (spotKey === '3pt') {
      shotPointsTag.style.background = 'var(--accent-orange)';
    } else {
      shotPointsTag.style.background = 'var(--accent-cyan)';
    }

    triggerHaptic(15);
    resetBall();
  }

  function toggleSpot() {
    const nextKey = state.currentSpotKey === '3pt' ? '2pt' : '3pt';
    setSpot(nextKey);
  }

  function setAngle(delta) {
    if (ball.inAir || state.isGameOver) return;
    state.angle = Math.max(30, Math.min(80, state.angle + delta));
    angleDisplay.textContent = `${state.angle}°`;
    triggerHaptic(10);
  }

  // --- Shooting Mechanics ---
  function startCharging() {
    if (ball.inAir || state.isCharging || state.isGameOver) return;
    initAudio();
    triggerHaptic(20);
    state.isCharging = true;
    state.power = 0;
    state.powerDirection = 1.6;
    powerMeterWrapper.classList.add('charging');
    if (btnShoot) btnShoot.classList.add('active');

    // Start timer countdown immediately when first shot charge begins!
    if (state.gameMode === 'timer' && !state.timerActive) {
      startTimer();
    }
  }

  function releaseShot() {
    if (!state.isCharging || ball.inAir || state.isGameOver) return;

    state.isCharging = false;
    powerMeterWrapper.classList.remove('charging');
    if (btnShoot) btnShoot.classList.remove('active');
    triggerHaptic(30);

    const spot = SPOTS[state.currentSpotKey];
    const powerRatio = state.power / 100;
    
    const minVel = spotKeyVelocityMin(state.currentSpotKey);
    const maxVel = spotKeyVelocityMax(state.currentSpotKey);
    const v0 = minVel + powerRatio * (maxVel - minVel);

    const rad = (state.angle * Math.PI) / 180;
    ball.vx = v0 * Math.cos(rad);
    ball.vy = -v0 * Math.sin(rad);

    ball.inAir = true;
    ball.scored = false;
    ball.hitRim = false;
    ball.hitBackboard = false;
    ball.prevY = ball.y;

    state.shotsTaken++;
    updateScoreboardUI();
  }

  function spotKeyVelocityMin(spotKey) {
    return spotKey === '3pt' ? 14.5 : 12.0;
  }

  function spotKeyVelocityMax(spotKey) {
    return spotKey === '3pt' ? 24.5 : 20.0;
  }

  // --- Physics & Collision Engine ---
  function updatePhysics() {
    if (state.isCharging) {
      state.power += state.powerDirection;
      if (state.power >= 100) {
        state.power = 100;
        state.powerDirection = -1.6;
      } else if (state.power <= 0) {
        state.power = 0;
        state.powerDirection = 1.6;
      }
      powerMeterFill.style.width = `${state.power}%`;
    }

    if (state.netSwishTimer > 0) {
      state.netSwishTimer--;
    }

    if (!ball.inAir) return;

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) ball.trail.shift();

    const steps = 4;
    const gravity = 0.45 / steps;

    for (let i = 0; i < steps; i++) {
      ball.prevY = ball.y;
      ball.x += ball.vx / steps;
      ball.y += ball.vy / steps;
      ball.vy += gravity;
      ball.rotation += (ball.vx * 0.03) / steps;

      // 1. Backboard Collision
      if (
        ball.x + ball.radius >= COURT.backboardX &&
        ball.x - ball.radius <= COURT.backboardX + 12 &&
        ball.y >= COURT.backboardY1 &&
        ball.y <= COURT.backboardY2
      ) {
        if (ball.vx > 0) {
          ball.vx = -ball.vx * 0.65;
          ball.vy = ball.vy * 0.85;
          ball.x = COURT.backboardX - ball.radius;
          ball.hitBackboard = true;
          playRimSound();
        }
      }

      // 2. Rim Collision
      checkRimPointCollision(rimFront);
      checkRimPointCollision(rimBack);

      // 3. Score Detection
      if (
        !ball.scored &&
        ball.vy > 0 &&
        ball.prevY < COURT.hoopY &&
        ball.y >= COURT.hoopY &&
        ball.x > rimFront.x + 5 &&
        ball.x < rimBack.x - 5
      ) {
        handleScoreSuccess();
      }

      // 4. Floor Collision
      if (ball.y + ball.radius >= COURT.floorY) {
        ball.y = COURT.floorY - ball.radius;
        ball.vy = -ball.vy * 0.5;
        ball.vx = ball.vx * 0.7;
        playBounceSound();

        if (Math.abs(ball.vy) < 1 && Math.abs(ball.vx) < 1) {
          setTimeout(() => {
            if (ball.inAir) handleShotFinished();
          }, 400);
          break;
        }
      }

      if (ball.x > canvas.width + 50 || ball.x < -50 || ball.y > canvas.height + 50) {
        handleShotFinished();
        break;
      }
    }

    updateParticles();
  }

  function checkRimPointCollision(rimPt) {
    const dx = ball.x - rimPt.x;
    const dy = ball.y - rimPt.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + COURT.rimRadius;

    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      ball.x = rimPt.x + nx * minDist;
      ball.y = rimPt.y + ny * minDist;

      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx = (ball.vx - 2 * dot * nx) * 0.7;
      ball.vy = (ball.vy - 2 * dot * ny) * 0.7;

      ball.hitRim = true;
      playRimSound();
    }
  }

  function handleScoreSuccess() {
    ball.scored = true;
    const pts = SPOTS[state.currentSpotKey].points;

    state.score += pts;
    state.shotsMade++;
    state.streak++;
    if (state.streak > state.bestStreakSession) {
      state.bestStreakSession = state.streak;
    }

    if (state.gameMode === 'endless') {
      if (state.score > state.highScoreEndless) {
        state.highScoreEndless = state.score;
        localStorage.setItem('basketbola_highscore_endless', state.score.toString());
      }
    } else {
      if (state.score > state.highScoreTimer) {
        state.highScoreTimer = state.score;
        localStorage.setItem('basketbola_highscore_timer', state.score.toString());
      }
    }

    state.netSwishTimer = 25;
    createSwishParticles(COURT.hoopX - COURT.rimWidth / 2, COURT.hoopY + 10);
    triggerHaptic(50);

    if (ball.hitBackboard && !ball.hitRim) {
      showResultBanner(`BANK SHOT! +${pts}`, 'swish');
      playSwishSound();
    } else if (!ball.hitRim) {
      showResultBanner(`SWISH! +${pts}`, 'swish');
      playSwishSound();
      playCheerSound();
    } else {
      showResultBanner(`BUCKET! +${pts}`, 'swish');
      playSwishSound();
    }

    updateScoreboardUI();
    setTimeout(() => {
      resetBall();
    }, 1200);
  }

  function handleShotFinished() {
    if (ball.scored) return;

    state.streak = 0;
    if (!ball.hitRim && !ball.hitBackboard) {
      showResultBanner('AIRBALL!', 'miss');
    } else {
      showResultBanner('MISSED!', 'miss');
    }

    updateScoreboardUI();
    resetBall();
  }

  function showResultBanner(text, type) {
    if (state.bannerTimeout) clearTimeout(state.bannerTimeout);
    resultText.textContent = text;
    shotResultBanner.className = `shot-result-banner show ${type}`;

    state.bannerTimeout = setTimeout(() => {
      shotResultBanner.className = 'shot-result-banner';
    }, 1500);
  }

  function updateScoreboardUI() {
    scoreDisplay.textContent = state.score;

    const currentHighScore = state.gameMode === 'endless' ? state.highScoreEndless : state.highScoreTimer;
    highScoreDisplay.textContent = currentHighScore;

    if (state.streak >= 3) {
      streakDisplay.textContent = `${state.streak} 🔥`;
      streakContainer.classList.add('hot');
    } else {
      streakDisplay.textContent = `${state.streak}`;
      streakContainer.classList.remove('hot');
    }

    const pct = state.shotsTaken > 0 ? Math.round((state.shotsMade / state.shotsTaken) * 100) : 0;
    accuracyDisplay.textContent = `${pct}%`;
  }

  // --- Rendering Engine ---
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackgroundStadium();
    drawCourtFloor();
    drawHoopAndBackboard();
    drawShooterSpotMarker();
    drawTrajectoryPreview();
    drawBallTrail();
    drawBasketball();
    drawParticles();
    drawAimGuideHud();
    drawCanvasTimerHud(); // Prominent Timer HUD Overlay on Canvas!
  }

  function drawBackgroundStadium() {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0a0d1a');
    bgGrad.addColorStop(0.6, '#121729');
    bgGrad.addColorStop(1, '#181e33');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    const lightGrad1 = ctx.createRadialGradient(830, 80, 10, 830, 80, 300);
    lightGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    lightGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGrad1;
    ctx.beginPath();
    ctx.arc(830, 80, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCourtFloor() {
    const floorY = COURT.floorY;

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, canvas.height);
    floorGrad.addColorStop(0, '#c67d34');
    floorGrad.addColorStop(0.15, '#a66224');
    floorGrad.addColorStop(1, '#5c330e');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(COURT.threePointLineX, floorY);
    ctx.lineTo(COURT.threePointLineX, floorY + 40);
    ctx.stroke();

    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(COURT.hoopX - 100, floorY, 340, Math.PI, Math.PI * 1.5, false);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(180, 40, 40, 0.35)';
    ctx.fillRect(COURT.keyLineX, floorY, canvas.width - COURT.keyLineX, canvas.height - floorY);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(COURT.keyLineX, floorY, canvas.width - COURT.keyLineX, canvas.height - floorY);
  }

  function drawHoopAndBackboard() {
    ctx.fillStyle = '#222738';
    ctx.fillRect(COURT.backboardX + 10, COURT.backboardY1 - 20, 25, COURT.floorY - (COURT.backboardY1 - 20));
    
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(COURT.backboardX + 5, COURT.backboardY1 + 50, 15, 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.fillRect(COURT.backboardX, COURT.backboardY1, 10, COURT.backboardY2 - COURT.backboardY1);
    ctx.strokeRect(COURT.backboardX, COURT.backboardY1, 10, COURT.backboardY2 - COURT.backboardY1);

    ctx.strokeStyle = '#ff3d00';
    ctx.lineWidth = 3;
    ctx.strokeRect(COURT.backboardX - 1, COURT.hoopY - 45, 2, 50);

    ctx.strokeStyle = '#ff3d00';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rimFront.x, rimFront.y);
    ctx.lineTo(rimBack.x, rimBack.y);
    ctx.stroke();

    ctx.fillStyle = '#ff3d00';
    ctx.beginPath();
    ctx.arc(rimFront.x, rimFront.y, COURT.rimRadius + 2, 0, Math.PI * 2);
    ctx.arc(rimBack.x, rimBack.y, COURT.rimRadius + 2, 0, Math.PI * 2);
    ctx.fill();

    const netTopY = COURT.hoopY;
    const netBottomY = COURT.hoopY + 45;
    const swishOffset = state.netSwishTimer > 0 ? Math.sin(state.netSwishTimer * 0.4) * 12 : 0;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.8;

    const netSegments = 5;
    for (let i = 0; i <= netSegments; i++) {
      const ratio = i / netSegments;
      const topX = rimFront.x + ratio * COURT.rimWidth;
      const bottomX = (rimFront.x + 10) + ratio * (COURT.rimWidth - 20) + swishOffset * (1 - ratio);

      ctx.beginPath();
      ctx.moveTo(topX, netTopY);
      ctx.lineTo(bottomX, netBottomY + Math.abs(swishOffset) * 0.3);
      ctx.stroke();
    }

    for (let j = 1; j <= 3; j++) {
      const ringY = netTopY + (j / 3) * 45;
      const ringWidth = COURT.rimWidth - j * 5;
      const ringX = rimFront.x + (j * 2.5) + swishOffset * (j / 3);

      ctx.beginPath();
      ctx.moveTo(ringX, ringY);
      ctx.lineTo(ringX + ringWidth, ringY);
      ctx.stroke();
    }
  }

  function drawShooterSpotMarker() {
    const spot = SPOTS[state.currentSpotKey];

    ctx.save();
    ctx.fillStyle = state.currentSpotKey === '3pt' ? 'rgba(255, 107, 0, 0.25)' : 'rgba(0, 229, 255, 0.25)';
    ctx.strokeStyle = state.currentSpotKey === '3pt' ? 'var(--accent-orange)' : 'var(--accent-cyan)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(spot.x, COURT.floorY, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!ball.inAir) {
      ctx.fillStyle = '#222a42';
      ctx.fillRect(spot.x - 12, COURT.floorY - 60, 24, 60);

      ctx.beginPath();
      ctx.arc(spot.x, COURT.floorY - 75, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTrajectoryPreview() {
    if (ball.inAir || state.isGameOver) return;

    const spot = SPOTS[state.currentSpotKey];
    const previewPower = state.isCharging ? state.power : 50;
    const powerRatio = previewPower / 100;

    const minVel = spotKeyVelocityMin(state.currentSpotKey);
    const maxVel = spotKeyVelocityMax(state.currentSpotKey);
    const v0 = minVel + powerRatio * (maxVel - minVel);

    const rad = (state.angle * Math.PI) / 180;
    let vx = v0 * Math.cos(rad);
    let vy = -v0 * Math.sin(rad);

    let simX = spot.x;
    let simY = COURT.floorY - ball.radius - 10;

    ctx.save();
    ctx.strokeStyle = state.isCharging ? 'rgba(255, 107, 0, 0.7)' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(simX, simY);

    for (let step = 0; step < 30; step++) {
      simX += vx * 1.2;
      simY += vy * 1.2;
      vy += 0.45 * 1.2;

      ctx.lineTo(simX, simY);
      if (simY >= COURT.floorY || simX >= canvas.width) break;
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawBallTrail() {
    if (!ball.inAir || ball.trail.length < 2) return;

    ctx.save();
    for (let i = 0; i < ball.trail.length - 1; i++) {
      const pt1 = ball.trail[i];
      const pt2 = ball.trail[i + 1];
      const alpha = (i / ball.trail.length) * 0.4;

      ctx.strokeStyle = `rgba(255, 107, 0, ${alpha})`;
      ctx.lineWidth = ball.radius * (i / ball.trail.length);
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBasketball() {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    if (ball.scored) {
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 20;
    }

    const ballGrad = ctx.createRadialGradient(
      -ball.radius * 0.3,
      -ball.radius * 0.3,
      ball.radius * 0.1,
      0,
      0,
      ball.radius
    );
    ballGrad.addColorStop(0, '#ff8800');
    ballGrad.addColorStop(0.7, '#d84315');
    ballGrad.addColorStop(1, '#8e24aa');

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a0d00';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(-ball.radius, 0);
    ctx.lineTo(ball.radius, 0);
    ctx.moveTo(0, -ball.radius);
    ctx.lineTo(0, ball.radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-ball.radius * 0.5, 0, ball.radius * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ball.radius * 0.5, 0, ball.radius * 0.7, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles() {
    for (let p of particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawAimGuideHud() {
    if (ball.inAir || state.isGameOver) return;
    const spot = SPOTS[state.currentSpotKey];

    const rad = (state.angle * Math.PI) / 180;
    const lineLen = 45;
    const endX = spot.x + lineLen * Math.cos(rad);
    const endY = (COURT.floorY - 30) - lineLen * Math.sin(rad);

    ctx.save();
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(spot.x, COURT.floorY - 30);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px Orbitron, sans-serif';
    ctx.fillText(`${state.angle}°`, spot.x - 15, COURT.floorY - 85);
    ctx.restore();
  }

  function drawCanvasTimerHud() {
    if (state.gameMode !== 'timer') return;

    ctx.save();
    const centerX = canvas.width / 2;
    const topY = 40;

    // Draw Clock Badge Container
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
    ctx.strokeStyle = state.timerSeconds <= 10 ? '#ff1744' : 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(centerX - 130, topY - 24, 260, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!state.timerActive && !state.isGameOver) {
      ctx.fillStyle = '#ffbd00';
      ctx.font = '800 14px Outfit, sans-serif';
      ctx.fillText("⏱️ 60s TIMER - SHOOT TO START!", centerX, topY);
    } else if (state.timerActive) {
      ctx.fillStyle = state.timerSeconds <= 10 ? '#ff1744' : '#00e5ff';
      ctx.font = '900 24px Orbitron, sans-serif';
      ctx.fillText(`⏱️ 00:${padZero(state.timerSeconds)}`, centerX, topY);
    }
    ctx.restore();
  }

  // --- Main Animation Loop ---
  function gameLoop() {
    updatePhysics();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // --- Event Listeners & Keyboard / Touch Bindings ---
  function setupEvents() {
    // Leaderboard Listeners
    if (openLeaderboardBtn) {
      openLeaderboardBtn.addEventListener('click', () => {
        renderLeaderboardTable(state.gameMode);
        if (leaderboardModal) leaderboardModal.classList.add('active');
      });
    }

    if (closeLbBtn) {
      closeLbBtn.addEventListener('click', () => {
        if (leaderboardModal) leaderboardModal.classList.remove('active');
      });
    }

    if (lbPlayBtn) {
      lbPlayBtn.addEventListener('click', () => {
        if (leaderboardModal) leaderboardModal.classList.remove('active');
        restartGame();
      });
    }

    if (lbTabTimer) {
      lbTabTimer.addEventListener('click', () => renderLeaderboardTable('timer'));
    }

    if (lbTabEndless) {
      lbTabEndless.addEventListener('click', () => renderLeaderboardTable('endless'));
    }

    if (btnSubmitLeaderboard) {
      btnSubmitLeaderboard.addEventListener('click', submitCurrentScore);
    }

    // Mode Switcher Listeners
    if (modeEndlessBtn) {
      modeEndlessBtn.addEventListener('click', () => setGameMode('endless'));
    }
    if (modeTimerBtn) {
      modeTimerBtn.addEventListener('click', () => setGameMode('timer'));
    }

    // Modal Restart Button
    if (modalRestartBtn) {
      modalRestartBtn.addEventListener('click', restartGame);
    }

    // Keyboard keydown
    window.addEventListener('keydown', (e) => {
      if (e.repeat && e.code !== 'ArrowUp' && e.code !== 'ArrowDown') return;

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault();
          startCharging();
          break;
        case 'Digit1':
        case 'Key1':
        case 'Numpad1':
          setSpot('2pt');
          break;
        case 'Digit2':
        case 'Key2':
        case 'Numpad2':
          setSpot('3pt');
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          toggleSpot();
          break;
        case 'ArrowUp':
          setAngle(1);
          break;
        case 'ArrowDown':
          setAngle(-1);
          break;
        case 'KeyR':
          restartGame();
          break;
      }
    });

    // Keyboard keyup
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        releaseShot();
      }
    });

    // Canvas Direct Touch Gestures
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        state.touchStartY = e.touches[0].clientY;
        startCharging();
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0 && !ball.inAir) {
        const deltaY = state.touchStartY - e.touches[0].clientY;
        if (Math.abs(deltaY) > 12) {
          setAngle(deltaY > 0 ? 1 : -1);
          state.touchStartY = e.touches[0].clientY;
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      releaseShot();
    }, { passive: false });

    // On-screen Touch Button Listeners
    if (btnToggleSpot) {
      btnToggleSpot.addEventListener('click', toggleSpot);
    }

    if (btnAngleUp) {
      btnAngleUp.addEventListener('click', () => setAngle(2));
    }

    if (btnAngleDown) {
      btnAngleDown.addEventListener('click', () => setAngle(-2));
    }

    if (btnShoot) {
      btnShoot.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startCharging();
      });
      btnShoot.addEventListener('mouseup', (e) => {
        e.preventDefault();
        releaseShot();
      });
      btnShoot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startCharging();
      }, { passive: false });
      btnShoot.addEventListener('touchend', (e) => {
        e.preventDefault();
        releaseShot();
      }, { passive: false });
    }

    // Sound toggle
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        soundToggleBtn.classList.toggle('off', !soundEnabled);
        soundToggleBtn.innerHTML = soundEnabled ? '<span id="sound-icon">🔊</span> Sound ON' : '<span id="sound-icon">🔇</span> Sound OFF';
        triggerHaptic(15);
      });
    }
  }

  // Initial setup call
  setupEvents();
  setGameMode('timer'); // Default to 60s Time Attack Challenge!
  updateScoreboardUI();
  resetBall();

  // Fetch Singapore MUIS Prayer Times & Hijri Calendar
  fetchSingaporePrayerTimes();
  setInterval(updatePrayerCountdown, 1000);

  requestAnimationFrame(gameLoop);

})();
