const p1 = {
    name: 'Player 1',
    score: 0,
    button: document.querySelector('#p1Button'),
    display: document.querySelector('#p1Display')
}

const p2 = {
    name: 'Player 2',
    score: 0,
    button: document.querySelector('#p2Button'),
    display: document.querySelector('#p2Display')
}

const resetButton = document.querySelector('#reset');
const winningScoreSelect = document.querySelector('#playto');
const textSubtitle = document.querySelector("#subtitle");
let p1Score = 0;
let p2Score = 0;
let winningScore = 3;
let isGameOver = false;

function updateScores(player, opponent) {

    if (!isGameOver) {
        player.score += 1;
        if (player.score === winningScore) {
            isGameOver = true;
            player.display.classList.add('has-text-success');
            opponent.display.classList.add('has-text-danger');
            player.button.disabled = true;
            opponent.button.disabled = true;
            textSubtitle.innerText = `${player.name} has won!`;
        }
        player.display.textContent = player.score;
    }
}

p1.button.addEventListener('click', function () {
    updateScores(p1, p2);
});

p2.button.addEventListener('click', function () {
    updateScores(p2, p1);

});

function reset() {

    isGameOver = false;
    for (let p of [p1, p2]) {
        p.score = 0;
        p.display.textContent = 0;
        p.display.classList.remove('has-text-success', 'has-text-danger');
        p.button.disabled = false;
        textSubtitle.innerText = 'Use the buttons below to keep score.';

    }
};

winningScoreSelect.addEventListener('change', function () {

    winningScore = parseInt(this.value);
    reset();
});

resetButton.addEventListener('click', reset);
