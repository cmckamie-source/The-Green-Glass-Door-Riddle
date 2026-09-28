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

	// --- list management and persistence ---
  const STORAGE_KEY = 'ggd_lists_v1';
  const defaultListName = 'Default';
  const listsSelect = document.getElementById('lists');
  const createListBtn = document.getElementById('create-list');
  const newListInput = document.getElementById('new-list-name');
  const deleteListBtn = document.getElementById('delete-list');
  const clearListBtn = document.getElementById('clear-list');
  const historyEl = document.getElementById('history');

  let lists = {}; // map name -> array of entries
  let activeList = null;

  function loadLists() {
	try {
	  const raw = localStorage.getItem(STORAGE_KEY);
	  lists = raw ? JSON.parse(raw) : {};
	} catch (e) {
	  lists = {};
	}
	if (!lists || typeof lists !== 'object') lists = {};
	if (!Object.keys(lists).length) lists[defaultListName] = [];
  }

  function saveLists() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }

  function renderListOptions() {
	listsSelect.innerHTML = '';
	Object.keys(lists).forEach(name => {
	  const opt = document.createElement('option');
	  opt.value = name;
	  opt.textContent = name;
	  listsSelect.appendChild(opt);
	});
	if (!activeList || !lists[activeList]) activeList = Object.keys(lists)[0];
	listsSelect.value = activeList;
  }

  function renderHistory() {
	historyEl.innerHTML = '';
	if (!activeList || !lists[activeList]) return;
	const entries = lists[activeList];
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
	if (!activeList) activeList = defaultListName;
	if (!lists[activeList]) lists[activeList] = [];
	lists[activeList].push({ word: word, passed: !!passed, time: Date.now() });
	saveLists();
	renderHistory();
  }

  function removeEntry(index) {
	// removed: per-entry delete feature disabled
	return;
  }

  // initial load
  loadLists();
  activeList = Object.keys(lists)[0];
  renderListOptions();
  renderHistory();

  // create/delete/clear list handlers
  createListBtn.addEventListener('click', () => {
	const name = (newListInput.value || '').trim();
	if (!name) return;
	if (lists[name]) {
	  alert('A list with that name already exists');
	  return;
	}
	lists[name] = [];
	activeList = name;
	saveLists();
	renderListOptions();
	renderHistory();
	newListInput.value = '';
  });

  listsSelect.addEventListener('change', () => {
	activeList = listsSelect.value;
	renderHistory();
  });

  deleteListBtn.addEventListener('click', () => {
	if (!activeList) return;
	if (!confirm('Delete list "' + activeList + '"? This cannot be undone.')) return;
	delete lists[activeList];
	// ensure at least one list remains
	if (!Object.keys(lists).length) lists[defaultListName] = [];
	activeList = Object.keys(lists)[0];
	saveLists();
	renderListOptions();
	renderHistory();
  });

  clearListBtn.addEventListener('click', () => {
	if (!activeList) return;
	if (!confirm('Clear all entries in list "' + activeList + '"?')) return;
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