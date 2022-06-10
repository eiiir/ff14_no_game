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
    activeAoEs: [],

    initDebuff: () => {
        const dwuRole = document.getElementById("dwu_role").selectedIndex;
        if (dwuRole != 0) {
            const fixedPatterns = [
                [[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, 'o'],[1, '↑'],[1, '↓'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, '↓'],[1, '↑'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[2, '↑'],[1, '↑'],[1, '↓'],[1, 'o'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[2, '↓'],[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[3, '↑'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↓'],[3, 'o']],
                [[3, 'o'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, '↓']],
                [[3, '↓'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, 'o']]
            ];
            const p = fixedPatterns[dwuRole-1];
            const me = p[0];
            const others = p.slice(1);
            console.log(me);
            console.log(others);
            Util.shuffle(others);
            EnemyGenDWU.debuff = [me, ...others];
        }
        else {
            const r = Math.floor(Math.random() * 2);
            const patterns = [
                [[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, '↓'],[3, 'o']]
            ];
            const pat = patterns[r];
            EnemyGenDWU.debuff = Util.shuffle(pat);
        }
        
    },

    getExpectedJob: (phase, place) => {
        const phaseToIndex = {
            1: 0,
            2: 1,
            3: 2,
        };
        const placeToIndex = {
            '↑': 0,
            'o': 1,
            '↓': 2
        };
        const orderedPartyMembers = [];
        const myJob = EnemyGenDWU.getMyJob();
        orderedPartyMembers.push(myJob);
        for (let i = 0; i < 8; i++) {
            const job = EnemyGenDWU.partyMembers[i];
            if (job != myJob) {
                orderedPartyMembers.push(job);
            }
        }
        const jobIndexes = [0, 1, 2, 3, 4, 5, 6, 7];
        jobIndexes.sort((a, b) => {
            const aDebuff = EnemyGenDWU.debuff[a];
            const bDebuff = EnemyGenDWU.debuff[b];
            const ap = phaseToIndex[aDebuff[0]] * 10 + placeToIndex[aDebuff[1]] + EnemyGenDWU.partyMembers.indexOf(orderedPartyMembers[a]) / 10;
            const bp = phaseToIndex[bDebuff[0]] * 10 + placeToIndex[bDebuff[1]] + EnemyGenDWU.partyMembers.indexOf(orderedPartyMembers[b]) / 10;
            return ap - bp;
        });
        console.log(jobIndexes);
        let t = phaseToIndex[phase] * 3 + placeToIndex[place]
        if (t > 4) {
            t -= 1;
        }
        return orderedPartyMembers[jobIndexes[t]];
    },

    initBiga: () => {
        EnemyGenDWU.biga = Math.floor(Math.random() * 2);
    },

    initAoEs: () => {
        activeAoEs = [];
    },

    getMyJob: () => {
        return document.getElementById("dwu_job").value;
    },

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

    addPartyList: () => {
        const partyList = document.createElement("div");

        const addJob = (job) => {
            const partyMemberDiv = document.createElement("div");
            const jobIcon = document.createElement("img");
            jobIcon.src = `img/jobIcons/${job}.png`;
            jobIcon.style.width = "50px";
            partyMemberDiv.appendChild(jobIcon);
            partyList.appendChild(partyMemberDiv);
        };

        const myJob = EnemyGenDWU.getMyJob();
        addJob(myJob);

        for (let i = 0; i < 8; i++) {
            const job = EnemyGenDWU.partyMembers[i];
            if (job != myJob) {
                addJob(job);
            }
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

    addDarkJump: (x, y, expectedJob) => {
        console.log("addDarkJump", x, y, expectedJob);
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        if (EnemyGenDWU.getMyJob() === expectedJob) {
            activeAoEs.push(Util.donutAoE(300 + x, 300 + y, Util.tile(4), Util.tile(999), 'ダークハイジャンプをまき散らしました'))
        } else {
            activeAoEs.push(Util.circleAoE(300 + x, 300 + y, Util.tile(4), 'ダークハイジャンプに巻き込まれました'))
        }
        Util.removeLater(effect, 1000);
    },

    addDarkDragonDivePrep: (x, y) => {
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4), 'rgba(0, 255, 0, 0.5)');
        Util.removeLater(effect, 1200);
    },

    addDarkDragonDiveHit: (x, y, expectedJob) => {
        console.log("addDarkDragonDiveHit", x, y, expectedJob);
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        if (EnemyGenDWU.getMyJob() === expectedJob) {
            activeAoEs.push(Util.donutAoE(300 + x, 300 + y, Util.tile(4), Util.tile(999), '塔を踏み忘れました'))
        } else {
            activeAoEs.push(Util.circleAoE(300 + x, 300 + y, Util.tile(4), '塔に巻き込まれました'))
        }
        Util.removeLater(effect, 1000);
    },

    addTargetCircle: () => {
        Util.strokeCircle(300, 300, Util.tile(7));
        Util.strokeCircle(300, 300, Util.tile(6));
    },
    
    addKoga: () => {
        const effect = Util.addCircle(300, 300, Util.tile(7));
        activeAoEs.push(Util.circleAoE(300, 300, Util.tile(7), '大車輪・咬牙を踏みました'))
        Util.removeLater(effect, 1000);
    },

    addJabi: () => {
        const effect = Util.addDonut(300, 300, Util.tile(7), Util.tile(20));
        activeAoEs.push(Util.donutAoE(300, 300, Util.tile(7), Util.tile(20), '大車輪・邪尾を踏みました'))
        Util.removeLater(effect, 100);
    },

    addGeirskogul: (x1, y1, x2, y2) => {
        const effect = Util.addBoldLine(300 + x1, 300 + y1, 300 + x2, 300 + y2, Util.tile(6), Util.tile(40));
        Util.removeLater(effect, 1000);
    },

    addGeirskogulAoE: (isUpper, isPrep) => {
        const reason = isPrep ? 'ゲイルスコグルを変な方向にまき散らしました' : 'ゲイルスコグルにあたったかも'
        const x1 = 0;
        const x2 = 999999;
        const y1 = isUpper ? 0 : 300;
        const y2 = isUpper ? 300 : 999999;
        activeAoEs.push(Util.rectAoe(x1, y1, x2, y2, reason));
    },

    initialize: () => {
        while (fieldDom.children.length > 2) {
            fieldDom.removeChild(fieldDom.children[1]);
        }
        EnemyGenDWU.initDebuff();
        EnemyGenDWU.initBiga();
        EnemyGenDWU.initAoEs();
        speed = 1.2;

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

        for (const aoe of activeAoEs) {
            if (aoe.collision(player.x, player.y)) {
                if (aoe.reason) {
                    alert(aoe.reason);
                }
                endGame();
            }
        }
        activeAoEs = [];
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
            EnemyGenDWU.addDarkJump(Util.tile(7), 0, EnemyGenDWU.getExpectedJob(1, '↑'));
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0, EnemyGenDWU.getExpectedJob(1, '↓'));
            EnemyGenDWU.addDarkJump(0, Util.tile(7), EnemyGenDWU.getExpectedJob(1, 'o'));
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
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0, EnemyGenDWU.getExpectedJob(3, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0, EnemyGenDWU.getExpectedJob(3, '↓'));
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7), EnemyGenDWU.getExpectedJob(3, 'o'));
            EnemyGenDWU.addGeirskogulAoE(true, true);
            EnemyGenDWU.phase = 6;
        }
        else if (EnemyGenDWU.phase === 6 && time >= 27000) {
            // ダーク2
            EnemyGenDWU.addDarkJump(Util.tile(7), 0, EnemyGenDWU.getExpectedJob(2, '↑'));
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0, EnemyGenDWU.getExpectedJob(2, '↓'));
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
            EnemyGenDWU.addGeirskogulAoE(false, false);
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
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0, EnemyGenDWU.getExpectedJob(1, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0, EnemyGenDWU.getExpectedJob(1, '↓'));
            EnemyGenDWU.addGeirskogulAoE(false, true);
            EnemyGenDWU.phase = 11;
        }
        else if (EnemyGenDWU.phase == 11 && time >= 37000) {
            // アイオブタイラント& ダーク3
            EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            EnemyGenDWU.addDarkJump(Util.tile(7), 0, EnemyGenDWU.getExpectedJob(3, '↑'));
            EnemyGenDWU.addDarkJump(Util.tile(-7), 0, EnemyGenDWU.getExpectedJob(3, '↓'));
            EnemyGenDWU.addDarkJump(0, Util.tile(7), EnemyGenDWU.getExpectedJob(3, 'o'));
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
            EnemyGenDWU.addGeirskogulAoE(true, false);
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
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(5), 0, EnemyGenDWU.getExpectedJob(2, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-5), 0, EnemyGenDWU.getExpectedJob(2, '↓'));
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7), EnemyGenDWU.getExpectedJob(1, 'o'));
            EnemyGenDWU.addGeirskogulAoE(true, true);
            EnemyGenDWU.phase = 15;
        }
        else if (EnemyGenDWU.phase === 15 && time >= 50700) {
            // ゲイル3
            EnemyGenDWU.addGeirskogul(Util.tile(5), 0, Util.tile(-7), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-5), 0, Util.tile(7) / Math.sqrt(2), Util.tile(7) / Math.sqrt(2));
            EnemyGenDWU.addGeirskogul(0, Util.tile(7),  Util.tile(7), 0);
            EnemyGenDWU.addGeirskogulAoE(false, false);
            EnemyGenDWU.phase = 16;
            gameActive = false;
            initialized = false;
        }
    }
};
