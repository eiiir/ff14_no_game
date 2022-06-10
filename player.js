const iconSelectDom = document.getElementById("playerIconSelect");
iconSelectDom.addEventListener("change", (e) => Player.changeJob(e.target.value));

const playerIconDom = document.getElementById("playerIcon");

const Player = {
	changeJob: (job) => {
		playerIconDom.src = `img/${job}.png`;
		Player.currentJob = job;
		document.cookie = `job=${job}; max-age=2419200`;
	},
	currentJob: iconSelectDom.value,
	changeDWUJob: (job) => {
		document.getElementById("dwu_job").selectedIndex =
		  parseInt(window.localStorage.getItem("dwu_job"));
	},
	changeDWURole: (role) => {
		document.getElementById("dwu_role").selectedIndex =
		parseInt(window.localStorage.getItem("dwu_role"));
	}
}
