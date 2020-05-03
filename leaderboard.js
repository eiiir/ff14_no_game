const LeaderBoard = {
    sendScore: (score) => {
        firebase.firestore().collection("score").add({ score: score }).then(docRef => {
            // success
        }).catch(error => {
            console.log("Failed to Send score.")
            console.log(error);
        });
    }
}

setTimeout(() => {
    const leaderboardDom = document.getElementById("leaderboard");
    firebase.firestore().collection("score").orderBy("score", "desc").limit(10).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const scoreObj = doc.data();
            leaderboardDom.innerText += `${scoreObj.name || 'No Name'} : ${scoreObj.score}\n`;
        });
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}, 1);