// Implements the same logic as the console app: check for adjacent duplicate letters
// and after every 5 attempts allow guessing the riddle answer.

const ANSWER = "double letters"; // matches Answers::getAnswer()
let attempts = 0;

function normalize(s) {
  return s.trim().toLowerCase();
}

function hasAdjacentDuplicates(word) {
  const w = normalize(word);
  for (let i = 1; i < w.length; ++i) {
	if (w[i] === w[i-1]) return { has_adjacent: true, char: w[i], index: i-1 };
  }
  return { has_adjacent: false };
}

window.addEventListener('DOMContentLoaded', () => {
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

	attempts++;
	guessResult.textContent = '';

	if (attempts % 5 === 0) {
	  guessArea.hidden = false;
	} else {
	  guessArea.hidden = true;
	}
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
	if (g === normalize(ANSWER)) {
	  guessResult.textContent = 'Congrats! you solved the riddle :)';
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