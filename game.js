const playerRadius = 10;
const speed = 5;
const fieldSize = 600;
const player = {
	x: fieldSize/2, y:fieldSize/2, hp:1
};
let startTime = -1;
const keyState = {
	w: false,
	a: false,
	s: false,
	d: false
};

let gameActive = false;
window.addEventListener("keydown", (e) => {
	switch(e.keyCode) {
		case 87 /*w*/: {
			gameActive = true;
			keyState.w = true;
			break;
		}
		case 83 /*s*/: {
			gameActive = true;
			keyState.s = true;
			break;
		}
		case 65 /*a*/: {
			gameActive = true;
			keyState.a = true;
			break;
		}
		case 68 /*d*/: {
			gameActive = true;
			keyState.d = true;
			break;
		}
	}
});

window.addEventListener("keyup", (e) => {
	switch(e.keyCode) {
		case 87 /*w*/: {
			keyState.w = false;
			break;
		}
		case 83 /*s*/: {
			keyState.s = false;
			break;
		}
		case 65 /*a*/: {
			keyState.a = false;
			break;
		}
		case 68 /*d*/: {
			keyState.d = false;
			break;
		}
	}
});

const fieldDom = document.getElementById("field");
const playerDom = document.getElementById("player");
const timerDom = document.getElementById("timer");
const render = () => {
	if (gameActive) {
		if (startTime < 0) {
			startTime = Date.now();
		}
		timerDom.innerText = `Score: ${Date.now() - startTime}`;

	}
	playerDom.style.left = `${player.x - playerDom.offsetWidth/2}px`;
	playerDom.style.top = `${player.y - playerDom.offsetHeight/2}px`;

};

const endGame = () => {
	gameActive = false;
	keyState.w = keyState.a = keyState.s = keyState.d = false;
	alert(`You died. Score: ${timerDom.innerText}`);
	startTime = -1;
};

const isGoku = () => document.getElementById("remove_saku").checked;

const renderSaku = () => {
	fieldDom.style.border = isGoku() ? "3px solid orangered" : "3px solid royalblue";
};

const movePlayer = () => {
	if(keyState.w) {
		player.y = player.y - speed;
	}
	if (keyState.s) {
		player.y = player.y + speed;
	}
	if (keyState.a) {
		player.x = player.x - speed;
	}
	if (keyState.d) {
		player.x = player.x + speed;
	}
	if (isGoku() && (player.x < 0 || player.x >= fieldSize || player.y < 0 || player.y >= fieldSize)) {
		endGame();
	}
	player.x = Math.max(0, player.x);
	player.x = Math.min(fieldSize, player.x);
	player.y = Math.max(0, player.y);
	player.y = Math.min(fieldSize, player.y);
}


setInterval(() => {
	if (gameActive) {
		EnemyGen.maybeAddEnemy(fieldDom);
		movePlayer();
		render();
	}
}, 17);
