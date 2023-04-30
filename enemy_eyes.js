const EnemyGenEyes = {
  areas: [
    { x: 400, y: 200, label: "北東" },
    { x: 400, y: 400, label: "南東" },
    { x: 200, y: 400, label: "南西" },
    { x: 200, y: 200, label: "北西" },
    { label: "次交換（小）"},
    { label: "次交換（大）"},
    { label: "待機（小）"},    { label: "待機（大）"},
  ],
  phase: 0,
  dots: [],
  previousExpectedPositionIdx: null,
  currentExpectedPositionIdx: null,
  positionTolerance: Util.tile(2),
  aoeRadius: Util.tile(3),
  previousDiveIndexes: [],
  markers: [],

  getMyJob: () => {
      return document.getElementById("dwu_job").value;
  },

  partyMembers: [
      "Dancer",
      "Summoner",
      "RedMage",
      "Reaper",
      "Sage",
      "WhiteMage",
      "Paladin",
      "Warrior",
  ],

  initialize: () => {
    EnemyGenEyes.phase = 0;
    EnemyGenEyes.dots = [];
    EnemyGenEyes.previousExpectedPositionIdx = null;
    const myJob = EnemyGenEyes.getMyJob();
    EnemyGenEyes.currentExpectedPositionIdx = EnemyGenEyes.partyMembers.findIndex((job) => job == myJob);
    EnemyGenEyes.previousDiveIndexes = [];
    EnemyGenEyes.addMarkers();
  },

  addMarkers: () => {
    if (EnemyGenEyes.markers.length == 0) {
      EnemyGenEyes.areas.forEach(area => area.x ? EnemyGenEyes.markers.push(Util.addCircle(area.x, area.y, 5, "gray")) : undefined);
      //Target circles
      Util.strokeCircle(150, 300, Util.tile(3));
      Util.strokeCircle(150, 300, Util.tile(4));
      Util.strokeCircle(450, 300, Util.tile(3));
      Util.strokeCircle(450, 300, Util.tile(4));
    }
  },

  TL: {
    dive: () => {
        // ミラージュダイブ着弾
        EnemyGenEyes.assertPlayerPosition();
        const diveIndexes = EnemyGenEyes.randomIndexes();
        EnemyGenEyes.renderAoE(EnemyGenEyes.areas[diveIndexes[0]]);
        EnemyGenEyes.renderAoE(EnemyGenEyes.areas[diveIndexes[1]]);
        EnemyGenEyes.previousExpectedPositionIdx = EnemyGenEyes.currentExpectedPositionIdx;
        EnemyGenEyes.currentExpectedPositionIdx = EnemyGenEyes.nextExpectedPosition(EnemyGenEyes.currentExpectedPositionIdx, diveIndexes);
        EnemyGenEyes.previousDiveIndexes = diveIndexes;
    },
    startDots: () => {
      // 線受け取り人スタート
      const [idx0, idx1] = EnemyGenEyes.previousDiveIndexes;
      EnemyGenEyes.addDot(EnemyGenEyes.areas[idx0].x, EnemyGenEyes.areas[idx0].y);
      EnemyGenEyes.addDot(EnemyGenEyes.areas[idx1].x, EnemyGenEyes.areas[idx1].y);
    },
    checkLineExchange: () => {
      if (EnemyGenEyes.previousExpectedPositionIdx < 4) {
      // 線を受け渡す前に動いていないかのチェック
        const area = EnemyGenEyes.areas[EnemyGenEyes.previousExpectedPositionIdx];
        if (Util.distance(player.x, player.y, area.x, area.y) > EnemyGenEyes.positionTolerance) {
          alert(`線を受け渡す前に動きました`);
          endGame();
        }
      } else if (EnemyGenEyes.previousExpectedPositionIdx < 6) {
        // 線を交換しに行っているかのチェック
        const area = EnemyGenEyes.areas[EnemyGenEyes.currentExpectedPositionIdx];
        if (Util.distance(player.x, player.y, area.x, area.y) > EnemyGenEyes.positionTolerance) {
          alert(`線を受け渡しに${area.label}に行きませんでした`);
          endGame();
        }
      }
    },
  },

  renderAoE: ({x, y}) => {
    const aoe = Util.addCircle(x, y, EnemyGenEyes.aoeRadius);
    Util.removeLater(aoe, 1000);
  },

  maybeAddEnemy: () => {
    if(!initialized) {
      EnemyGenEyes.initialize();
      initialize();
    }
    EnemyGenEyes.addTimeline();
    EnemyGenEyes.moveDots();
  },

  addTimeline: () => {
    // ミラージュダイブ
    const tl = [
      { t: 3000, f: EnemyGenEyes.TL.dive },
      { t: 3500, f: EnemyGenEyes.TL.startDots },
      { t: 4500, f: EnemyGenEyes.TL.checkLineExchange },
      { t: 8000, f: EnemyGenEyes.TL.dive },
      { t: 8500, f: EnemyGenEyes.TL.startDots },
      { t: 9500, f: EnemyGenEyes.TL.checkLineExchange },
      { t: 11000, f: EnemyGenEyes.TL.dive },
      { t: 11500, f: EnemyGenEyes.TL.startDots },
      { t: 12500, f: EnemyGenEyes.TL.checkLineExchange },
      { t: 16000, f: EnemyGenEyes.TL.dive },
    ]
    const time = Date.now() - startTime;
    for (let i = 0; i < tl.length; i++) {
        const e = tl[i];
        if (i === EnemyGenEyes.phase && time >= e.t) {
          e.f();
          EnemyGenEyes.phase = i + 1;
          if (i === tl.length - 1) {
              gameActive = false;
              initialized = false;
          }
        }
    }
  },

  assertPlayerPosition: () => {
    if (EnemyGenEyes.currentExpectedPositionIdx < 4) {
      const area = EnemyGenEyes.areas[EnemyGenEyes.currentExpectedPositionIdx];
      if (Util.distance(player.x, player.y, area.x, area.y) > EnemyGenEyes.positionTolerance) {
        alert(`ミラージュダイブをぶちまけた可能性があります; ${area.label}にいないといけません。`);
        endGame();
      }
    } else {
      EnemyGenEyes.areas.forEach(area => {
        if (Util.distance(player.x, player.y, area.x, area.y) < EnemyGenEyes.aoeRadius) {
          alert(`${area.label}のミラージュダイブに巻き込まれた可能性があります`);
          endGame();
        }
      });
    }
  },

  nextExpectedPosition: (currentPositionIdx, diveIndexes) => {
    switch(currentPositionIdx) {
      case 7: //待機（小、大）
      case 6:
        return currentPositionIdx - 2;
      case 5: //次交換（小、大）
      case 4: 
        return diveIndexes[currentPositionIdx - 4];
      case 3:
        return diveIndexes[1] == 3 ? 7 : 3;
      case 2:
        return diveIndexes[0] == 2 ? 6
            : diveIndexes[1] == 2 ? 7
            : 2;
      case 1:
        return diveIndexes[0] == 1 ? 6
            : diveIndexes[1] == 1 ? 7
            : 1;
      case 0:
        return diveIndexes[0] == 0 ? 6 : 0;
    }
  },

  // Sorted in asceding order
  randomIndexes: () => {
    const idx0 = Math.floor(Math.random() * 4);
    const idx1 = Math.floor(Math.random() * 3);
    if (idx0 <= idx1) { 
      return [idx0, idx1 + 1];
    } else {
      return [idx1, idx0];
    }
  },

  addDot: (toX, toY) => {
    const dot = Util.addCircle(300, 300, 5, "purple");
    const duration = 1000;
    dot.vx = (toX - 300) / duration;
    dot.vy = (toY - 300) / duration;
    const now = Date.now();
    dot.createdAt = now;
    dot.removeAt = now + duration;
    dot.radius = 5;
    EnemyGenEyes.dots.push(dot);
  },

  moveDots: () => {
    // Looping backwards for popping items in the loop
    var i = EnemyGenEyes.dots.length - 1;
    const now = Date.now();
    while(i >= 0) {
      const dot = EnemyGenEyes.dots[i];
      if (now > dot.removeAt) {
        fieldDom.removeChild(dot);
        EnemyGenEyes.dots.splice(i, 1);
      } else {
        const elapsedTime = now - dot.createdAt;
        dot.style.left = `${Math.floor(dot.vx * elapsedTime) - dot.radius + 300 }px`;
        dot.style.top = `${Math.floor(dot.vy * elapsedTime) - dot.radius + 300 }px`;
      }
      i--;
    }
  },

};
