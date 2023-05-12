
// DT = Death Time (至天の陣：死刻)
const EnemyGenDT = {
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
  eyeLocations: [[300, 0], [520, 80], [600, 300], [520, 520], [300, 600], [80, 520], [0, 300], [80, 80]],
  thunderLocations: [
    []
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

  initialize: () => {
    EnemyGenDT.phase = 0;
    EnemyGenDT.partyListDiv = undefined;
    EnemyGenDT.castDiv = undefined;
    EnemyGenDT.cast2Div = undefined;
    EnemyGenDT.activeAoEs = [];
    EnemyGenDT.dots = [];
    fieldDom.style.borderRadius = "50%";
    document.getElementById("target-skywardleap").style.display = 'none';
    document.getElementById("target-cauterize").style.display = 'none';
    for (dom of fieldDom.childNodes) {
      if (dom != timerDom && dom != playerDom) {
        fieldDom.removeChild(dom);
      }
    }
    EnemyGenDT.initFlags();
    EnemyGenDT.elementsToBeRemovedOnInit.forEach(it => it.remove());
    EnemyGenDT.elementsToBeRemovedOnInit = [];
    EnemyGenDT.addPartyList();
    EnemyGenDT.addFieldMarkers();
    EnemyGenDT.addCastBar();
    EnemyGenDT.addCastBar2();
    EnemyGenDT.initTimeline();
    speed = 1.7; // <- 適当 please fix
  },

  initFlags: () => {
    const flags = {};
    // 邪眼の位置
    flags.eyeLocation0 = Math.floor(Math.random() * 8);
    flags.eyeLocation1 = (flags.eyeLocation0 + Math.floor(Math.random() * 6) + 1) % 8;

    // 死の宣告がつくジョブ
    flags.doomTargets = Util.shuffle([...EnemyGenDT.partyMembers]).slice(0, 4);
    flags.doomTargets.sort((a, b) => EnemyGenDT.partyMembers.indexOf(a) - EnemyGenDT.partyMembers.indexOf(b));

    // 
    const forcedFlags = EnemyGenDT.getForcedFlags();
    console.debug("forcedFlags: ", forcedFlags);
    EnemyGenDT.flags = {
      ...flags,
      ...forcedFlags,
    };
    EnemyGenDT.flags.thunderWingTargets.sort((a, b) => EnemyGenDT.partyMembers.indexOf(a) - EnemyGenDT.partyMembers.indexOf(b));
    console.debug("flags: ", EnemyGenDT.flags);
  },

  getForcedFlags: () => {
    const forcedFlags = {};
    return forcedFlags;
  },

  initTimeline: () => {
    const event = (t, f) => ({ t, f });
    /**
     * Timeline
     * 0 敵視リスト更新（視線も出る）
     * 2 死の宣告付与（26秒）
     * 3 ヘヴィインパクト詠唱開始（1段目の範囲出る）
     * 5 百雷・ツイスターダイブ・カータライズ・サルヴェーションXXX・スピアオブハルオーネ詠唱開始
     * 9 ヘヴィインパクト1段目着弾（範囲75-100くらい）1段目範囲消える
     * 11 百雷など着弾（範囲75くらい？）、ツイスター位置確定、半分の百雷範囲残る
     * 12 ツイスター発生 
     * 13 ヘヴィインパクト2段目着弾
     * 15 ヘヴィインパクト3段目着弾
     * 17 ヘヴィインパクト4段目着弾
     * 19 鎖（○×△□）マーカー出現、竜の邪眼・ヘヴンフレイム詠唱開始
     * 20 フェイスアンムーブ・ホーリーメテオ詠唱開始
     * 24 フェイスアンムーブ・竜の邪眼着弾
     * 25 吹き飛ばし始め
     * 26 吹き飛ばし終わり
     * 27 ヘヴンフレイム着弾
     * 28 死の宣告時間切れ
     * 30 流星の聖紋x8 出現
     */
    const tl = [
      event(0, () => {
        // 邪眼が出現
        Util.addImage("img/petri.png", EnemyGenDT.eyeLocations[EnemyGenDT.flags.eyeLocation0][0], EnemyGenDT.eyeLocations[EnemyGenDT.flags.eyeLocation0][1], 30, 30);
        Util.addImage("img/petri.png", EnemyGenDT.eyeLocations[EnemyGenDT.flags.eyeLocation1][0], EnemyGenDT.eyeLocations[EnemyGenDT.flags.eyeLocation1][1], 30, 30);
        // グリノー出現
        Util.addImage("img/grinnaux.png", 300, 170, 150, 150);
        Util.addCircle(300, 120, 5, "red");
      }),
      event(2000, () => {
        // 死の宣告付与
        EnemyGenDT.addDoomDebuf();
      }),
      event(3000, () => {
        // ヘヴィインパクト詠唱開始
        EnemyGenDT.startCast("ヘヴィインパクト", 6000);
        // 1段目の範囲出る
        Util.removeLater(Util.addCircle(300, 120, 80), 6000);
      }),
      event(5000, () => {
        // 百雷など詠唱開始
        EnemyGenDT.startCast2("百雷ほか", 6000);
      }),
      event(9000, () => {
        // ヘヴィインパクト一段目着弾
        EnemyGenDT.activeAoEs.push(Util.circleAoE(300, 120, 80, "ヘヴィインパクトを踏みました"));
      }),
      event(11000, () => {
        // 百雷着弾

        // カータライズ着弾
        // ツイスターダイブ・スピアオブハルオーネ着弾
        // 死の宣告じゃない側の床が残る
        // ツイスター位置確定
      }),
      event(12000, () => {
        // ツイスター出現
      }),
      event(13000, () => {
        // ヘヴィインパクト2段目着弾
      }),
      event(15000, () => {
        // ヘヴィインパクト3段目着弾
        // 
      }),
      event(17000, () => {
        // ヘヴィインパクト4段目着弾
        // 
      }),
      event(19000, () => {
        // 鎖（○×△□）マーカー出現
        // 竜の邪眼・ヘヴンフレイム詠唱開始
      }),
      event(24000, () => {
        // フェイスアンムーブ・ホーリーメテオ詠唱開始
      }),
      event(25000, () => {
        // 吹き飛ばし始め
      }),
      event(26000, () => {
        // 吹き飛ばし終わり
      }),
      event(27000, () => {
        // ヘヴンフレイム着弾
      }),
      event(28000, () => {
        // 死の宣告時間切れ
      }),
      event(30000, () => {
        // 終わり
      }),
    ];
    EnemyGenDT.timeline = tl;
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

    const myJob = EnemyGenDT.getMyJob();
    addJob(myJob);

    for (let i = 0; i < 8; i++) {
        const job = EnemyGenDT.partyMembers[i];
        if (job != myJob) {
            addJob(job);
        }
    }

    partyList.style.width = `200px`;
    partyList.style.left = 620;
    partyList.style.top = 140;
    partyList.style.display = "inline-block";
    partyList.style.position = "absolute";
    EnemyGenDT.partyListDiv = partyList;
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
    EnemyGenDT.castDiv = castDiv;
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
    EnemyGenDT.cast2Div = castDiv;
    fieldDom.appendChild(castDiv);
  },

  startCast: (name, duration) => {
    const castName = EnemyGenDT.castDiv.children[0];
    const castBar = EnemyGenDT.castDiv.children[1];
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
    const castName = EnemyGenDT.cast2Div.children[0];
    const castBar = EnemyGenDT.cast2Div.children[1];
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
    for (const aoe of EnemyGenDT.activeAoEs) {
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
    EnemyGenDT.activeAoEs = remainingAoEs;
  },

  maybeAddEnemy: () => {
    if (!initialized) {
      EnemyGenDT.initialize();
      initialize();
    }
    EnemyGenDT.addTimeline();
    EnemyGenDT.checkAlive();
    EnemyGenDT.moveDots();
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
    EnemyGenDT.dots.push(dot);
    return dot;
  },

  moveDots: () => {
    // Looping backwards for popping items in the loop
    var i = EnemyGenDT.dots.length - 1;
    const now = Date.now();
    while(i >= 0) {
      const dot = EnemyGenDT.dots[i];
      if (now > dot.removeAt) {
        fieldDom.removeChild(dot);
        EnemyGenDT.dots.splice(i, 1);
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

  addDoomDebuf: () => {
    for (let i = 0; i < 8; i++) {
      const partyMemberDiv = EnemyGenDT.partyListDiv.children[i];
      const job = partyMemberDiv.getAttribute('data-job');
      if (!EnemyGenDT.flags.doomTargets.includes(job)) {
        continue;
      }
      const debuffIcon = document.createElement("img");
      debuffIcon.src = `img/doom.png`;
      debuffIcon.style.height = "50px";
      partyMemberDiv.appendChild(debuffIcon);
      EnemyGenDT.elementsToBeRemovedOnInit.push(debuffIcon);
    }
  },

  addTimeline: () => {
    const time = Date.now() - startTime;
    for (let i = 0; i < EnemyGenDT.timeline.length; i++) {
        const e = EnemyGenDT.timeline[i];
        if (i === EnemyGenDT.phase && time >= e.t) {
          e.f();
          EnemyGenDT.phase = i + 1;
          if (i === EnemyGenDT.timeline.length - 1) {
              gameActive = false;
              initialized = false;
          }
        }
    }
  },
  addHeavenLiquid: () => {
    if (!EnemyGenDT.flags.heavenLiquidTarget) {
      return;
    }
    const aoeRadius = 75; //目分量
    const [aoeX, aoeY] = [player.x, player.y];
    const aoeDiv = Util.addCircle(aoeX, aoeY, aoeRadius);
    Util.removeLater(aoeDiv, 10000);
    setTimeout(() => {
      EnemyGenDT.activeAoEs.push(Util.circleAoE(aoeX, aoeY, aoeRadius, "ヘヴンリキッドを踏みました", 10000));
    }, 1000);
  }
};
