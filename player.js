const Player = {
	changeJob: (job) => {
		playerIconDom.src = `img/${job}.png`;
		document.cookie = `job=${job}; max-age=2419200`;
	},
	getCurrentJob: () => {
		return iconSelectDom.value;
	}
}

const iconSelectDom = document.getElementById("playerIconSelect");
iconSelectDom.addEventListener("change", (e) => Player.changeJob(e.target.value));

const playerIconDom = document.getElementById("playerIcon");
