const EnemyGen = {
   maybeAddEnemy: () => {
      EnemyGen.addFireIII();
      EnemyGen.addEruption();
   },
   fireIIIAcc: 0,
   addFireIII: () => {
      const time = Date.now() - startTime;
      EnemyGen.fireIIIAcc += 0.05 + Math.min(0.8, time / 500000);
      const radius = 150;
      const duration = 3000;
      if (EnemyGen.fireIIIAcc >= 1) {
         EnemyGen.fireIIIAcc -= 1;
         const x = Math.floor(Math.random() * (fieldSize+radius*2)) - radius,
         y = Math.floor(Math.random() * (fieldSize+radius*2)) - radius;
         const style = `left:${x - radius}px;top:${y - radius}px;border-radius:${radius}px;height:${radius*2}px;width:${radius*2}px;background-color:rgba(255,255,0,0.7);z-index:1;display:inline-block;position:absolute;border-color:red;border:solid 1px red;`;
         const hitFunc = (px, py) => (px - x)**2 + (py - y)**2 < radius**2;
         EnemyGen.addEnemy(duration, style, hitFunc);
      }
   },
   EruptionAcc: 0,
   addEruption: () => {
      EnemyGen.EruptionAcc += 1/60;
      const radius = 150;
      const duration = 3000;
      if (EnemyGen.EruptionAcc >= 1) {
         EnemyGen.EruptionAcc -= 1;
         const x = player.x, y = player.y;
         const style = `left:${x - radius}px;top:${y - radius}px;border-radius:${radius}px;height:${radius*2}px;width:${radius*2}px;background-color:rgba(255,255,0,0.7);z-index:1;display:inline-block;position:absolute;border-color:red;border:solid 1px red;`;
         const hitFunc = (px, py) => (px - x)**2 + (py - y)**2 < radius**2;
         EnemyGen.addEnemy(duration, style, hitFunc);
      }

   },
   addEnemy: (delay, style, hitFunc) => {
      const enemy = document.createElement("div");
      enemy.style = style;
      fieldDom.appendChild(enemy);
      const addedTime = Date.now();
      const intervalId = setInterval(() => {
         enemy.style.backgroundColor = `rgba(255, ${Math.floor(255 - 255 * (Date.now() - addedTime) / delay)}, 0, 0.7)`; 
      }, 100)
      setTimeout(() => {
         if (gameActive && hitFunc(player.x, player.y)) {
            player.hp--;
            if (player.hp <= 0) {
               gameActive = false;
               keyState.w = keyState.a = keyState.s = keyState.d = false;
               alert(`You died. Score: ${timerDom.innerText}`);
               startTime = -1
            }
         }
         fieldDom.removeChild(enemy);
         clearInterval(intervalId);
      }, delay);
   },
}