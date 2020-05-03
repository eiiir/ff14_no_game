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
	playerDom.style.left = `${player.x - playerRadius}px`;
	playerDom.style.top = `${player.y - playerRadius}px`;
};

const enemyRate = 0.12;
const enemyRadius = 150;
const enemyDuration = 3000;
const enemyStyle = (x, y) => `left:${x - enemyRadius}px;top:${y - enemyRadius}px;border-radius:${enemyRadius}px;height:${enemyRadius*2}px;width:${enemyRadius*2}px;background-color:orange;z-index:1;display:inline-block;position:absolute;border-color:red;border:solid 1px red;`;
const maybeAddEnemy = () => {
	if (Math.random() < enemyRate) {
		const x = Math.floor(Math.random() * (fieldSize+400)) - 200,
		 y = Math.floor(Math.random() * (fieldSize+400)) - 200;
		const enemy = document.createElement("div");
		enemy.style = enemyStyle(x, y);
		fieldDom.appendChild(enemy);
		setTimeout(() => {
			if (gameActive && (player.x - x)**2 + (player.y - y)**2 < enemyRadius**2) {
				player.hp--;
				if (player.hp <= 0) {
					gameActive = false;
					keyState.w = keyState.a = keyState.s = keyState.d = false;
					alert(`You died. Score: ${timerDom.innerText}`);
					startTime = -1
				} 
			}
			fieldDom.removeChild(enemy);
		}, enemyDuration);
	}
}

const movePlayer = () => {
	if(keyState.w) {
		player.y = Math.max(0, player.y - speed); 
	}
	if (keyState.s) {
		player.y = Math.min(fieldSize, player.y + speed)
	}
	if (keyState.a) {
		player.x = Math.max(0, player.x - speed);
	}
	if (keyState.d) {
		player.x = Math.min(fieldSize, player.x + speed);
	}
	console.log(keyState);
}


setInterval(() => {
	if (gameActive) {
		maybeAddEnemy();
		movePlayer();
		render();
	}
}, 17);
