
// 至天の陣：死刻
const EnemyGenShikoku = {
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
  elementsToBeRemovedOnInit: [],
  phase: 0,
  partyListDiv: undefined,
  castDiv: undefined,
  cast2Div: undefined,
  activeAoEs: undefined,
  dots: [],
  timeline: [],
  shinoSenkoku: undefined,
  gelickPos: undefined, // 0, 1, 2, 3

  initialize: () => {
    EnemyGenShikoku.phase = 0;
    EnemyGenShikoku.partyListDiv = undefined;
    EnemyGenShikoku.castDiv = undefined;
    EnemyGenShikoku.cast2Div = undefined;
    EnemyGenShikoku.activeAoEs = [];
    EnemyGenShikoku.dots = [];
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
      EnemyGenShikoku.addLine(j);
      EnemyGenShikoku.addLine2(j);
    }

    EnemyGenShikoku.shinoSenkoku = Util.shuffle([true, true, true, true, false, false, false, false]); // 0: 自分
    EnemyGenShikoku.elementsToBeRemovedOnInit.forEach(it => it.remove());
    EnemyGenShikoku.elementsToBeRemovedOnInit = [];
    EnemyGenShikoku.initFlags();
    EnemyGenShikoku.addPartyList();
    EnemyGenShikoku.addFieldMarkers();
    EnemyGenShikoku.addCastBar();
    EnemyGenShikoku.addCastBar2();
    EnemyGenShikoku.initTimeline();
    speed = 1.7; // <- 適当 please fix
  },

  initFlags: () => {
    EnemyGenShikoku.gelickPos = Math.floor(Math.random() * 4); // 0,1,2,3
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

    const myJob = EnemyGenShikoku.getMyJob();
    addJob(myJob);

    for (let i = 0; i < 8; i++) {
        const job = EnemyGenShikoku.partyMembers[i];
        if (job != myJob) {
            addJob(job);
        }
    }

    partyList.style.width = `200px`;
    partyList.style.left = 620;
    partyList.style.top = 140;
    partyList.style.display = "inline-block";
    partyList.style.position = "absolute";
    EnemyGenShikoku.partyListDiv = partyList;
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
    EnemyGenShikoku.castDiv = castDiv;
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
    EnemyGenShikoku.cast2Div = castDiv;
    fieldDom.appendChild(castDiv);
  },

  startCast: (name, duration) => {
    const castName = EnemyGenShikoku.castDiv.children[0];
    const castBar = EnemyGenShikoku.castDiv.children[1];
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
    const castName = EnemyGenShikoku.cast2Div.children[0];
    const castBar = EnemyGenShikoku.cast2Div.children[1];
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
    for (const aoe of EnemyGenShikoku.activeAoEs) {
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
    EnemyGenShikoku.activeAoEs = remainingAoEs;
  },

  maybeAddEnemy: () => {
    console.log
    if (!initialized) {
      EnemyGenShikoku.initialize();
      initialize();
    }
    EnemyGenShikoku.addTimeline();
    EnemyGenShikoku.checkAlive();
    EnemyGenShikoku.moveDots();
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
    EnemyGenShikoku.dots.push(dot);
    return dot;
  },

  moveDots: () => {
    // Looping backwards for popping items in the loop
    var i = EnemyGenShikoku.dots.length - 1;
    const now = Date.now();
    while(i >= 0) {
      const dot = EnemyGenShikoku.dots[i];
      if (now > dot.removeAt) {
        fieldDom.removeChild(dot);
        EnemyGenShikoku.dots.splice(i, 1);
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

  addSenkokuDebuff: () => {
    for (let i = 0; i < 8; i++) {
      const partyMemberDiv = EnemyGenShikoku.partyListDiv.children[i];
      if (!EnemyGenShikoku.shinoSenkoku[i]) {
        continue;
      }
      const debuffIcon = document.createElement("img");
      debuffIcon.src = `img/dragonSongWar/senkoku.png`;
      debuffIcon.style.height = "50px";
      partyMemberDiv.appendChild(debuffIcon);
      EnemyGenShikoku.elementsToBeRemovedOnInit.push(debuffIcon);
    }
  },

  heavyImpact: () => {
    const heavyImpactInnerBound = 300 / 9;
        const heavyImpactOuterBound = 300 / 9 * 6.3;
        const heavyImpactCenter = (heavyImpactInnerBound + heavyImpactOuterBound) / 2;
        const heavyImpactRadius = (heavyImpactOuterBound - heavyImpactInnerBound) / 2;
        const heavyImpactAngle = Math.PI / 2 * EnemyGenShikoku.gelickPos;
        const [heavyImpactX, heavyImpactY] = Util.polar(heavyImpactCenter, heavyImpactAngle);
        return {
          x: Math.round(heavyImpactX),
          y: Math.round(heavyImpactY),
          r: Math.round(heavyImpactRadius),
          angle: heavyImpactAngle,
        };
  },

  initTimeline: () => {
    const event = (t, f) => ({ t, f });
    const tl = [
      event(0, () => {
        // 敵出る、邪眼とヘヴィインパクトの位置決まる
        const { x, y, r } = EnemyGenShikoku.heavyImpact();
        const heavyImpactPrepElement = Util.addCircle(x, y, r, "rgba(255, 110, 110, 0.3)");
        Util.removeLater(heavyImpactPrepElement, 8000);
        const gelickElement = Util.addImage('img/enemy.png', x, y, r, r);
        Util.removeLater(gelickElement, 11000);
      }),
      event(2000, () => {
        // 巨大目玉 + 死の宣告付与
        EnemyGenShikoku.addSenkokuDebuff();
      }),
      event(9000, () => {
        // ヘヴィ1
        const { x, y, r } = EnemyGenShikoku.heavyImpact();
        EnemyGenShikoku.activeAoEs.push(Util.circleAoE(x, y, r, 'ヘヴィインパクトを踏みました'));
        const heavyImpactEffectElement = Util.addCircle(x, y, r);
        Util.removeLater(heavyImpactEffectElement, 200);
      }),
      event(11000, () => {
        // ヘヴィ2, 百雷、カータ、ツイスターダイブ、スピアオブハルオーネ
        // ヘヴィ
        const { x, y, r, angle } = EnemyGenShikoku.heavyImpact();
        EnemyGenShikoku.activeAoEs.push(Util.donutAoE(x, y, r, 2*r, 'ヘヴィインパクト2を踏みました'));
        const heavyImpactEffectElement = Util.addDonut(x, y, r, 2*r);
        Util.removeLater(heavyImpactEffectElement, 200);
        // 百雷
        const senkokuMe = EnemyGenShikoku.shinoSenkoku[0];
        const myIndex = EnemyGenShikoku.partyMembers.indexOf(EnemyGenShikoku.getMyJob());
        console.log(myIndex);
        console.log(senkokuMe);
        console.log(EnemyGenShikoku.shinoSenkoku.slice(1, 1+myIndex));
        const nanbanme = EnemyGenShikoku.shinoSenkoku.slice(1, 1+myIndex).filter((s) => s === senkokuMe).length; // 0-index
        console.log(nanbanme);
        const sr = 280;
        const m = Math.PI/24;
        const sankai = [
          Util.polar(sr, angle-m*5), Util.polar(sr, angle+m*10.5), Util.polar(sr,angle+m*13.5), Util.polar(sr, angle+m*19),
          Util.polar(sr, angle+m*5), Util.polar(sr, angle-m*10.5), Util.polar(sr,angle-m*13.5), Util.polar(sr, angle-m*19)
        ];
        const sankaiNatural = [
          '左1', '右2', '右3', '右4',
          '右1', '左2', '左3', '左4',
        ];
        const sankaiIndex = nanbanme + (senkokuMe ? 0 : 4); // 0-index
        const expectedPos = sankai[sankaiIndex];

        console.log(sankaiIndex);

        for (var i = 0; i < 8; i++) {
          if (i === sankaiIndex) continue;
          const [hyakuraiX, hyakuraiY] = sankai[i];
          EnemyGenShikoku.activeAoEs.push(Util.circleAoE(hyakuraiX, hyakuraiY, 50, `他人の百雷を踏みました。Expected: ${sankaiNatural[sankaiIndex]}`));
          const HyakuraiEffectElement = Util.addCircle(hyakuraiX, hyakuraiY, 100);
          Util.removeLater(HyakuraiEffectElement, 10000);
        }
      }),
      event(12000, () => {
        // ツイスター発生
      }),
      event(13000, () => {
        // ヘヴィ3
        const { x, y, r } = EnemyGenShikoku.heavyImpact();
        EnemyGenShikoku.activeAoEs.push(Util.donutAoE(x, y, 2*r, 3*r, 'ヘヴィインパクト3を踏みました'));
        const heavyImpactEffectElement = Util.addDonut(x, y, 2*r, 3*r);
        Util.removeLater(heavyImpactEffectElement, 200);
      }),
      event(15000, () => {
        // ヘヴィ4
        const { x, y, r } = EnemyGenShikoku.heavyImpact();
        EnemyGenShikoku.activeAoEs.push(Util.donutAoE(x, y, 3*r, 4*r, 'ヘヴィインパクト4を踏みました'));
        const heavyImpactEffectElement = Util.addDonut(x, y, 3*r, 4*r);
        Util.removeLater(heavyImpactEffectElement, 200);
      }),
      event(17000, () => {
        // ヘヴィ5
        const { x, y, r } = EnemyGenShikoku.heavyImpact();
        EnemyGenShikoku.activeAoEs.push(Util.donutAoE(x, y, 4*r, 5*r, 'ヘヴィインパクト5を踏みました'));
        const heavyImpactEffectElement = Util.addDonut(x, y, 4*r, 5*r);
        Util.removeLater(heavyImpactEffectElement, 200);
      }),
      event(19000, () => {
        // 鎖（○×△□）マーカー出現
      }),
      event(24000, () => {
        // フェイスアンムーブ・竜の邪眼着弾
      }),
      event(27000, () => {
        //終わり
      }),
    ];
    EnemyGenShikoku.timeline = tl;
  },

  addTimeline: () => {
    const time = Date.now() - startTime;
    for (let i = 0; i < EnemyGenShikoku.timeline.length; i++) {
        const e = EnemyGenShikoku.timeline[i];
        if (i === EnemyGenShikoku.phase && time >= e.t) {
          e.f();
          EnemyGenShikoku.phase = i + 1;
          if (i === EnemyGenShikoku.timeline.length - 1) {
              gameActive = false;
              initialized = false;
          }
        }
    }
  },
};
