const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ASNWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  let done = false;
  setLoading(false);
  isLoading = false;

  function addLetter(letter) {
    if (currentGuess.length < ASNWER_LENGTH) {
      //add letter to the end
      currentGuess += letter;
    } else {
      //replace last letter
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    //determining row that the user is typing on by quick math equation
    letters[ASNWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ASNWER_LENGTH) {
      //do nothing
      return;
    }

    //validate word
    isLoading = true;
    setLoading(true);
    const word = currentGuess;
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word }),
    });

    const { validWord } = await res.json();
    //const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ASNWER_LENGTH; i++) {
      //mark as correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ASNWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ASNWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        //mark as close
        letters[currentRow * ASNWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        //mark as wrong
        letters[currentRow * ASNWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;

    //if they lose
    if (currentRow === ROUNDS) {
      alert(`you lose, the word was ${word}`);
      done = true;
    }
    //of they win
    else if (currentGuess === word) {
      alert("you win!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
      return;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ASNWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < ASNWER_LENGTH; i++) {
      letters[currentRow * ASNWER_LENGTH + i].classList.remove("invalid");

      setTimeout(function () {
        letters[currentRow * ASNWER_LENGTH + i].classList.add("invalid");
      }, /*setting 10 miliseconds timeout to remove the invalid class*/ 10);
    }
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      //do nothing
      return;
    }

    const action = event.key;
    console.log(action);

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //ignore/ do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();
