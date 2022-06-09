const EnemyGenDWU = {

    /**
     * 0: 初期状態
     * 1: 堕天のドラゴンダイブ詠唱開始
     * 2: (牙尾|尾牙)の連旋詠唱開始
     * 3: 強攻撃+ダーク1
     * 4: 牙尾
     * 5: 牙尾+塔1
     * 6: ダーク2
     * 7: ゲイル1
     * 8: 塔2
     * 9: 強攻撃+ダーク3
     * 10: 牙尾+ゲイル2
     * 11: 牙尾+塔3
     * 12: ゲイル3
     */
    phase: 0,
    role: 0,
    biga: 0,
    debuff: undefined,
    partyListDiv: undefined,
    castDiv: undefined,

    initDebuff: () => {
        const r = Math.floor(Math.random() * 2);
        const patterns = [
            [[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
            [[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, '↓'],[3, 'o']]
        ];
        const pat = patterns[r];
        EnemyGenDWU.debuff = Util.shuffle(pat);
    },

    initBiga: () => {
        EnemyGenDWU.biga = Math.floor(Math.random() * 2);
    },

    partyMembers: [
        "Warrior",
        "Paladin",
        "WhiteMage",
        "Sage",
        "Lancer",
        "RedMage",
        "Summoner",
        "Dancer"
    ],

    addPartyList: () => {
        const partyList = document.createElement("div");
        for (let i = 0; i < 8; i++) {
            const job = EnemyGenDWU.partyMembers[i];
            const partyMemberDiv = document.createElement("div");
            const jobIcon = document.createElement("img");
            jobIcon.src = `img/jobIcons/${job}.png`;
            jobIcon.style.width = "50px";
            partyMemberDiv.appendChild(jobIcon);
            partyList.appendChild(partyMemberDiv);
        }
        partyList.style.width = `200px`;
        partyList.style.left = 620;
        partyList.style.top = 100;
        partyList.style.display = "inline-block";
        partyList.style.position = "absolute";
        EnemyGenDWU.partyListDiv = partyList;
        fieldDom.appendChild(partyList);
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
        EnemyGenDWU.castDiv = castDiv;
        fieldDom.appendChild(castDiv);
    },

    startCast: (name, duration) => {
        const castName = EnemyGenDWU.castDiv.children[0];
        const castBar = EnemyGenDWU.castDiv.children[1];
        castName.textContent = name;
        const CastStartTime = Date.now();
        const interval = setInterval(() => {
            const progress = (Date.now() - CastStartTime) / duration;
            if (progress >= 0 && progress < 1) {
                const p100 = Math.floor(progress * 1000) / 10;
                console.log(p100);
                castBar.style.backgroundImage =
                  `linear-gradient(` +
                  `to right,` +
                  `rgba(255, 0, 0, 1),` +
                  `rgba(255, 0, 0, 1) ${p100}%,` +
                  `rgba(0, 0, 0, 0) ${p100}%,` +
                  `rgba(0, 0, 0, 0) 100%)`;
                console.log(castBar.style.backgroundImage);
            }
            if (progress >= 1) {
                clearInterval(interval);
                castName.textContent = "";
                castBar.style.backgroundImage = null;
            }
        }, 1000/30); // 30 FPS
    },

    addTargetingDebuff: () => {
        for (let i = 0; i < 8; i++) {
            const partyMemberDiv = EnemyGenDWU.partyListDiv.children[i];
            const debuffIcon1 = document.createElement("img");
            debuffIcon1.src = `img/dragonSongWar/target${EnemyGenDWU.debuff[i][0]}.png`;
            debuffIcon1.style.height = "50px";
            partyMemberDiv.appendChild(debuffIcon1);
        }
    },

    addDarkDebuff: () => {
        for (let i = 0; i < 8; i++) {
            const partyMemberDiv = EnemyGenDWU.partyListDiv.children[i];
            const debuffIcon2 = document.createElement("img");
            debuffIcon2.src = `img/dragonSongWar/${EnemyGenDWU.debuff[i][1]}.png`;
            debuffIcon2.style.height = "50px";
            partyMemberDiv.appendChild(debuffIcon2);
        }
    },

    addEyeOfTyrant: (x, y) => {
        const eyeOfTyrantEffect = Util.addCircle(300 + x, 300 + y, Util.tile(6));
        Util.removeLater(eyeOfTyrantEffect, 1000);
    },

    addDarkJump: (x, y) => {
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        Util.removeLater(effect, 1000);
    },

    addDarkDragonDivePrep: (x, y) => {
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4), 'rgba(0, 255, 0, 0.5)');
        Util.removeLater(effect, 1200);
    },

    addDarkDragonDiveHit: (x, y) => {
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        Util.removeLater(effect, 1000);
    },

    addTargetCircle: () => {
        Util.strokeCircle(300, 300, Util.tile(7));
        Util.strokeCircle(300, 300, Util.tile(6));
    },
    
    addKoga: () => {
        const effect = Util.addCircle(300, 300, Util.tile(7));
        Util.removeLater(effect, 1000);
    },

    addJabi: () => {
        const effect = Util.addDonut(300, 300, Util.tile(7), Util.tile(20));
        Util.removeLater(effect, 1000);
    },

    addGeirskogul: (x1, y1, x2, y2) => {
        const effect = Util.addBoldLine(300 + x1, 300 + y1, 300 + x2, 300 + y2, Util.tile(6), Util.tile(40));
        Util.removeLater(effect, 1000);
    },

    initialize: () => {
        while (fieldDom.children.length > 2) {
            fieldDom.removeChild(fieldDom.children[1]);
        }
        EnemyGenDWU.initDebuff();
        EnemyGenDWU.initBiga();
        speed = 1.2;

        //Util.addDonut(Util.tile(20), Util.tile(20), Util.tile(5), Util.tile(10));
        //Util.addCircle(Util.tile(20), Util.tile(20), Util.tile(5));
        //Util.addBoldLine(Util.tile(20), Util.tile(20), Util.tile(30), Util.tile(20), Util.tile(3), Util.tile(40));
        EnemyGenDWU.addTargetCircle();
        EnemyGenDWU.addPartyList();
        EnemyGenDWU.addCastBar();
    },

    maybeAddEnemy: (fieldDom) => {
        if (!initialized) {
            EnemyGenDWU.initialize(fieldDom);
            initialize();
      }
      EnemyGenDWU.addTimeline();
      EnemyGenDWU.checkAlive();
    },

    checkAlive: () => {
        const x = Util.pixelToMeter(player.x - 300);
        const y = Util.pixelToMeter(player.y - 300);

        // 外周
        if (x < -20  || x > 20 || y < -20  || y > 20) {
            endGame();
        }
    },

    /**
     * 0: 初期状態
     * 1: 堕天のドラゴンダイブ詠唱開始
     * 2: (牙尾|尾牙)の連旋詠唱開始
     * 3: 強攻撃+ダーク1
     * 4: 牙尾
     * 5: 塔1出現
     * 6: 牙尾+塔1
     * 7: ダーク2
     * 8: ゲイル1
     * 9: 塔2出現
     * 10: 塔2
     * 11: 強攻撃+ダーク3
     * 12: 牙尾+ゲイル2
     * 13: 塔3出現
     * 14: 牙尾+塔3
     * 15: ゲイル3
     */
    addTimeline: () => {
        const time = Date.now() - startTime;

        if (EnemyGenDWU.phase === 0 && time >= 3000) {
            // ターゲッティングデバフ付与
            EnemyGenDWU.startCast("堕天のドラゴンダイブ", 6900); // 表示のみ100ms短
            EnemyGenDWU.addTargetingDebuff();
            EnemyGenDWU.phase = 1;
        }
        else if (EnemyGenDWU.phase === 1 && time >= 10000) {
            // ジャンプ系デバフ付与
            EnemyGenDWU.startCast(["牙尾の連旋", "尾牙の連旋"][EnemyGenDWU.biga], 6900); // 表示のみ100ms短
            EnemyGenDWU.addDarkDebuff();
            EnemyGenDWU.phase = 2;
        }
        else if (EnemyGenDWU.phase === 2 && time >= 17000) {
            // アイオブタイラント&ダーク1
            EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            EnemyGenDWU.addDarkJump(Util.tile(7), 0);
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0);
            EnemyGenDWU.addDarkJump(0, Util.tile(7));
            EnemyGenDWU.phase = 3;
        }
        else if (EnemyGenDWU.phase === 3 && time >= 20300) {
            // 牙 or 尾
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addKoga();
            } else {
                EnemyGenDWU.addJabi();
            }
            EnemyGenDWU.phase = 4;
        }
        else if (EnemyGenDWU.phase === 4 && time >= 22400) {
            // 塔1出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-5), 0);
            EnemyGenDWU.addDarkDragonDivePrep(0, Util.tile(7));
            EnemyGenDWU.phase = 5;
        }
        else if (EnemyGenDWU.phase === 5 && time >= 23600) {
            // 牙尾+塔1
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addJabi();
            } else {
                EnemyGenDWU.addKoga();
            }
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0);
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7));
            EnemyGenDWU.phase = 6;
        }
        else if (EnemyGenDWU.phase === 6 && time >= 27000) {
            // ダーク2
            EnemyGenDWU.addDarkJump(Util.tile(7), 0);
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0);
            EnemyGenDWU.phase = 7;
        }
        else if (EnemyGenDWU.phase === 7 && time >= 30000) {
            // 牙尾２回目詠唱
            EnemyGenDWU.startCast(["尾牙の連旋", "牙尾の連旋"][EnemyGenDWU.biga], 6900); // 表示のみ100ms短
            EnemyGenDWU.phase = 8;
        }
        else if (EnemyGenDWU.phase == 8 && time >= 30700) {
            // ゲイル1
            EnemyGenDWU.addGeirskogul(Util.tile(5), 0, Util.tile(-7), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-5), 0, Util.tile(7) / Math.sqrt(2), Util.tile(7) / Math.sqrt(2));
            EnemyGenDWU.addGeirskogul(0, Util.tile(7),  Util.tile(7), 0);
            EnemyGenDWU.phase = 9;
        }
        else if (EnemyGenDWU.phase == 9 && time >= 32400) {
            // 塔2出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-5), 0);
            EnemyGenDWU.phase = 10;
        }
        else if (EnemyGenDWU.phase == 10 && time >= 33600) {
            // 塔2
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0);
            EnemyGenDWU.phase = 11;
        }
        else if (EnemyGenDWU.phase == 11 && time >= 37000) {
            // アイオブタイラント& ダーク3
            EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            EnemyGenDWU.addDarkJump(Util.tile(7), 0);
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0);
            EnemyGenDWU.addDarkJump(0, Util.tile(7));
            EnemyGenDWU.phase = 12;
        }
        else if (EnemyGenDWU.phase == 12 && time >= 40300) {
            // 牙尾&ゲイル2
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addJabi();
            } else {
                EnemyGenDWU.addKoga();
            }
            EnemyGenDWU.addGeirskogul(Util.tile(5), 0, Util.tile(-7), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-5), 0, 0, Util.tile(-7));
            EnemyGenDWU.phase = 13;
        }
        else if (EnemyGenDWU.phase == 13 && time >= 42400) {
            // 塔3出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-5), 0);
            EnemyGenDWU.addDarkDragonDivePrep(0, Util.tile(7));
            EnemyGenDWU.phase = 14;
        }
        else if (EnemyGenDWU.phase == 14 && time >= 43600) {
            // 牙尾&塔3
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addKoga();
            } else {
                EnemyGenDWU.addJabi();
            }
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0);
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0);
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7));
            EnemyGenDWU.phase = 15;
        }
        else if (EnemyGenDWU.phase === 15 && time >= 50700) {
            // ゲイル3
            EnemyGenDWU.addGeirskogul(Util.tile(5), 0, Util.tile(-7), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-5), 0, Util.tile(7) / Math.sqrt(2), Util.tile(7) / Math.sqrt(2));
            EnemyGenDWU.addGeirskogul(0, Util.tile(7),  Util.tile(7), 0);
            EnemyGenDWU.phase = 16;
        }
    }
};
