const playerRadius = 10;
let speed = 4;
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
	q: false,
	space: false,
};
let initialized = false;

const cookies = {};
document.cookie.split(";").forEach((cookie) => {
	const [key, value] = cookie.split("=");
	if (key && value) {
		cookies[key] = value;
	}
});

const afterEverythingLoaded = () => {
	if (cookies["job"]) {
		Player.changeJob(cookies["job"]);
	}
	const dwuJob = getFromParamOrStorage("dwu_job");
	if (dwuJob) {
		document.getElementById("dwu_job").selectedIndex = parseInt(dwuJob);
	}
	const dwuRole = getFromParamOrStorage("dwu_role");
	if (dwuRole) {
		document.getElementById("dwu_role").selectedIndex = parseInt(dwuRole);
	}
	const timeSpeed = getFromParamOrStorage("timeSpeed");
	if (timeSpeed) {
		const timeSpeedElem = document.getElementById('timeSpeed');
		timeSpeedElem.selectedIndex = parseInt(timeSpeed);
		Time.setTimeSpeed(Number(timeSpeedElem.value));
	}
	const stage = getFromParamOrStorage("stage");
	if (stage) {
		document.getElementById("stage").selectedIndex = parseInt(stage);
	}
}

const getFromParamOrStorage = (key) => {
	const urlParams = new URLSearchParams(window.location.search);
	const queryParam = urlParams.get(key);
	if (queryParam) {
		return queryParam;
	} else {
		return window.localStorage.getItem(key);
	}
}

const onStageChange = (obj) => {
	const dwuJobSelect = document.getElementById("dwu_job");
	const dwuRoleSelect = document.getElementById("dwu_role");
	const wsOptions = document.getElementById("ws_options");
	if (obj.value == "dwu") {
		dwuJobSelect.style.visibility = "visible";
		dwuRoleSelect.style.visibility = "visible";
		wsOptions.style.display = "none";
	} else if (obj.value == "eyes") {
		dwuJobSelect.style.visibility = "visible";
		dwuRoleSelect.style.visibility = "hidden";
		wsOptions.style.display = "none";
	} else if (obj.value == "ws") {
		dwuJobSelect.style.visibility = "visible";
		dwuRoleSelect.style.visibility = "hidden";
		wsOptions.style.display = "initial";
	} else if (obj.value == "dt") {
		dwuJobSelect.style.visibility = "visible";
		dwuRoleSelect.style.visibility = "hidden";
		wsOptions.style.display = "none";
	} else {
		dwuJobSelect.style.visibility = "hidden";
		dwuRoleSelect.style.visibility = "hidden";
		wsOptions.style.display = "none";
	}
}

const initialize = () => {
	sprintRecast = 0;
	sprintBuff = 0;
	surecastRecast = 0;
	surecastBuff = 0;
	initialized = true;
	player.x = fieldSize/2;
	player.y = fieldSize/2;
	player.hp = 1;
	startTime = Date.now();
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
			e.preventDefault();
			break;
		}
		case 81: /*q*/{
			keyState.q = true;
			e.preventDefault();
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
			e.preventDefault();
			break;
		}
		case 81: /*q*/{
			keyState.q = false;
			e.preventDefault();
			break;
		}
	}
});

const fieldDom = document.getElementById("field");
const playerDom = document.getElementById("player");
const sprintBuffDom = document.getElementById("sprint-buff");
const sprintBuffTimeDom = document.getElementById("sprint-buff-time");
const abilitySprintTimeDom = document.getElementById("ability-sprint-time");
const surecastBuffDom = document.getElementById("surecast-buff");
const surecastBuffTimeDom = document.getElementById("surecast-buff-time");
const abilitySurecastTimeDom = document.getElementById("ability-surecast-time");
const timerDom = document.getElementById("timer");
const render = () => {
	timerDom.innerText = `Score: ${Date.now() - startTime}`;
	playerDom.style.left = `${player.x - playerDom.offsetWidth/2}px`;
	playerDom.style.top = `${player.y - playerDom.offsetHeight/2}px`;
	sprintBuffTimeDom.innerText = Math.floor(sprintBuff + 0.5);
	sprintBuffDom.style.display = sprintBuff > 0 ? 'block' : 'none';
	abilitySprintTimeDom.innerText = sprintRecast > 0 ? Math.floor(sprintRecast + 0.5) : '';
	surecastBuffTimeDom.innerText = Math.floor(surecastBuff + 0.5);
	surecastBuffDom.style.display = surecastBuff > 0 ? 'block' : 'none';
	abilitySurecastTimeDom.innerText = surecastRecast > 0 ? Math.floor(surecastRecast + 0.5) : '';
};

let sprintRecast = 0;
let sprintBuff = 0;
let surecastRecast = 0;
let surecastBuff = 0;
const endGame = () => {
	gameActive = false;
	initialized = false;
	keyState.w = keyState.a = keyState.s = keyState.d = false;
	if (stage === 'normal') {
		alert(`You died. ${timerDom.innerText}`);
	}

	// const stage = document.getElementById('stage').value;
	// if (stage === 'normal') {
	// 	LeaderBoard.sendScore(parseInt(timerDom.innerText.substr(7)));
	// }
};

const isGoku = () => document.getElementById("remove_saku").checked;

const renderSaku = () => {
	fieldDom.style.border = isGoku() ? "3px solid orangered" : "3px solid royalblue";
};

const movePlayer = (elapsedMilliSeconds) => {
	if (keyState.space && sprintRecast === 0) {
		sprintBuff = 10;
		sprintRecast = 60;
	}
	if (keyState.q && surecastRecast === 0) {
		surecastBuff = 6;
		surecastRecast = 120;
	}
	let actualSpeed = (sprintBuff > 0 ? speed * 1.3 : speed) * elapsedMilliSeconds / 1000 * 60;
	if ((keyState.w - keyState.s) && (keyState.a - keyState.d)) {
		actualSpeed /= Math.sqrt(2);
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

const tick = (elapsedMilliSeconds) => {
	sprintBuff = Math.max(0, sprintBuff - elapsedMilliSeconds / 1000);
	sprintRecast = Math.max(0, sprintRecast - elapsedMilliSeconds / 1000);
	surecastBuff = Math.max(0, surecastBuff - elapsedMilliSeconds / 1000);
	surecastRecast = Math.max(0, surecastRecast - elapsedMilliSeconds / 1000);
	const stage = document.getElementById('stage').value;
	switch (stage) {
		case 'e7s':
			EnemyGenE7S.maybeAddEnemy(fieldDom);
			break;
		case 'e12s':
			EnemyGenE12S.maybeAddEnemy(fieldDom);
			break;
		case 'dwu':
			EnemyGenDWU.maybeAddEnemy(fieldDom);
			break;
		case 'eyes':
			EnemyGenEyes.maybeAddEnemy();
			break;
		case 'ws':
			EnemyGenWS.maybeAddEnemy();
			break;
		case 'shikoku':
			EnemyGenShikoku.maybeAddEnemy();
			break;
		default:
			EnemyGen.maybeAddEnemy(fieldDom);
			break;
	}
}

let previousClock = window.performance.now();
setInterval(() => {
	const currentClock = window.performance.now();
	const elapsedMilliSeconds = currentClock - previousClock;
	previousClock = currentClock;
	if (gameActive) {
		tick(elapsedMilliSeconds);
		movePlayer(elapsedMilliSeconds);
		render();
	}
}, 17);
