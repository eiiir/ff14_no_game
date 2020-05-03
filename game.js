const playerRadius = 10;
const speed = 4;
const fieldSize = 600;
const player = {
	x: fieldSize/2, y:fieldSize/2, hp:1
};
let startTime = -1;
const keyState = {
	w: false,
	a: false,
	s: false,
	d: false,
	space: false,
};

const initialize = () => {
	sprintRecast = 0;
	sprintBuff = 0;
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
		case 32: /*space*/{
			keyState.space = true;
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
		case 32: /*space*/{
			keyState.space = false;
			break;
		}
	}
});

const fieldDom = document.getElementById("field");
const playerDom = document.getElementById("player");
const sprintBuffDom = document.getElementById("sprint-buff");
const sprintBuffTimeDom = document.getElementById("sprint-buff-time");
const abilitySprintTimeDom = document.getElementById("ability-sprint-time");
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
	sprintBuffTimeDom.innerText = Math.floor(sprintBuff + 0.5);
	sprintBuffDom.style.display = sprintBuff > 0 ? 'block' : 'none';
	abilitySprintTimeDom.innerText = sprintRecast > 0 ? Math.floor(sprintRecast + 0.5) : '';
};

let sprintRecast = 0;
let sprintBuff = 0;
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
	if (keyState.space && sprintRecast === 0) {
		sprintBuff = 15;
		sprintRecast = 60;
	}
	let actualSpeed = sprintBuff > 0 ? speed * 1.3 : speed;
	if ((keyState.w - keyState.s) && (keyState.a - keyState.d)) {
		actualSpeed /= Math.sqrt(2);
		console.log(actualSpeed);
	}
	if(keyState.w) {
		player.y = player.y - actualSpeed;
	}
	if (keyState.s) {
		player.y = player.y + actualSpeed;
	}
	if (keyState.a) {
		player.x = player.x - actualSpeed;
	}
	if (keyState.d) {
		player.x = player.x + actualSpeed;
	}
	if (isGoku() && (player.x < 0 || player.x >= fieldSize || player.y < 0 || player.y >= fieldSize)) {
		endGame();
	}
	player.x = Math.max(0, player.x);
	player.x = Math.min(fieldSize, player.x);
	player.y = Math.max(0, player.y);
	player.y = Math.min(fieldSize, player.y);
}

const tick = () => {
	sprintBuff = Math.max(0, sprintBuff - 1/60);
	sprintRecast = Math.max(0, sprintRecast - 1/60);
}

setInterval(() => {
	if (gameActive) {
		EnemyGen.maybeAddEnemy(fieldDom);
		movePlayer();
		tick();
		render();
	}
}, 17);
