
// WS = Wind Spear (至天の陣：風槍)
const EnemyGenWS = {
  partyMembers: [
      "Warrior",
      "Paladin",
      "WhiteMage",
      "Sage",
      "Reaper",
      "RedMage",
      "Summoner",
      "Dancer"
  ],
  leftSpiralPearceOrigin: [200, 40],
  rightSpiralPearceOrigin: [400, 40],
  twisterLocations: [[20, 300], [200, 560], [400, 560], [560, 150]],
  grinoLocationNorth: [300, 150], //適当
  grinoLocationSouth: [300, 450], //適当
  elementsToBeRemovedOnInit: [],
  phase: 0,
  partyListDiv: undefined,
  castDiv: undefined,
  cast2Div: undefined,
  activeAoEs: undefined,
  dots: [],
  flags: {},
  timeline: [],
  heavenLiquidPos: [null, null, null, null, null],

  initialize: () => {
    EnemyGenWS.phase = 0;
    EnemyGenWS.partyListDiv = undefined;
    EnemyGenWS.castDiv = undefined;
    EnemyGenWS.cast2Div = undefined;
    EnemyGenWS.activeAoEs = [];
    EnemyGenWS.dots = [];
    fieldDom.style.borderRadius = "50%";
    document.getElementById("target-skywardleap").style.display = 'none';
    document.getElementById("target-cauterize").style.display = 'none';
    for (dom of fieldDom.childNodes) {
      if (dom != timerDom && dom != playerDom) {
        fieldDom.removeChild(dom);
      }
    }

    // 床の模様
    Util.addDonut(300, 300, Math.round(300/9), Math.round(300/9*2), "#ccc");
    Util.addDonut(300, 300, Math.round(300/9*5), Math.round(300/9*6), "#ccc");
    for (var i = 1; i < 9; i++) {
      let width = [1,2,5,6].includes(i) ? 6 : 1;
      let r = Math.round(300/9*i);
      Util.strokeCircle(300, 300, r, width, "#777");
    }
    for (var j = 0; j < 24; j++) {
      EnemyGenWS.addLine(j);
      EnemyGenWS.addLine2(j);
    }

    EnemyGenWS.initFlags();
    EnemyGenWS.elementsToBeRemovedOnInit.forEach(it => it.remove());
    EnemyGenWS.elementsToBeRemovedOnInit = [];
    EnemyGenWS.addPartyList();
    EnemyGenWS.addFieldMarkers();
    EnemyGenWS.addCastBar();
    EnemyGenWS.addCastBar2();
    EnemyGenWS.initTimeline();
    speed = 1.7; // <- 適当 please fix
  },

  addLine: (rot) => {
    const line = document.createElement("div");
    line.style.width = `300px`;
    line.style.height = `0.5px`;
    line.style.backgroundColor = "#777";
    line.style.left = `300px`;
    line.style.top = `299px`;
    line.style.display = "inline-block";
    line.style.position = "absolute";
    line.style.transformOrigin = "left center";
    line.style.transform = `rotate(${rot * 15}deg)`;
    fieldDom.appendChild(line);
  },

  // 外側の短い線
  addLine2: (rot) => {
    const line = document.createElement("div");
    line.style.width = `300px`;
    line.style.height = `1px`;
    line.style.backgroundColor = "rgba(0,0,0,0)";
    line.style.left = `300px`;
    line.style.top = `299px`;
    line.style.display = "inline-block";
    line.style.position = "absolute";
    line.style.transformOrigin = "left center";
    line.style.transform = `rotate(${rot * 15 + 7.5}deg)`;

    const actualLine = document.createElement("div");
    actualLine.style.width = `100px`;
    actualLine.style.height = `0.5px`;
    actualLine.style.backgroundColor = "#aaa";
    actualLine.style.left = `200px`;
    actualLine.style.display = "inline-block";
    actualLine.style.position = "relative";
    line.appendChild(actualLine);

    fieldDom.appendChild(line);
  },

  initFlags: () => {
    const flags = {};
    // Spiral pearce & Skyward leap
    const rand_line = Math.random();
    if (rand_line < (1/8)) {
      flags.leftSpiralPearceTarget = true;
    } else if (rand_line < (2/8)) {
      flags.rightSpiralPearceTarget = true;
    } else if (rand_line < (3/8)) {
      flags.skywardLeapTarget = true;
    }

    // Position of Empty Dimension
    flags.emptyDimensionIsNorth = Math.random() < 0.5 ? true : false;

    // Cauterize
    flags.cautarizeTarget = Math.random() < (1/8) ? true : false;

    // Heaven liquid
    flags.heavenLiquidTarget = Math.random() < (1/8) ? true : false;

    flags.AlterFlareTarget = Math.random() < (1/8) ? true : false;

    // Thunder wing
    flags.thunderWingTargets = Util.shuffle([...EnemyGenWS.partyMembers]).slice(0, 2);

    const forcedFlags = EnemyGenWS.getForcedFlags();
    console.debug("forcedFlags: ", forcedFlags);
    EnemyGenWS.flags = {
      ...flags,
      ...forcedFlags,
    };
    EnemyGenWS.flags.thunderWingTargets.sort((a, b) => EnemyGenWS.partyMembers.indexOf(a) - EnemyGenWS.partyMembers.indexOf(b));
    console.debug("flags: ", EnemyGenWS.flags);
  },

  getForcedFlags: () => {
    const forcedFlags = {};
    const lineElem = document.getElementById("ws_option_line");
    switch (lineElem.value) {
      case "left": {
        forcedFlags.leftSpiralPearceTarget = true;
        forcedFlags.rightSpiralPearceTarget = false;
        forcedFlags.skywardLeapTarget = false;
        break;
      }
      case "right": {
        forcedFlags.leftSpiralPearceTarget = false;
        forcedFlags.rightSpiralPearceTarget = true;
        forcedFlags.skywardLeapTarget = false;
        break;
      }
      case "skyward": {
        forcedFlags.leftSpiralPearceTarget = false;
        forcedFlags.rightSpiralPearceTarget = false;
        forcedFlags.skywardLeapTarget = true;
        break;
      }
      case "no": {
        forcedFlags.leftSpiralPearceTarget = false;
        forcedFlags.rightSpiralPearceTarget = false;
        forcedFlags.skywardLeapTarget = false;
        break;
      }
    }
    const cautarizeElem = document.getElementById("ws_option_cauterize");
    switch(cautarizeElem.value) {
      case "yes": {
        forcedFlags.cautarizeTarget = true;
        break;
      }
      case "no": {
        forcedFlags.cautarizeTarget = false;
        break;
      }
    }

    const emptyDimentionElem = document.getElementById("ws_option_empty_dimention");
    switch(emptyDimentionElem.value) {
      case "north": {
        forcedFlags.emptyDimensionIsNorth = true;
        break;
      }
      case "south": {
        forcedFlags.emptyDimensionIsNorth = false;
        break;
      }
    }

    const heavenLiquidElem = document.getElementById("ws_option_heaven_liquid");
    switch(heavenLiquidElem.value) {
      case "yes": {
        forcedFlags.heavenLiquidTarget = true;
        break;
      }
      case "no": {
        forcedFlags.heavenLiquidTarget = false;
        break;
      }
    }

    const thunderWingElem = document.getElementById("ws_option_thunderWing");
    const myJob = EnemyGenWS.getMyJob();
    switch(thunderWingElem.value) {
      case "yes": {
        const twoMembers = Util.shuffle([...EnemyGenWS.partyMembers]).slice(0, 2);
        forcedFlags.thunderWingTargets = [myJob, twoMembers[0] == myJob ? twoMembers[1] : twoMembers[0]];
        break;
      }
      case "no": {
        const shuffledMembers = Util.shuffle([...EnemyGenWS.partyMembers]);
        shuffledMembers.splice(shuffledMembers.indexOf(myJob), 1);
        forcedFlags.thunderWingTargets = shuffledMembers.slice(0, 2);
        break;
      }
    }

    return forcedFlags;
  },

  addPartyList: () => {
    const partyList = document.createElement("div");

    const addJob = (job) => {
        const partyMemberDiv = document.createElement("div");
        const jobIcon = document.createElement("img");
        jobIcon.src = `img/jobIcons/${job}.png`;
        jobIcon.style.width = "50px";
        partyMemberDiv.appendChild(jobIcon);
        partyMemberDiv.setAttribute('data-job', job);
        partyList.appendChild(partyMemberDiv);
    };

    const myJob = EnemyGenWS.getMyJob();
    addJob(myJob);

    for (let i = 0; i < 8; i++) {
        const job = EnemyGenWS.partyMembers[i];
        if (job != myJob) {
            addJob(job);
        }
    }

    partyList.style.width = `200px`;
    partyList.style.left = 620;
    partyList.style.top = 140;
    partyList.style.display = "inline-block";
    partyList.style.position = "absolute";
    EnemyGenWS.partyListDiv = partyList;
    fieldDom.appendChild(partyList);
  },

  addFieldMarkers: () => {
    const markers = [
      { x: 300, y:   0, name: "A" },
      { x: 520, y:  80, name: "1" },
      { x: 600, y: 300, name: "B" },
      { x: 520, y: 520, name: "2" },
      { x: 300, y: 600, name: "C" },
      { x:  80, y: 520, name: "3" },
      { x:   0, y: 300, name: "D" },
      { x:  80, y:  80, name: "4" },
    ];
    const width = 50;
    for (const m of markers) {
      const element = document.createElement("img");
      element.src = `img/field_marker_${m.name}.png`;
      element.style.width = width;
      element.style.position = "absolute";
      element.style.left = m.x - width / 2;
      element.style.top = m.y - width / 2;
      fieldDom.appendChild(element);
    }
  },

  getMyJob: () => {
    return document.getElementById("dwu_job").value;
  },

  addCastBar: () => {
    const castDiv = document.createElement("div");
    const castName = document.createElement("div");
    castName.style.width = "400px";
    castName.style.height = "30px";
    const castBar = document.createElement("div");
    castBar.style.width = "400px";
    castBar.style.height = "20px";
    castBar.style.border = "1px solid rgba(0, 0, 0, 1)";
    castBar.style.backgroundColor = "rgba(0, 0, 0, 0)";
    castDiv.appendChild(castName);
    castDiv.appendChild(castBar);

    castDiv.style.width = `200px`;
    castDiv.style.left = 620;
    castDiv.style.top = 20;
    castDiv.style.display = "inline-block";
    castDiv.style.position = "absolute";
    EnemyGenWS.castDiv = castDiv;
    fieldDom.appendChild(castDiv);
  },

  addCastBar2: () => {
    const castDiv = document.createElement("div");
    const castName = document.createElement("div");
    castName.style.width = "270px";
    castName.style.height = "20px";
    const castBar = document.createElement("div");
    castBar.style.width = "270px";
    castBar.style.height = "12px";
    castBar.style.border = "1px solid rgba(0, 0, 0, 1)";
    castBar.style.backgroundColor = "rgba(0, 0, 0, 0)";
    castDiv.appendChild(castName);
    castDiv.appendChild(castBar);

    castDiv.style.width = `200px`;
    castDiv.style.left = 620;
    castDiv.style.top = 100;
    castDiv.style.display = "inline-block";
    castDiv.style.position = "absolute";
    EnemyGenWS.cast2Div = castDiv;
    fieldDom.appendChild(castDiv);
  },

  startCast: (name, duration) => {
    const castName = EnemyGenWS.castDiv.children[0];
    const castBar = EnemyGenWS.castDiv.children[1];
    castName.textContent = name;
    const CastStartTime = Date.now();
    const interval = setInterval(() => {
        const progress = (Date.now() - CastStartTime) / duration;
        if (progress >= 0 && progress < 1) {
            const p100 = Math.floor(progress * 1000) / 10;
            castBar.style.backgroundImage =
              `linear-gradient(` +
              `to right,` +
              `rgba(255, 0, 0, 1),` +
              `rgba(255, 0, 0, 1) ${p100}%,` +
              `rgba(0, 0, 0, 0) ${p100}%,` +
              `rgba(0, 0, 0, 0) 100%)`;
        }
        if (progress >= 1) {
            clearInterval(interval);
            castName.textContent = "";
            castBar.style.backgroundImage = null;
        }
    }, 1000/30); // 30 FPS
  },

  startCast2: (name, duration) => {
    const castName = EnemyGenWS.cast2Div.children[0];
    const castBar = EnemyGenWS.cast2Div.children[1];
    castName.textContent = name;
    const CastStartTime = Date.now();
    const interval = setInterval(() => {
        const progress = (Date.now() - CastStartTime) / duration;
        if (progress >= 0 && progress < 1) {
            const p100 = Math.floor(progress * 1000) / 10;
            castBar.style.backgroundImage =
              `linear-gradient(` +
              `to right,` +
              `rgba(255, 0, 0, 1),` +
              `rgba(255, 0, 0, 1) ${p100}%,` +
              `rgba(0, 0, 0, 0) ${p100}%,` +
              `rgba(0, 0, 0, 0) 100%)`;
        }
        if (progress >= 1) {
            clearInterval(interval);
            castName.textContent = "";
            castBar.style.backgroundImage = null;
        }
    }, 1000/30); // 30 FPS
  },

  checkAlive: () => {
    const x = Util.pixelToMeter(player.x - 300);
    const y = Util.pixelToMeter(player.y - 300);

    // 外周
    if (x*x + y*y > 20*20) {
        endGame();
    }

    const remainingAoEs = [];
    for (const aoe of EnemyGenWS.activeAoEs) {
        if (aoe.collision(player.x, player.y)) {
            if (aoe.reason) {
                alert(aoe.reason);
            }
            endGame();
        }
        if (aoe.removeAt && (Date.now() < aoe.removeAt)) {
          remainingAoEs.push(aoe);
        }
    }
    EnemyGenWS.activeAoEs = remainingAoEs;
  },

  maybeAddEnemy: () => {
    if (!initialized) {
      EnemyGenWS.initialize();
      initialize();
    }
    EnemyGenWS.addTimeline();
    EnemyGenWS.checkAlive();
    EnemyGenWS.moveDots();
  },

  addDot: (fromX, fromY, toX, toY, duration, color = "purple") => {
    const dot = Util.addCircle(fromX, fromY, 5, color);
    dot.vx = (toX - fromX) / duration;
    dot.vy = (toY - fromY) / duration;
    const now = Date.now();
    dot.createdAt = now;
    dot.removeAt = now + duration;
    dot.radius = 5;
    dot.x = dot.fromX = 300;
    dot.y = dot.fromY = 300;
    EnemyGenWS.dots.push(dot);
    return dot;
  },

  moveDots: () => {
    // Looping backwards for popping items in the loop
    var i = EnemyGenWS.dots.length - 1;
    const now = Date.now();
    while(i >= 0) {
      const dot = EnemyGenWS.dots[i];
      if (now > dot.removeAt) {
        fieldDom.removeChild(dot);
        EnemyGenWS.dots.splice(i, 1);
      } else {
        const elapsedTime = now - dot.createdAt;
        dot.x = dot.vx * elapsedTime + dot.fromX;
        dot.y = dot.vy * elapsedTime + dot.fromY;
        dot.style.left = `${Math.floor(dot.x) - dot.radius }px`;
        dot.style.top = `${Math.floor(dot.y) - dot.radius }px`;
      }
      i--;
    }
  },

  addthunderWingDebuf: () => {
    for (let i = 0; i < 8; i++) {
      const partyMemberDiv = EnemyGenWS.partyListDiv.children[i];
      const job = partyMemberDiv.getAttribute('data-job');
      if (!EnemyGenWS.flags.thunderWingTargets.includes(job)) {
        continue;
      }
      const debuffIcon = document.createElement("img");
      debuffIcon.src = `img/thunderWing.png`;
      debuffIcon.style.height = "50px";
      partyMemberDiv.appendChild(debuffIcon);
      EnemyGenWS.elementsToBeRemovedOnInit.push(debuffIcon);
    }
  },

  initTimeline: () => {
    const event = (t, f) => ({ t, f });
    const tl = [
      event(1000, () => {
        // ツイスターダイブ詠唱開始
        EnemyGenWS.startCast("ツイスターダイブ", 6000);

        // スパイラルピアスの線がつく
        if (EnemyGenWS.flags.leftSpiralPearceTarget) {
          Util.maintainLineBetween(
            () => [player.x, player.y],
            () => EnemyGenWS.leftSpiralPearceOrigin,
            () => (Date.now() - startTime > 7000)
          );
        } else {
          // static dot & line
          EnemyGenWS.addDot(300, 300, 300, 300, 1000);
          Util.maintainLineBetween(
            () => [300, 300],
            () => EnemyGenWS.leftSpiralPearceOrigin,
            () => (Date.now() - startTime > 2000)
          );
        }
        if (EnemyGenWS.flags.rightSpiralPearceTarget) {
          Util.maintainLineBetween(
            () => [player.x, player.y],
            () => EnemyGenWS.rightSpiralPearceOrigin,
            () => (Date.now() - startTime > 7000)
          );
        } else {
          // static dot & line
          EnemyGenWS.addDot(300, 300, 300, 300, 1000);
          Util.maintainLineBetween(
            () => [300, 300],
            () => EnemyGenWS.rightSpiralPearceOrigin,
            () => (Date.now() - startTime > 2000)
          );
        }
        if (EnemyGenWS.flags.skywardLeapTarget) {
          document.getElementById("target-skywardleap").style.display = 'block';
        }
      }),
      event(2000, () => {
        // Start dots
        if (!EnemyGenWS.flags.leftSpiralPearceTarget) {
          const dot = EnemyGenWS.addDot(300, 300, 400, 560, 5000);
          Util.maintainLineBetween(
            () => [dot.x, dot.y],
            () => EnemyGenWS.leftSpiralPearceOrigin,
            () => (Date.now() - startTime > 7000)
          );
        }
        if (!EnemyGenWS.flags.rightSpiralPearceTarget) {
          const dot = EnemyGenWS.addDot(300, 300, 200, 560, 5000);
          Util.maintainLineBetween(
            () => [dot.x, dot.y],
            () => EnemyGenWS.rightSpiralPearceOrigin,
            () => (Date.now() - startTime > 7000)
          );
        }
      }),
      event(6000, () => {
        // サンダーウイングのデバフつく
        EnemyGenWS.addthunderWingDebuf();
      }),
      event(7000, () => {
        // ツイスターダイブ着弾
        if (EnemyGenWS.flags.leftSpiralPearceTarget) {
          EnemyGenWS.activeAoEs.push(Util.donutAoE(400, 560, 50, Util.tile(999), 'スパイラルピアスをまき散らしました'));
          const aoeDiv = Util.addCircle(400, 560, 50, "lightblue");
          Util.removeLater(aoeDiv, 1000);
        } else if (EnemyGenWS.flags.rightSpiralPearceTarget) {
          EnemyGenWS.activeAoEs.push(Util.donutAoE(200, 560, 50, Util.tile(999), 'スパイラルピアスをまき散らしました'));
          const aoeDiv = Util.addCircle(200, 560, 50, "lightblue");
          Util.removeLater(aoeDiv, 1000);
        } else if (EnemyGenWS.flags.skywardLeapTarget) {
          const expectedPos = Util.polar(300, -Math.PI / 8);
          EnemyGenWS.activeAoEs.push(Util.donutAoE(expectedPos.x, expectedPos.y, 50, Util.tile(999), 'スカイワードリープをまき散らしました'));
          const aoeDiv = Util.addCircle(expectedPos.x, expectedPos.y, 50, "lightblue");
          Util.removeLater(aoeDiv, 1000);
          document.getElementById("target-skywardleap").style.display = 'none';
        } else {
          EnemyGenWS.activeAoEs.push(Util.donutAoE(15, 300, 50, Util.tile(999), 'ツイスターを変なところに捨てました'));
          const aoeDiv = Util.addCircle(15, 300, 50, "lightblue");
          Util.removeLater(aoeDiv, 1000);
        }
        // TODO：スパイラルピアス、ツイスターダイブの当たり判定を実装
        // 多分無くても上のassertで死ぬので一旦省略 
        if (!EnemyGenWS.flags.skywardLeapTarget) {
          EnemyGenWS.activeAoEs.push(Util.circleAoE(560, 150, 350, 'スカイワードリープに巻き込まれました'));
        }
        const skywardLeapAoEElement = Util.addCircle(560, 150, 350);
        Util.removeLater(skywardLeapAoEElement, 200);

        // カータライズマーカー発生
        if (EnemyGenWS.flags.cautarizeTarget) {
          document.getElementById("target-cauterize").style.display = 'block';
        }
        // グリノー＆シャリベル登場
        const grinoLocation = EnemyGenWS.flags.emptyDimensionIsNorth ? EnemyGenWS.grinoLocationNorth : EnemyGenWS.grinoLocationSouth;
        const shariLocation = EnemyGenWS.flags.emptyDimensionIsNorth ? EnemyGenWS.grinoLocationSouth : EnemyGenWS.grinoLocationNorth;
        const grino = Util.addImage("./img/grinnaux.png", grinoLocation[0], grinoLocation[1], 150, 150);
        const sharibel = Util.addImage("./img/charibert.png", shariLocation[0], shariLocation[1], 120, 120);
        EnemyGenWS.elementsToBeRemovedOnInit.push(grino);
        EnemyGenWS.elementsToBeRemovedOnInit.push(sharibel);
        const grinoDot = Util.addCircle(grinoLocation[0], grinoLocation[1], 5, "red");
        const shariDot = Util.addCircle(shariLocation[0], shariLocation[1], 5, "red");
        EnemyGenWS.elementsToBeRemovedOnInit.push(grinoDot);
        EnemyGenWS.elementsToBeRemovedOnInit.push(shariDot);
      }),
      event(8000, () => {
        //ツイスター発生
        for (const [x, y] of EnemyGenWS.twisterLocations) {
          const circle = Util.addCircle(x, y, 20, "darkgreen");
          Util.removeLater(circle, 5000);
          EnemyGenWS.activeAoEs.push(
            Util.circleAoE(x, y, 20, "ツイスターに近づきすぎました", 5000)
          );
        }
      }),
      event(9000, () => {
        // アスカロンメルシー詠唱開始
        EnemyGenWS.startCast("レベレーション・アスカロンメルシー", 4000);
      }),
      event(13000, () => {
        // アスカロンメルシー
        const tolerance = 15;

        const merciAngle = () => {
          if (EnemyGenWS.flags.cautarizeTarget) {
            return EnemyGenWS.flags.emptyDimensionIsNorth ? -90 : 90;
          }
          if (EnemyGenWS.flags.skywardLeapTarget) {
            return 45; // 右上
          }
          if (EnemyGenWS.flags.leftSpiralPearceTarget) {
            return 0; // 右
          }
          if (EnemyGenWS.flags.rightSpiralPearceTarget) {
            return -45; // 右下
          }
          return 180/12*11; // TODO: ランダム。ひとまず２番め固定
        }

        const expectedAngle = merciAngle();
        console.log(expectedAngle);
        const actualAngle = -Math.atan2(player.y - 300, player.x - 300) / Math.PI * 180; // X軸との角度 [-180, 180]
        const diffAngle = (x, y) => { return (x - y + 540) % 360 - 180 }; // [-180, 180]
        var diffToLeft = diffAngle((expectedAngle + tolerance), actualAngle); // [-180, 180] 
        var diffToRight = diffAngle((expectedAngle - tolerance), actualAngle); // [-180, 180] 
        EnemyGenWS.activeAoEs.push({
          collision: () => diffToLeft < 0 || diffToRight > 0,
          reason: `アスカロンメルシーをぶちまけました${EnemyGenWS.flags.cautarizeTarget ? "（カータライズ時）" : ""}`
        });
        // アスカロンメルシーのAOEを描画
        const angles = [45, 0, -45, -90, 180/12*9, actualAngle, -180/12*9, -180/12*11]
        for (const angle of angles) {
          const aoe = Util.addPiecut(300, 300, 500, (90 - angle + 540) % 360 - 180, 28);
          Util.removeLater(aoe, 500);
        }

        // ヘヴンリキッドの位置予約
        EnemyGenWS.heavenLiquidPos[0] = [player.x, player.y];
      }),
      event(14000, () => {
        // ヘヴンリキッド1発目
        EnemyGenWS.addHeavenLiquid(0);
        // アルターフレア1発目
        EnemyGenWS.addAlterFlare(0);
        if (EnemyGenWS.flags.cautarizeTarget) {
          // カータライズ位置確定
          document.getElementById("target-cauterize").style.display = 'none';
          // カータライズの捨て場所チェック
          const y = EnemyGenWS.flags.emptyDimensionIsNorth ? 550 : 50;
          EnemyGenWS.activeAoEs.push(
            Util.donutAoE(300, y, 100, 1000, "カータライズを変なところに捨てました")
          );
          const aoeDiv = Util.addCircle(300, y, 100, "lightblue");
          Util.removeLater(aoeDiv, 1000);
        }
      }),
      event(15000, () => {
        // エンプティディメンション詠唱開始
        EnemyGenWS.startCast("エンプティディメンション", 5000);
        // ヘヴンリキッド2発目
        EnemyGenWS.addHeavenLiquid(1);
        // アルターフレア2発目
        EnemyGenWS.addAlterFlare(1);
      }),
      event(16000, () => {
        // ヘヴンリキッド3発目
        EnemyGenWS.addHeavenLiquid(2);
        // アルターフレア3発目
        EnemyGenWS.addAlterFlare(2);
      }),
      event(17000, () => {
        // ヘヴンリキッド4発目
        EnemyGenWS.addHeavenLiquid(3);
        // アルターフレア4発目
        EnemyGenWS.addAlterFlare(3);
      }),
      event(18000, () => {
        // ヘヴンリキッド5発目
        EnemyGenWS.addHeavenLiquid(4);
      }),
      event(19500, () => {
        // エンプティディメンションAOE描画
        const [centerX, centerY] = EnemyGenWS.flags.emptyDimensionIsNorth ? EnemyGenWS.grinoLocationNorth : EnemyGenWS.grinoLocationSouth;
        const aoeDiv = Util.addDonut(centerX, centerY, 75, 1000);
        Util.removeLater(aoeDiv, 1000);
      }),
      event(20000, () => {
        // エンプティディメンション着弾
        const [centerX, centerY] = EnemyGenWS.flags.emptyDimensionIsNorth ? EnemyGenWS.grinoLocationNorth : EnemyGenWS.grinoLocationSouth;
        EnemyGenWS.activeAoEs.push(
          Util.donutAoE(centerX, centerY, 75 /*目分量*/, 1000, "エンプティディメンションを踏みました")
        );

        // サンダーウイング着弾
        const tolerance = 40;
        const thunderWingR = 75; //適当
        const expectedPositions = EnemyGenWS.flags.emptyDimensionIsNorth ? 
            [[EnemyGenWS.grinoLocationNorth[0] + 50, EnemyGenWS.grinoLocationNorth[1] - 50], [EnemyGenWS.grinoLocationNorth[0] - 50, EnemyGenWS.grinoLocationNorth[1] - 50]]
            : 
            [[EnemyGenWS.grinoLocationSouth[0] - 50, EnemyGenWS.grinoLocationSouth[1] + 50], [EnemyGenWS.grinoLocationSouth[0] + 50, EnemyGenWS.grinoLocationSouth[1] + 50]]
        const myJob = EnemyGenWS.getMyJob();
        [0, 1].forEach((i) => {
          if (EnemyGenWS.flags.thunderWingTargets[i] == myJob) {
            EnemyGenWS.activeAoEs.push(
              Util.donutAoE(expectedPositions[i][0], expectedPositions[i][1], tolerance, 500, "サンダーウイングをぶちまけました(青範囲まで許容)")
            );
            const toleranceDiv = Util.addCircle(expectedPositions[i][0], expectedPositions[i][1], tolerance, "lightblue");
            Util.removeLater(toleranceDiv, 3000);
          } else {
            EnemyGenWS.activeAoEs.push(
              Util.circleAoE(expectedPositions[i][0], expectedPositions[i][1], thunderWingR, "サンダーウイングに巻き込まれました")
            );
            const aoeDiv = Util.addCircle(expectedPositions[i][0], expectedPositions[i][1], thunderWingR);
            Util.removeLater(aoeDiv, 500);
          }
        })
      }),
      event(21000, () => {
        //終わり
      }),
    ];
    EnemyGenWS.timeline = tl;
  },

  addTimeline: () => {
    const time = Date.now() - startTime;
    for (let i = 0; i < EnemyGenWS.timeline.length; i++) {
        const e = EnemyGenWS.timeline[i];
        if (i === EnemyGenWS.phase && time >= e.t) {
          e.f();
          EnemyGenWS.phase = i + 1;
          if (i === EnemyGenWS.timeline.length - 1) {
              gameActive = false;
              initialized = false;
          }
        }
    }
  },
  addHeavenLiquid: (n) => {
    const aoeRadius = 80; //目分量
    const [aoeX, aoeY] = EnemyGenWS.flags.heavenLiquidTarget ? 
      EnemyGenWS.heavenLiquidPos[n] :
      [
        Util.polar(300, Math.PI/12*11),
        Util.polar(300, Math.PI/12*11),
        Util.polar(300 - 80, Math.PI/12*11),
        Util.polar(300 - 80, Math.PI/12*11),
        Util.polar(300 - 160, Math.PI/12*11)
      ][n];
    const aoeDiv = Util.addCircle(aoeX, aoeY, aoeRadius);
    Util.removeLater(aoeDiv, 10000);
    setTimeout(() => {
      EnemyGenWS.activeAoEs.push(Util.circleAoE(aoeX, aoeY, aoeRadius, "ヘヴンリキッドを踏みました", 10000));
    }, 1800);
    // 次のヘヴンリキッドの位置予約
    EnemyGenWS.heavenLiquidPos[n+1] = [player.x, player.y];
  },

  addAlterFlare: (n) => {
    const aoeRadius = 120;
    const [aoeX, aoeY] = EnemyGenWS.flags.alterFlareTarget ? 
      [player.x, player.y] :
      [
        Util.polar(300, -Math.PI/12*9),
        Util.polar(300, -Math.PI/12*9),
        Math.random() < 0.5 ? Util.polar(300 - 120, -Math.PI/12*9) : Util.polar(300 - 180, Math.PI), // 嫌がらせ
        Math.random() < 0.5 ? Util.polar(300 - 120, -Math.PI/12*9) : Util.polar(300 - 180, Math.PI)  // 嫌がらせ
      ][n];
    const aoeDiv = Util.addCircle(aoeX, aoeY, aoeRadius);
    Util.removeLater(aoeDiv, 2900);
    setTimeout(() => {
      EnemyGenWS.activeAoEs.push(Util.circleAoE(aoeX, aoeY, aoeRadius, "アルターフレアを踏みました", 500));
    }, 2900);
  }
};
