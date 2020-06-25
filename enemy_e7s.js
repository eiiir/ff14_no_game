const EnemyGenE7S = {
   elemental: 0,
   pattern1: 0,
   pattern2: 0,
   pattern3: 0,
   phase: 0,
   redElemental: null,
   initialize: () => {
      EnemyGenE7S.setElemental(Math.floor(Math.random() * 2));
      EnemyGenE7S.pattern1 = Math.floor(Math.random() * 4);
      EnemyGenE7S.pattern2 = Math.floor(Math.random() * 2);
      EnemyGenE7S.pattern3 = Math.floor(Math.random() * 2);
      EnemyGenE7S.phase = 0;
   },
   setElemental: (elemental) => {
      EnemyGenE7S.elemental = elemental;
      if (elemental) { // darkness
         document.getElementById("holy-debuff").style.display = 'none';
         document.getElementById("darkness-debuff").style.display = 'block';
      } else {
         document.getElementById("holy-debuff").style.display = 'block';
         document.getElementById("darkness-debuff").style.display = 'none';
      }
   },
   maybeAddEnemy: () => {
      if (!initialized) {
         EnemyGenE7S.initialize();
         initialize();
      }
      EnemyGenE7S.addTimeline();
   },
   addTimeline: () => {
      // 0 0: 属性付与
      // 1 3: 後ろのゲート出現
      // 2 11: 0回目予兆
      // 3 15: 0回目着弾
      // 4 20: 1回目予兆
      // 5 24: 1回目着弾
      // 6 29: 2回目予兆&エラプション
      // 7 33: 2回目着弾
      // 8 38: 3回目予兆&属性変更
      // 9 42: 3回目着弾
      // 10 50: 時間切れ
      const time = Date.now() - startTime;
      const radius = 30
      const hitFunc = (px, py) => false;
      if (EnemyGenE7S.phase == 0) {
         const areas = [
            { left: fieldSize/4-1, top: 0, width: 2, height: fieldSize },
            { left: fieldSize/4*2-1, top: 0, width: 2, height: fieldSize },
            { left: fieldSize/4*3-1, top: 0, width: 2, height: fieldSize },
            { left: 0, top: fieldSize/4-1, width: fieldSize, height: 2 },
            { left: 0, top: fieldSize/4*2-1, width: fieldSize, height: 2 },
            { left: 0, top: fieldSize/4*3-1, width: fieldSize, height: 2 },
         ];
         areas.forEach(area => {
            const style = `left:${area.left}px;top:${area.top}px;height:${area.height}px;width:${area.width}px;background-color:rgba(56,56,128);z-index:1;display:inline-block;position:absolute;`;
            EnemyGenE7S.addEnemy(60000, style, hitFunc);
         });
         EnemyGenE7S.phase = 1;
      } else if (EnemyGenE7S.phase == 1 && time >= 3000) {
         EnemyGenE7S.addGate(10, 'red', 12000);
         EnemyGenE7S.addGate(9, 'blue', 12000);
         EnemyGenE7S.phase = 2;
      } else if (EnemyGenE7S.phase == 2 && time >= 11000) {
         EnemyGenE7S.addGate(0, EnemyGenE7S.pattern1 % 2 == 0 ? 'darkness' : 'holy', 4000);
         EnemyGenE7S.addGate(1, EnemyGenE7S.pattern1 < 2 ? 'darkness' : 'holy', 4000);
         EnemyGenE7S.addGate(2, EnemyGenE7S.pattern1 >= 2 ? 'darkness' : 'holy', 4000);
         EnemyGenE7S.addGate(3, EnemyGenE7S.pattern1 % 2 == 1 ? 'darkness' : 'holy', 4000);
         EnemyGenE7S.phase = 3;
      } else if (EnemyGenE7S.phase == 3 && time >= 15000) {
         EnemyGenE7S.addBeam(0, EnemyGenE7S.pattern1 % 2 == 0 ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(1, EnemyGenE7S.pattern1 < 2 ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(2, EnemyGenE7S.pattern1 >= 2 ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(3, EnemyGenE7S.pattern1 % 2 == 1 ? 'darkness' : 'holy');
         EnemyGenE7S.redElemental = EnemyGenE7S.pattern1 < 2;
         setTimeout(() => EnemyGenE7S.swapElemental(), 20);
         EnemyGenE7S.phase = 4;
      } else if (EnemyGenE7S.phase == 4 && time >= 20000) {
         EnemyGenE7S.addGate(1, EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(2, !EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(4, 'red', 4000);
         EnemyGenE7S.addGate(5, 'blue', 4000);
         EnemyGenE7S.addGate(6, 'red', 4000);
         EnemyGenE7S.addGate(7, 'blue', 4000);
         EnemyGenE7S.addGate(9, 'red', 4000);
         EnemyGenE7S.addGate(10, 'blue', 4000);
         EnemyGenE7S.addGate(12, EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(13, !EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(14, EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(15, !EnemyGenE7S.pattern2 ? 'blue' : 'red', 4000);
         EnemyGenE7S.phase = 5;
      } else if (EnemyGenE7S.phase == 5 && time >= 24000) {
         EnemyGenE7S.addBeam(1, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(2, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(4, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(5, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(6, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(7, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addDeadZone();
         EnemyGenE7S.redElemental = EnemyGenE7S.pattern2 ? EnemyGenE7S.redElemental : !EnemyGenE7S.redElemental;
         setTimeout(() => EnemyGenE7S.swapElemental(), 20);
         EnemyGenE7S.phase = 6;
      } else if (EnemyGenE7S.phase == 6 && time >= 29000) {
         EnemyGenE7S.addGate(1, EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(2, !EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(4, 'red', 4000);
         EnemyGenE7S.addGate(5, 'blue', 4000);
         EnemyGenE7S.addGate(6, 'red', 4000);
         EnemyGenE7S.addGate(7, 'blue', 4000);
         EnemyGenE7S.addGate(9, 'red', 4000);
         EnemyGenE7S.addGate(10, 'blue', 4000);
         EnemyGenE7S.addGate(12, EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(13, !EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(14, EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addGate(15, !EnemyGenE7S.pattern3 ? 'blue' : 'red', 4000);
         EnemyGenE7S.addEruption();
         EnemyGenE7S.phase = 7;
      } else if (EnemyGenE7S.phase == 7 && time >= 33000) {
         EnemyGenE7S.addBeam(1, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(2, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(4, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(5, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(6, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(7, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addDeadZone();
         EnemyGenE7S.redElemental = EnemyGenE7S.pattern3 ? EnemyGenE7S.redElemental : !EnemyGenE7S.redElemental;
         setTimeout(() => EnemyGenE7S.swapElemental(), 20);
         EnemyGenE7S.phase = 8;
      } else if (EnemyGenE7S.phase == 8 && time >= 38000) {
         EnemyGenE7S.addGate(4, 'red', 4000);
         EnemyGenE7S.addGate(5, 'blue', 4000);
         EnemyGenE7S.addGate(6, 'red', 4000);
         EnemyGenE7S.addGate(7, 'blue', 4000);
         EnemyGenE7S.addGate(9, 'red', 4000);
         EnemyGenE7S.addGate(10, 'blue', 4000);
         EnemyGenE7S.swapElemental();
         EnemyGenE7S.phase = 9;
      } else if (EnemyGenE7S.phase == 9 && time >= 42000) {
         EnemyGenE7S.addBeam(1, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(2, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(4, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(5, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(6, EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addBeam(7, !EnemyGenE7S.redElemental ? 'darkness' : 'holy');
         EnemyGenE7S.addDeadZone();
         setTimeout(() => EnemyGenE7S.swapElemental(), 20);
         EnemyGenE7S.phase = 10;
      } else if (EnemyGenE7S.phase == 10 && time >= 50000) {
         EnemyGenE7S.addTimeout();
         EnemyGenE7S.phase = 11;
      }
   },
   swapElemental() {
      EnemyGenE7S.setElemental(1 - EnemyGenE7S.elemental);
   },
   addGate(position, color, duration) {
      // position
      //    0  1  2  3
      // 15             4
      // 14             5
      // 13             6
      // 12             7
      //    11 10 9  8
      const radius = 20
      const hitFunc = (px, py) => false;
      const areas = [
         { left: fieldSize/8-radius, top: 0, width: radius*2, height: radius*2 },
         { left: fieldSize/4 + fieldSize/8-radius, top: 0, width: radius*2, height: radius*2 },
         { left: fieldSize/4*2 + fieldSize/8-radius, top: 0, width: radius*2, height: radius*2 },
         { left: fieldSize/4*3 + fieldSize/8-radius, top: 0, width: radius*2, height: radius*2 },
         { left: fieldSize-radius*2, top: fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: fieldSize-radius*2, top: fieldSize/4 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: fieldSize-radius*2, top: fieldSize/4*2 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: fieldSize-radius*2, top: fieldSize/4*3 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: fieldSize/4*3 + fieldSize/8-radius, top: fieldSize-radius*2, width: radius*2, height: radius*2 },
         { left: fieldSize/4*2 + fieldSize/8-radius, top: fieldSize-radius*2, width: radius*2, height: radius*2 },
         { left: fieldSize/4 + fieldSize/8-radius, top: fieldSize-radius*2, width: radius*2, height: radius*2 },
         { left: fieldSize/8-radius, top: fieldSize-radius*2, width: radius*2, height: radius*2 },
         { left: 0, top: fieldSize/4*3 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: 0, top: fieldSize/4*2 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: 0, top: fieldSize/4 + fieldSize/8-radius, width: radius*2, height: radius*2 },
         { left: 0, top: fieldSize/8-radius, width: radius*2, height: radius*2 },
      ];
      const area = areas[position];
      let backgroundColor = 'rgba(0, 0, 0, 0.7)';
      let borderColor = 'rgba(0, 0, 0)';
      switch (color) {
         case 'red':
            backgroundColor = 'rgba(200, 40, 40, 0.7)';
            borderColor = 'rgba(150, 20, 20)';
            break;
         case 'blue':
            backgroundColor = 'rgba(40, 40, 200, 0.7)';
            borderColor = 'rgba(20, 20, 150)';
            break;
         case 'holy':
            backgroundColor = 'rgba(200, 200, 200, 0.7)';
            borderColor = 'rgba(150, 150, 150)';
            break;
         case 'darkness':
            backgroundColor = 'rgba(40, 40, 40, 0.7)';
            borderColor = 'rgba(20), 20, 20)';
            break;
      }
      const style = `left:${area.left}px;top:${area.top}px;border-radius:${radius}px;height:${area.height}px;width:${area.width}px;background-color:${backgroundColor};z-index:1;display:inline-block;position:absolute;border:solid 1px ${borderColor};`;
      EnemyGenE7S.addEnemy(duration, style, hitFunc);
   },
   addBeam(position, color) {
      // position
      //    0  1  2  3
      // --             4
      // --             5
      // --             6
      // --             7
      //    -- -- -- --
      const dummyHitFunc = (px, py) => false;
      const elemental = color === 'darkness' ? 1 : 0;
      const areas = [
         { left: 0, top: 0, width: fieldSize/4, height: fieldSize },
         { left: fieldSize/4, top: 0, width: fieldSize/4, height: fieldSize },
         { left: fieldSize/4*2, top: 0, width: fieldSize/4, height: fieldSize },
         { left: fieldSize/4*3, top: 0, width: fieldSize/4, height: fieldSize },
         { left: 0, top: 0, width: fieldSize, height: fieldSize/4 },
         { left: 0, top: fieldSize/4, width: fieldSize, height: fieldSize/4 },
         { left: 0, top: fieldSize/4*2, width: fieldSize, height: fieldSize/4 },
         { left: 0, top: fieldSize/4*3, width: fieldSize, height: fieldSize/4 },
      ];
      const area = areas[position];
      const hitFunc = (px, py) => area.left <= px && px <= area.left + area.width && area.top <= py && py <= area.top + area.height && EnemyGenE7S.elemental == elemental;
      let backgroundColor = 'rgba(0, 0, 0, 0.3)';
      let borderColor = 'rgba(0, 0, 0)';
      switch (color) {
         /*
         case 'red':
            backgroundColor = 'rgba(200, 40, 40, 0.7)';
            borderColor = 'rgba(150, 20, 20)';
            break;
         case 'blue':
            backgroundColor = 'rgba(40, 40, 200, 0.7)';
            borderColor = 'rgba(20, 20, 150)';
            break;
         */
         case 'holy':
            backgroundColor = 'rgba(200, 200, 200, 0.3)';
            borderColor = 'rgba(150, 150, 150)';
            break;
         case 'darkness':
            backgroundColor = 'rgba(40, 40, 40, 0.3)';
            borderColor = 'rgba(20), 20, 20)';
            break;
      }
      const style = `left:${area.left}px;top:${area.top}px;height:${area.height}px;width:${area.width}px;background-color:${backgroundColor};z-index:1;display:inline-block;position:absolute;border:solid 1px ${borderColor};`;
      EnemyGenE7S.addEnemy(500, style, dummyHitFunc);
      EnemyGenE7S.addEnemy(10, style, hitFunc);
   },
   addDeadZone() {
      const style = `left:${fieldSize/4}px;top:${0}px;height:${fieldSize}px;width:${fieldSize/2}px;background-color:rgba(0,0,0,0);z-index:1;display:inline-block;position:absolute;`;
      const hitFunc = (px, py) => fieldSize/4 <= px && px <= fieldSize/4*3 && 0 <= py && py <= fieldSize;
      EnemyGenE7S.addEnemy(10, style, hitFunc);
   },
   addEruption: () => {
      const radius = fieldSize/8;
      const duration = 4000;
      const x = player.x, y = player.y;
      const style = `left:${x - radius}px;top:${y - radius}px;border-radius:${radius}px;height:${radius*2}px;width:${radius*2}px;background-color:rgba(255,165,0,0.3);z-index:1;display:inline-block;position:absolute;border-color:red;border:solid 1px red;`;
      const hitFunc = (px, py) => (px - x)**2 + (py - y)**2 < radius**2;
      EnemyGenE7S.addEnemy(duration, style, hitFunc);
   },
   addTimeout() {
      const style = `left:${0}px;top:${0}px;height:${fieldSize}px;width:${fieldSize}px;background-color:rgba(0,0,0,0);z-index:1;display:inline-block;position:absolute;`;
      const hitFunc = (px, py) => 0 <= px && px <= fieldSize && 0 <= py && py <= fieldSize;
      EnemyGenE7S.addEnemy(10, style, hitFunc);
   },
   addEnemy: (delay, style, hitFunc) => {
      const enemy = document.createElement("div");
      enemy.style = style;
      fieldDom.appendChild(enemy);
      const addedTime = Date.now();
      setTimeout(() => {
         if (gameActive && hitFunc(player.x, player.y)) {
            player.hp--;
            if (player.hp <= 0) {
               endGame();
               initialized = false;
            }
         }
         fieldDom.removeChild(enemy);
      }, delay);
   },
}