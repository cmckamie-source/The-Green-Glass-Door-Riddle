// Implements the same logic as the console app: check for adjacent duplicate letters
// and after every 5 attempts allow guessing the riddle answer.

const ANSWER = "double letters"; // matches Answers::getAnswer()

function normalize(s) {
  return s.trim().toLowerCase();
}

// decorative glass shards generation
function makeShardShape() {
  // produce a few variant clip-paths for variety
  const shapes = [
	'polygon(50% 0%, 100% 25%, 80% 100%, 20% 100%, 0% 25%)',
	'polygon(60% 0%, 100% 10%, 90% 60%, 50% 100%, 10% 60%, 0% 10%)',
	'polygon(40% 0%, 100% 30%, 75% 100%, 25% 100%, 0% 30%)',
	'polygon(50% 0%, 85% 20%, 100% 60%, 70% 100%, 30% 100%, 0% 60%, 15% 20%)'
  ];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

function generateShards(count = 30) {
  const container = document.getElementById('shards');
  if (!container) return;
  container.innerHTML = '';
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	// avoid covering the intro (riddle) area
  const introEl = document.querySelector('.intro');
  const introRect = introEl ? introEl.getBoundingClientRect() : null;
  function rectsIntersect(a, b) {
	return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  for (let i = 0; i < count; ++i) {
	const s = document.createElement('div');
	s.className = 'shard';
	const w = 20 + Math.floor(Math.random() * 140); // width px
	const h = Math.floor(w * (0.6 + Math.random() * 1.2));
	// try a few times to place shard outside introRect
	let left, top, attempts = 0;
	do {
	  left = Math.random() * vw;
	  top = Math.random() * vh;
	  attempts++;
	  // compute shard rect
	  var shardRect = { left: left - w/2, top: top - h/2, right: left - w/2 + w, bottom: top - h/2 + h };
	  // if no introRect, break
	  if (!introRect) break;
	  // slightly expand intro area to provide padding
	  const padding = 12;
	  const expandedIntro = { left: introRect.left - padding, top: introRect.top - padding, right: introRect.right + padding, bottom: introRect.bottom + padding };
	  if (!rectsIntersect(shardRect, expandedIntro)) break;
	} while (attempts < 12);
	s.style.width = w + 'px';
	s.style.height = h + 'px';
	s.style.left = (left - w/2) + 'px';
	s.style.top = (top - h/2) + 'px';
	s.style.clipPath = makeShardShape();
	// stronger green tint variation for visibility
	const gBase = 140 + Math.floor(Math.random() * 80); // 140-219
	const gTop = Math.min(255, gBase + 30);
	s.style.background = `linear-gradient(180deg, rgba(240,255,240,0.98), rgba(120,${gBase},100,0.45))`;
	// slightly higher opacity range so shards are visible
	s.style.opacity = (0.12 + Math.random() * 0.22).toFixed(2);
	s.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
	const dur = 4000 + Math.floor(Math.random() * 8000);
	s.style.animation = `shard-drift ${dur}ms ease-in-out ${Math.floor(Math.random()*2000)}ms infinite`;
	container.appendChild(s);
  }
}

// Accept many possible phrasings for the correct answer.
function isCorrectGuess(guess) {
  const g = normalize(guess);
  if (!g) return false;

  // common exact variants
  const accepted = new Set([
	'double letters', 'double letter', 'double-letters', 'double-letter',
	'double characters', 'double character', 'same letter twice', 'same letters',
	'same letter', 'same letter twice', 'letters repeated', 'repeated letters',
	'letter repeated', 'letters that are doubled', 'words with double letters',
	'words with double characters', 'two identical letters', 'two same letters',
	'letter twice', 'double characters', 'double characters rule'
  ]);
  if (accepted.has(g)) return true;

  // remove punctuation for regex tests
  const clean = g.replace(/[^a-z0-9\s-]/g, ' ');

  // regex-based heuristics for many phrasings
  const reDouble = /double.*(letter|letters|character|characters|consonant|vowel)/;
  const reSame = /(same|identical|two|twice|repeat|repeated).*(letter|letters|character|characters)/;
  const reBack = /(back[\s-]?to[\s-]?back|backto ?back|back[- ]back|adjacent|consecutive|next to each other)/;
  const reLetter = /(letter|letters|character|characters|char)/;

  if (reDouble.test(clean)) return true;
  if (reSame.test(clean)) return true;
  if (reBack.test(clean) && reLetter.test(clean)) return true;

  // tokens-based fallback: both 'double' and a letter-word present
  const tokens = clean.split(/\s+/);
  if (tokens.includes('double') && tokens.some(t => ['letter','letters','character','characters','char'].includes(t))) return true;

  // phrases like 'the same letters' or 'the same letter twice'
  if (/(the same).*(letter|letters|character|characters)/.test(clean)) return true;

  return false;
}

function hasAdjacentDuplicates(word) {
  const w = normalize(word);
  for (let i = 1; i < w.length; ++i) {
	if (w[i] === w[i-1]) return { has_adjacent: true, char: w[i], index: i-1 };
  }
  return { has_adjacent: false };
}

// create a simple confetti effect by adding small colored divs that
// fall using a CSS animation. Uses #confetti-container in the DOM.
// Also plays a confetti sound if available, with a WebAudio fallback.
const CONFETTI_SOUND_PATH = 'sounds/confetti.mp3';
let confettiAudio = null;
let confettiAudioAvailable = false;

function initConfettiSound() {
  try {
	confettiAudio = new Audio(CONFETTI_SOUND_PATH);
	confettiAudio.preload = 'auto';
	// if loading fails, audio element will fire an error event
	confettiAudio.addEventListener('canplaythrough', () => { confettiAudioAvailable = true; });
	confettiAudio.addEventListener('error', () => { confettiAudioAvailable = false; });
	// begin loading
	confettiAudio.load();
  } catch (e) {
	confettiAudio = null;
	confettiAudioAvailable = false;
  }
}

function playConfettiSound() {
  if (confettiAudio && confettiAudioAvailable) {
	try {
	  confettiAudio.currentTime = 0;
	  confettiAudio.play().catch(() => {
		// if play is blocked, try WebAudio fallback
		playConfettiToneFallback();
	  });
	  return;
	} catch (e) {
	  // fall through to fallback
	}
  }
  playConfettiToneFallback();
}

function playConfettiToneFallback() {
  // simple celebratory chord using WebAudio
  try {
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	const ctx = new AudioCtx();
	const now = ctx.currentTime;
	const master = ctx.createGain();
	master.gain.setValueAtTime(0.0001, now);
	master.gain.exponentialRampToValueAtTime(0.6, now + 0.02);
	master.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
	master.connect(ctx.destination);

	const freqs = [880, 1320, 1760]; // short major-ish chord
	freqs.forEach((f, i) => {
	  const osc = ctx.createOscillator();
	  const g = ctx.createGain();
	  osc.type = 'sine';
	  osc.frequency.setValueAtTime(f * (1 + (Math.random() - 0.5) * 0.02), now);
	  g.gain.setValueAtTime(0.0001, now);
	  g.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
	  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0 + Math.random() * 0.5);
	  osc.connect(g);
	  g.connect(master);
	  osc.start(now + i * 0.03);
	  osc.stop(now + 1.05 + Math.random() * 0.5);
	});
	// close context after a while to free resources
	setTimeout(() => { try { ctx.close(); } catch (_) {} }, 2000);
  } catch (e) {
	// silent fail if no WebAudio available
  }
}

function launchConfetti(count = 80) {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = ['#ff5252','#ffb74d','#ffd54f','#c8e6c9','#81c784','#4caf50','#66bb6a','#7e57c2'];
  for (let i = 0; i < count; ++i) {
	const el = document.createElement('div');
	el.className = 'confetti';
	const color = colors[Math.floor(Math.random() * colors.length)];
	el.style.background = color;
	// random horizontal start between 0% and 100%
	el.style.left = Math.random() * 100 + '%';
	// random size
	const w = 6 + Math.floor(Math.random() * 10);
	el.style.width = w + 'px';
	el.style.height = Math.floor(w * 1.4) + 'px';
	// random animation duration and delay
	const dur = 900 + Math.floor(Math.random() * 900);
	const delay = Math.floor(Math.random() * 300);
	el.style.animationDuration = dur + 'ms';
	el.style.animationDelay = delay + 'ms';
	// slight horizontal offset via transform translateX set initially
	el.style.transform = 'translateY(-10vh) rotate(' + (Math.random() * 360) + 'deg)';
	container.appendChild(el);
	// remove after animation
	el.addEventListener('animationend', () => {
	  el.remove();
	});
  }
  // play sound
  playConfettiSound();
}

window.addEventListener('DOMContentLoaded', () => {
  // initialize confetti sound (attempt to load sounds/confetti.mp3)
  initConfettiSound();
	// generate decorative shards behind the content
  generateShards(36);

  const wordEl = document.getElementById('word');
  const checkBtn = document.getElementById('check');
  const resultEl = document.getElementById('result');
  const guessArea = document.getElementById('guess-area');
  const guessInput = document.getElementById('guess');
  const submitGuess = document.getElementById('submit-guess');
  const guessResult = document.getElementById('guess-result');

  checkBtn.addEventListener('click', () => {
	const w = wordEl.value || '';
	if (!w.trim()) {
	  resultEl.textContent = 'Please enter a word.';
	  return;
	}

	const check = hasAdjacentDuplicates(w);
	if (check.has_adjacent) {
	  resultEl.textContent = 'Yes this can go through the Green Glass Door!';
	} else {
	  resultEl.textContent = 'No, this cannot go through the Green Glass Door.';
	}
	// add to history on the side
	addHistoryEntry(w, check.has_adjacent);

	// clear input and focus for next word
	wordEl.value = '';
	wordEl.focus();
	guessResult.textContent = '';
  });

  // --- single-list management and persistence ---
  const STORAGE_KEY = 'ggd_lists_v1';
  const defaultListName = 'Default';
  const clearListBtn = document.getElementById('clear-list');
  const historyEl = document.getElementById('history');

  let lists = {}; // only Default list will be kept
  let activeList = defaultListName;

  function loadLists() {
	try {
	  const raw = localStorage.getItem(STORAGE_KEY);
	  lists = raw ? JSON.parse(raw) : {};
	} catch (e) {
	  lists = {};
	}
	if (!lists || typeof lists !== 'object') lists = {};
	if (!lists[defaultListName]) lists[defaultListName] = [];
	// enforce single list: remove any other keys
	Object.keys(lists).forEach(k => { if (k !== defaultListName) delete lists[k]; });
  }

  function saveLists() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }

  function renderHistory() {
	historyEl.innerHTML = '';
	const entries = lists[activeList] || [];
	// newest first
	for (let i = entries.length - 1; i >= 0; --i) {
	  const e = entries[i];
	  const li = document.createElement('li');
	  li.className = e.passed ? 'correct' : 'incorrect';
	  const spanWord = document.createElement('span');
	  spanWord.textContent = e.word;
	  const badge = document.createElement('span');
	  badge.className = 'badge ' + (e.passed ? 'pass' : 'fail');
	  badge.textContent = e.passed ? 'pass' : 'fail';
	  li.appendChild(spanWord);
	  li.appendChild(badge);
	  historyEl.appendChild(li);
	}
  }

  function addHistoryEntry(word, passed) {
	if (!lists[activeList]) lists[activeList] = [];
	lists[activeList].push({ word: word, passed: !!passed, time: Date.now() });
	saveLists();
	renderHistory();
  }

  // initial load
  loadLists();
  renderHistory();

  // clear list handler
  clearListBtn.addEventListener('click', () => {
	if (!confirm('Clear all entries in the list?')) return;
	lists[activeList] = [];
	saveLists();
	renderHistory();
  });

  submitGuess.addEventListener('click', () => {
	const g = normalize(guessInput.value || '');
	if (!g) {
	  guessResult.textContent = 'Please enter a guess.';
	  return;
	}
	if (isCorrectGuess(g)) {
	  guessResult.textContent = 'Congrats! you solved the riddle :)';
	  // celebrate
	  launchConfetti(100);
	} else {
	  guessResult.textContent = 'Try Again :(';
	}
	  // clear the guess input after submission
	guessInput.value = '';
	// return focus to the main word input for convenience
	wordEl.focus();
  });

  // allow pressing Enter in the word input to trigger check
  wordEl.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') checkBtn.click();
  });
});